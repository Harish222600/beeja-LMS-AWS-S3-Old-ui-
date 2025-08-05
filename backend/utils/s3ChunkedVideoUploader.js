const { 
    s3Client, 
    BUCKET_NAME, 
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    getPublicUrl
} = require('../config/awsS3');
const { CHUNKED_UPLOAD_CONFIG } = require('../config/s3Storage');
const { extractVideoMetadata } = require('./videoMetadata');
const ChunkedVideo = require('../models/chunkedVideo');
const path = require('path');
const crypto = require('crypto');

// S3 Multipart upload for large videos
const uploadVideoInChunks = async (file, folder = 'videos') => {
    let uploadId = null;
    let key = null;
    
    try {
        console.log('🎬 Starting S3 multipart upload...');
        
        // Generate unique key
        key = generateUniqueFilename(file.originalname, folder);
        
        // Initialize multipart upload
        const createParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: file.mimetype,
            CacheControl: 'max-age=31536000'
        };

        const createCommand = new CreateMultipartUploadCommand(createParams);
        const createResult = await s3Client.send(createCommand);
        uploadId = createResult.UploadId;

        console.log(`📝 Created multipart upload with ID: ${uploadId}`);

        // Save chunked video record
        const chunkedVideo = new ChunkedVideo({
            videoId: crypto.randomBytes(16).toString('hex'),
            originalFilename: file.originalname,
            s3Key: key,
            uploadId: uploadId,
            totalSize: file.size,
            mimetype: file.mimetype,
            folder: folder
        });
        await chunkedVideo.save();

        const fileBuffer = file.buffer;
        const chunkSize = CHUNKED_UPLOAD_CONFIG.CHUNK_SIZE;
        const totalChunks = Math.ceil(fileBuffer.length / chunkSize);
        
        console.log(`📦 Uploading ${totalChunks} parts to S3...`);

        const parts = [];
        const concurrencyLimit = 3; // Limit concurrent uploads
        
        // Upload parts in batches to avoid overwhelming S3
        for (let i = 0; i < totalChunks; i += concurrencyLimit) {
            const batch = [];
            
            for (let j = i; j < Math.min(i + concurrencyLimit, totalChunks); j++) {
                const start = j * chunkSize;
                const end = Math.min(start + chunkSize, fileBuffer.length);
                const chunk = fileBuffer.slice(start, end);
                
                batch.push(uploadPart(BUCKET_NAME, key, uploadId, j + 1, chunk));
            }
            
            const batchResults = await Promise.all(batch);
            parts.push(...batchResults);
            
            console.log(`✅ Uploaded batch ${Math.floor(i / concurrencyLimit) + 1}/${Math.ceil(totalChunks / concurrencyLimit)}`);
        }

        // Sort parts by part number
        parts.sort((a, b) => a.PartNumber - b.PartNumber);

        // Complete multipart upload
        const completeParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: { Parts: parts }
        };

        const completeCommand = new CompleteMultipartUploadCommand(completeParams);
        await s3Client.send(completeCommand);

        const publicUrl = getPublicUrl(key);

        // Update chunked video record
        chunkedVideo.isComplete = true;
        chunkedVideo.finalVideoUrl = publicUrl;
        chunkedVideo.completedAt = new Date();
        await chunkedVideo.save();

        console.log('✅ S3 multipart upload completed successfully');

        // Extract video metadata
        let duration = 0;
        try {
            const videoMetadata = await extractVideoMetadata(file.buffer, {
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            });
            duration = videoMetadata.duration;
        } catch (durationError) {
            console.warn('⚠️ Failed to extract video duration:', durationError.message);
        }

        return {
            secure_url: publicUrl,
            public_id: key,
            format: path.extname(file.originalname).substring(1),
            resource_type: 'video',
            size: file.size,
            original_filename: file.originalname,
            duration: duration,
            isChunked: true,
            videoId: chunkedVideo.videoId
        };

    } catch (error) {
        console.error('Error in S3 multipart upload:', error);
        
        // Abort multipart upload if it was created
        if (uploadId && key) {
            try {
                const abortParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    UploadId: uploadId
                };
                const abortCommand = new AbortMultipartUploadCommand(abortParams);
                await s3Client.send(abortCommand);
                console.log('🗑️ Aborted incomplete multipart upload');
            } catch (abortError) {
                console.error('Error aborting multipart upload:', abortError);
            }
        }
        
        throw new Error(`S3 multipart upload failed: ${error.message}`);
    }
};

const uploadPart = async (bucket, key, uploadId, partNumber, chunk) => {
    const maxRetries = CHUNKED_UPLOAD_CONFIG.MAX_RETRIES;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            const uploadParams = {
                Bucket: bucket,
                Key: key,
                PartNumber: partNumber,
                UploadId: uploadId,
                Body: chunk
            };

            const command = new UploadPartCommand(uploadParams);
            const result = await s3Client.send(command);

            return {
                ETag: result.ETag,
                PartNumber: partNumber
            };
        } catch (error) {
            retries++;
            console.warn(`⚠️ Part ${partNumber} upload failed (attempt ${retries}/${maxRetries}):`, error.message);
            
            if (retries >= maxRetries) {
                throw error;
            }
            
            // Wait before retrying
            const delay = CHUNKED_UPLOAD_CONFIG.RETRY_DELAY_BASE * Math.pow(2, retries - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    // This should never be reached, but just in case
    throw new Error(`Failed to upload part ${partNumber} after ${maxRetries} retries`);
};

const generateUniqueFilename = (originalName, folder = '') => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '_');
    
    const filename = `${baseName}_${timestamp}_${randomString}${extension}`;
    return folder ? `${folder}/${filename}` : filename;
};

// Clean up incomplete uploads (utility function)
const cleanupIncompleteUploads = async () => {
    try {
        console.log('🧹 Cleaning up incomplete S3 multipart uploads...');
        
        const incompleteUploads = await ChunkedVideo.find({ 
            isComplete: false,
            createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
        });

        for (const upload of incompleteUploads) {
            try {
                // Abort the multipart upload
                const abortParams = {
                    Bucket: BUCKET_NAME,
                    Key: upload.s3Key,
                    UploadId: upload.uploadId
                };
                const abortCommand = new AbortMultipartUploadCommand(abortParams);
                await s3Client.send(abortCommand);
                
                // Remove from database
                await ChunkedVideo.findByIdAndDelete(upload._id);
                
                console.log(`✅ Cleaned up incomplete upload: ${upload.originalFilename}`);
            } catch (cleanupError) {
                console.error(`Error cleaning up upload ${upload.videoId}:`, cleanupError);
            }
        }
        
        console.log('✅ Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
};

module.exports = {
    uploadVideoInChunks,
    cleanupIncompleteUploads
};
