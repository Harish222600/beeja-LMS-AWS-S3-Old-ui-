const { s3Client, BUCKET_NAME, PutObjectCommand, DeleteObjectCommand, getPublicUrl } = require('../config/awsS3');
const { S3_FOLDERS, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES, CHUNKED_UPLOAD_CONFIG, getS3FolderForFileType, validateFile, isVideoFile } = require('../config/s3Storage');
const { uploadVideoInChunks } = require('./s3ChunkedVideoUploader');
const { extractVideoMetadata } = require('./videoMetadata');
const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');

// Main upload function (replaces uploadFileToSupabase)
const uploadFileToS3 = async (file, folder = '', options = {}) => {
    try {
        console.log('🔧 Starting file upload to S3');
        
        // Validate file
        if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
            throw new Error('Invalid file buffer');
        }

        // Determine folder and validate
        const s3Folder = getS3FolderForFileType(file.mimetype, folder, file.originalname);
        const validation = validateFile(file, s3Folder);
        
        if (!validation.isValid) {
            throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
        }

        // Generate unique filename
        const filename = generateUniqueFilename(file.originalname, s3Folder);
        
        let fileBuffer = file.buffer;
        
        // Process images if needed
        const isImage = file.mimetype.startsWith('image/');
        if (isImage && options.processImage !== false) {
            try {
                fileBuffer = await processImage(file.buffer, options);
            } catch (processError) {
                console.warn('⚠️ Image processing failed, using original:', processError.message);
                fileBuffer = file.buffer;
            }
        }

        // Check if chunked upload is needed for large videos
        const isVideo = isVideoFile(file.mimetype, file.originalname);
        const isLargeVideo = isVideo && file.size > CHUNKED_UPLOAD_CONFIG.CHUNK_THRESHOLD;
        
        if (isLargeVideo) {
            return await uploadVideoInChunks(file, folder);
        }

        // Upload to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: fileBuffer,
            ContentType: file.mimetype,
            CacheControl: 'max-age=31536000', // 1 year
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Generate public URL
        const publicUrl = getPublicUrl(filename);

        const result = {
            secure_url: publicUrl,
            public_id: filename,
            format: path.extname(file.originalname).substring(1),
            resource_type: isImage ? 'image' : isVideo ? 'video' : 'raw',
            folder: s3Folder,
            size: fileBuffer.length,
            original_filename: file.originalname
        };

        // Extract video duration for video files
        if (isVideo) {
            try {
                const videoMetadata = await extractVideoMetadata(file.buffer, {
                    originalname: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype
                });
                result.duration = videoMetadata.duration;
            } catch (durationError) {
                console.warn('⚠️ Failed to extract video duration:', durationError.message);
                result.duration = 0;
            }
        }

        console.log('✅ File uploaded to S3 successfully:', publicUrl);
        return result;

    } catch (error) {
        console.error("Error while uploading file to S3:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

// Image upload function (alias for compatibility)
const uploadImageToS3 = async (file, folder, height, quality) => {
    const options = {};
    
    if (height) {
        options.height = height;
    }
    
    if (quality) {
        // Validate quality parameter to ensure it's within Sharp's acceptable range (0-100)
        const validatedQuality = Math.max(0, Math.min(100, parseInt(quality)));
        if (validatedQuality !== parseInt(quality)) {
            console.warn(`⚠️ Quality parameter ${quality} is out of range (0-100). Using ${validatedQuality} instead.`);
        }
        options.quality = validatedQuality;
    }
    
    return uploadFileToS3(file, folder, options);
};

// Resume upload function (alias for compatibility)
const uploadResumeToS3 = async (file, folder, options = {}) => {
    return uploadFileToS3(file, folder, options);
};

// Helper functions
const generateUniqueFilename = (originalName, folder = '') => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '_');
    
    const filename = `${baseName}_${timestamp}_${randomString}${extension}`;
    return folder ? `${folder}/${filename}` : filename;
};

