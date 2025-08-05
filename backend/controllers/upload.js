const { s3Client } = require('../config/awsS3');
const { getS3BucketForFileType, validateFile } = require('../config/s3Storage');
const { extractVideoMetadata } = require('../utils/videoMetadata');
const { GetObjectCommand, DeleteObjectCommand, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');

// In-memory store for upload tracking (in production, use Redis or database)
const uploadTracker = new Map();

/**
 * Generate signed URL for direct upload to S3
 */
const generateSignedUrl = async (req, res) => {
  try {
    console.log('🔐 Generating signed URL for direct upload...');
    
    const { fileName, fileSize, mimeType, folder = '' } = req.body;
    
    if (!fileName || !fileSize || !mimeType) {
      return res.status(400).json({
        success: false,
        message: 'fileName, fileSize, and mimeType are required'
      });
    }

    // Generate unique upload ID and filename
    const uploadId = crypto.randomUUID();
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, extension).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${baseName}_${timestamp}_${randomString}${extension}`;
    
    // Determine bucket
    const bucket = getS3BucketForFileType(mimeType, folder, fileName);
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
    
    // Validate file (mock file object for validation)
    const mockFile = {
      mimetype: mimeType,
      size: fileSize,
      originalname: fileName
    };
    
    const validation = validateFile(mockFile, bucket);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: `File validation failed: ${validation.errors.join(', ')}`
      });
    }

    // Generate signed URL for upload (24 hour expiry)
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
      ContentType: mimeType,
      ContentLength: fileSize
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 24 * 60 * 60 }); // 24 hours

    // Store upload metadata for tracking
    const uploadMetadata = {
      uploadId,
      fileName,
      uniqueFileName,
      fileSize,
      mimeType,
      bucket,
      filePath,
      folder,
      userId: req.user.id,
      status: 'pending',
      createdAt: new Date(),
      signedUrl,
      isVideo: validation.isVideo,
      willUseResumableUpload: validation.willUseResumableUpload
    };

    uploadTracker.set(uploadId, uploadMetadata);

    console.log('✅ Signed URL generated successfully:', {
      uploadId,
      bucket,
      filePath,
      isVideo: validation.isVideo
    });

    res.status(200).json({
      success: true,
      data: {
        uploadId,
        signedUrl,
        bucket,
        filePath,
        uniqueFileName,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        uploadMetadata: {
          isVideo: validation.isVideo,
          willUseResumableUpload: validation.willUseResumableUpload,
          detectedAsVideo: validation.detectedAsVideo
        }
      },
      message: 'Signed URL generated successfully'
    });

  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signed URL',
      error: error.message
    });
  }
};

/**
 * Handle upload completion and metadata processing
 */
const handleUploadComplete = async (req, res) => {
  try {
    console.log('🎯 Handling upload completion...');
    
    const { uploadId } = req.body;
    
    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: 'uploadId is required'
      });
    }

    // Get upload metadata
    const uploadMetadata = uploadTracker.get(uploadId);
    if (!uploadMetadata) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found or expired'
      });
    }

    // Verify the file was actually uploaded
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: uploadMetadata.bucket,
        Key: uploadMetadata.filePath
      });
      
      await s3Client.send(headCommand);
    } catch (error) {
      console.error('File not found after upload:', error);
      return res.status(400).json({
        success: false,
        message: 'File not found. Upload may have failed.'
      });
    }

    // Get public URL
    const publicUrl = `https://${uploadMetadata.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadMetadata.filePath}`;

    // Prepare result object
    const result = {
      success: true,
      uploadId,
      secure_url: publicUrl,
      public_id: uploadMetadata.filePath,
      bucket: uploadMetadata.bucket,
      path: uploadMetadata.filePath,
      size: uploadMetadata.fileSize,
      original_filename: uploadMetadata.fileName,
      format: path.extname(uploadMetadata.fileName).substring(1),
      resource_type: uploadMetadata.isVideo ? 'video' : 
                    uploadMetadata.mimeType.startsWith('image/') ? 'image' : 'raw',
      upload_type: 'direct',
      created_at: uploadMetadata.createdAt
    };

    // Extract video metadata if it's a video
    if (uploadMetadata.isVideo) {
      try {
        console.log('🎬 Extracting video metadata...');
        
        // Download the file to extract metadata
        const getCommand = new GetObjectCommand({
          Bucket: uploadMetadata.bucket,
          Key: uploadMetadata.filePath
        });
        
        const response = await s3Client.send(getCommand);
        const videoBuffer = Buffer.from(await response.Body.transformToByteArray());
        
        const videoMetadata = await extractVideoMetadata(videoBuffer, {
          originalname: uploadMetadata.fileName,
          size: uploadMetadata.fileSize,
          mimetype: uploadMetadata.mimeType
        });
        
        result.duration = videoMetadata.duration;
        result.metadata = videoMetadata;
        console.log(`✅ Video duration extracted: ${videoMetadata.duration}s`);
      } catch (metadataError) {
        console.warn('⚠️ Failed to extract video metadata:', metadataError.message);
        result.duration = 0;
      }
    }

    // Update upload status
    uploadMetadata.status = 'completed';
    uploadMetadata.completedAt = new Date();
    uploadMetadata.result = result;
    uploadTracker.set(uploadId, uploadMetadata);

    console.log('✅ Upload completion handled successfully:', {
      uploadId,
      secure_url: result.secure_url,
      duration: result.duration
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Upload completed successfully'
    });

  } catch (error) {
    console.error('❌ Error handling upload completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process upload completion',
      error: error.message
    });
  }
};