// Image processing function
const processImage = async (fileBuffer, options = {}) => {
    try {
        // Configure Sharp for better memory management
        sharp.cache(false); // Disable cache to reduce memory usage
        sharp.concurrency(2); // Reduce thread usage
        
        // Get image metadata first to check dimensions
        // We need to get metadata before creating the sharp instance to avoid the pixel limit error
        let metadata;
        try {
            metadata = await sharp(fileBuffer, { limitInputPixels: false }).metadata();
        } catch (metadataError) {
            console.warn('⚠️ Failed to get metadata, using original image:', metadataError.message);
            throw metadataError;
        }
        
        // Create sharp instance with unlimited pixel input
        let sharpInstance = sharp(fileBuffer, { limitInputPixels: false });
        
        const maxPixels = 268402689; // Sharp's default pixel limit (268 million pixels)
        const currentPixels = metadata.width * metadata.height;
        
        console.log('📸 Processing image:', {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            pixels: currentPixels,
            size: `${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB`,
            exceedsPixelLimit: currentPixels > maxPixels
        });

        // Check if image exceeds pixel limit and resize if necessary
        if (currentPixels > maxPixels) {
            console.log('⚠️ Image exceeds pixel limit, resizing...');
            const scaleFactor = Math.sqrt(maxPixels / currentPixels) * 0.9; // 90% of limit for safety
            const newWidth = Math.floor(metadata.width * scaleFactor);
            const newHeight = Math.floor(metadata.height * scaleFactor);
            
            console.log(`📏 Resizing from ${metadata.width}x${metadata.height} to ${newWidth}x${newHeight}`);
            
            sharpInstance = sharpInstance.resize(newWidth, newHeight, {
                fit: 'inside',
                withoutEnlargement: false
            });
        }
        // Resize if height is specified (and not already resized due to pixel limit)
        else if (options.height) {
            sharpInstance = sharpInstance.resize(null, parseInt(options.height), {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }

        // Set quality if specified
        if (options.quality) {
            const quality = parseInt(options.quality);
            if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                sharpInstance = sharpInstance.jpeg({ quality });
            } else if (metadata.format === 'png') {
                // For PNG, use compression level instead of quality for better results
                sharpInstance = sharpInstance.png({ 
                    quality,
                    compressionLevel: Math.floor((100 - quality) / 10) // Convert quality to compression level (0-9)
                });
            } else if (metadata.format === 'webp') {
                sharpInstance = sharpInstance.webp({ quality });
            }
        }

        // Convert to buffer
        const processedBuffer = await sharpInstance.toBuffer();
        
        console.log('✅ Image processed successfully:', {
            originalSize: `${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB`,
            processedSize: `${(processedBuffer.length / (1024 * 1024)).toFixed(2)}MB`,
            compressionRatio: `${((1 - processedBuffer.length / fileBuffer.length) * 100).toFixed(1)}%`
        });
        
        return processedBuffer;

    } catch (error) {
        console.error('❌ Image processing failed:', error);
        throw error;
    }
};

// Delete file from S3
const deleteFileFromS3 = async (url) => {
    if (!url) return null;

    try {
        // Extract key from URL
        let key;
        if (process.env.AWS_CLOUDFRONT_DOMAIN && url.includes(process.env.AWS_CLOUDFRONT_DOMAIN)) {
            key = url.split(`https://${process.env.AWS_CLOUDFRONT_DOMAIN}/`)[1];
        } else {
            const bucketUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/`;
            key = url.split(bucketUrl)[1];
        }

        if (!key) {
            console.warn('Could not extract S3 key from URL:', url);
            return null;
        }

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        console.log(`✅ Successfully deleted file: ${key}`);
        return { success: true };

    } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
        return null;
    }
};

// Generate signed URL for direct upload
const generateSignedUrl = async (key, contentType, expiresIn = 3600) => {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            CacheControl: 'max-age=31536000'
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        
        return {
            signedUrl,
            key,
            publicUrl: getPublicUrl(key)
        };
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};

module.exports = {
    uploadFileToS3,
    uploadImageToS3,
    uploadResumeToS3,
    deleteFileFromS3,
    generateSignedUrl,
    generateUniqueFilename,
    processImage,
    
    // Aliases for backward compatibility
    uploadFileToSupabase: uploadFileToS3,
    uploadImageToSupabase: uploadImageToS3,
    uploadResumeToSupabase: uploadResumeToS3,
    deleteFileFromSupabase: deleteFileFromS3
};