/**
 * Get upload status and metadata
 */
const getUploadStatus = async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    const uploadMetadata = uploadTracker.get(uploadId);
    if (!uploadMetadata) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found or expired'
      });
    }

    // Check if user owns this upload
    if (uploadMetadata.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        uploadId,
        status: uploadMetadata.status,
        fileName: uploadMetadata.fileName,
        fileSize: uploadMetadata.fileSize,
        mimeType: uploadMetadata.mimeType,
        createdAt: uploadMetadata.createdAt,
        completedAt: uploadMetadata.completedAt,
        result: uploadMetadata.result
      }
    });

  } catch (error) {
    console.error('❌ Error getting upload status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload status',
      error: error.message
    });
  }
};

/**
 * Delete uploaded file
 */
const deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    const uploadMetadata = uploadTracker.get(uploadId);
    if (!uploadMetadata) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Check if user owns this upload
    if (uploadMetadata.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: uploadMetadata.bucket,
        Key: uploadMetadata.filePath
      });
      
      await s3Client.send(deleteCommand);
    } catch (deleteError) {
      console.error('Error deleting file from S3:', deleteError);
      // Continue anyway to clean up metadata
    }

    // Remove from tracker
    uploadTracker.delete(uploadId);

    console.log('✅ Upload deleted successfully:', uploadId);

    res.status(200).json({
      success: true,
      message: 'Upload deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete upload',
      error: error.message
    });
  }
};

/**
 * Cleanup expired uploads (should be called periodically)
 */
const cleanupExpiredUploads = async () => {
  try {
    console.log('🧹 Cleaning up expired uploads...');
    
    const now = new Date();
    const expiredUploads = [];
    
    for (const [uploadId, metadata] of uploadTracker.entries()) {
      // Remove uploads older than 24 hours that are not completed
      const ageHours = (now - metadata.createdAt) / (1000 * 60 * 60);
      if (ageHours > 24 && metadata.status !== 'completed') {
        expiredUploads.push(uploadId);
      }
    }

    for (const uploadId of expiredUploads) {
      const metadata = uploadTracker.get(uploadId);
      
      // Try to delete the file if it exists
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: metadata.bucket,
          Key: metadata.filePath
        });
        
        await s3Client.send(deleteCommand);
      } catch (error) {
        console.warn(`Failed to delete expired upload file: ${uploadId}`, error);
      }
      
      uploadTracker.delete(uploadId);
    }

    if (expiredUploads.length > 0) {
      console.log(`✅ Cleaned up ${expiredUploads.length} expired uploads`);
    }

  } catch (error) {
    console.error('❌ Error cleaning up expired uploads:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredUploads, 60 * 60 * 1000);

module.exports = {
  generateSignedUrl,
  handleUploadComplete,
  getUploadStatus,
  deleteUpload,
  cleanupExpiredUploads
};
