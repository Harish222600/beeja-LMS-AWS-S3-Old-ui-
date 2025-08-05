# AWS S3 Migration Plan - Replace Supabase Storage with AWS S3

## Overview
This document outlines the complete migration plan to replace Supabase storage with AWS S3 in the AWS LMS project. The migration involves updating file storage, upload mechanisms, and all related functionality.

## Current Supabase Implementation Analysis

### Files Using Supabase Storage:
1. **Configuration Files:**
   - `backend/config/supabase.js` - Supabase client configuration
   - `backend/config/supabaseAdmin.js` - Admin client with service role
   - `backend/config/supabaseStorage.js` - Storage bucket configuration and utilities
   - `backend/config/supabaseAdmin.js` - Admin operations

2. **Core Upload Utilities:**
   - `backend/utils/supabaseUploader.js` - Main file upload logic
   - `backend/utils/chunkedVideoUploader.js` - Large video file handling
   - `backend/utils/supabaseHelper.js` - Storage helper functions

3. **Controllers Using Supabase:**
   - `backend/controllers/admin.js` - Admin file uploads
   - `backend/controllers/admin_backup.js` - Backup operations
   - `backend/controllers/course.js` - Course thumbnails
   - `backend/controllers/profile.js` - Profile images
   - `backend/controllers/upload.js` - Direct upload handling
   - `backend/controllers/subSection.js` - Video uploads
   - `backend/controllers/jobApplications.js` - Resume uploads
   - `backend/controllers/chat.js` - Chat file uploads

4. **Models:**
   - `backend/models/chunkedVideo.js` - Chunked video metadata

5. **Routes:**
   - `backend/routes/videoPlayback.js` - Video streaming
   - `backend/routes/chunkedUpload.js` - Chunked upload endpoints

## Migration Strategy

### Phase 1: AWS S3 Configuration Setup

#### 1.1 Install AWS SDK
```bash
npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer-s3
```

#### 1.2 Environment Variables
Add to `.env`:
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-lms-bucket

# Optional: CloudFront Distribution
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
```

#### 1.3 Create AWS S3 Configuration
**File: `backend/config/awsS3.js`**
```javascript
const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { 
    PutObjectCommand, 
    GetObjectCommand, 
    DeleteObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command
} = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN;

module.exports = {
    s3Client,
    BUCKET_NAME,
    CLOUDFRONT_DOMAIN,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    getSignedUrl
};
```

#### 1.4 Create S3 Storage Configuration
**File: `backend/config/s3Storage.js`**
```javascript
// S3 folder structure (replaces Supabase buckets)
const S3_FOLDERS = {
    IMAGES: 'images',
    VIDEOS: 'videos',
    DOCUMENTS: 'documents',
    PROFILES: 'profiles',
    COURSES: 'courses',
    CHAT: 'chat-files'
};

// File size limits (same as before)
const FILE_SIZE_LIMITS = {
    IMAGE: 10 * 1024 * 1024,    // 10MB
    VIDEO: 2 * 1024 * 1024 * 1024, // 2GB
    DOCUMENT: 50 * 1024 * 1024, // 50MB
    PROFILE: 5 * 1024 * 1024    // 5MB
};

// Chunked upload configuration
const CHUNKED_UPLOAD_CONFIG = {
    CHUNK_THRESHOLD: 100 * 1024 * 1024, // 100MB for S3
    CHUNK_SIZE: 50 * 1024 * 1024, // 50MB chunks
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000
};

// Allowed file types (same as before)
const ALLOWED_FILE_TYPES = {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    VIDEOS: [
        'video/mp4', 'video/mpeg', 'video/quicktime', 
        'video/x-msvideo', 'video/webm', 'video/x-matroska',
        'video/x-flv', 'video/x-ms-wmv', 'application/octet-stream'
    ],
    DOCUMENTS: [
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
};

module.exports = {
    S3_FOLDERS,
    FILE_SIZE_LIMITS,
    ALLOWED_FILE_TYPES,
    CHUNKED_UPLOAD_CONFIG
};
```

### Phase 2: Core Upload Utilities Migration

#### 2.1 Create S3 Uploader
**File: `backend/utils/s3Uploader.js`**
```javascript
const { s3Client, BUCKET_NAME, CLOUDFRONT_DOMAIN, PutObjectCommand, DeleteObjectCommand, getSignedUrl } = require('../config/awsS3');
const { S3_FOLDERS, FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES } = require('../config/s3Storage');
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

        return result;

    } catch (error) {
        console.error("Error while uploading file to S3:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
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

const getPublicUrl = (key) => {
    if (CLOUDFRONT_DOMAIN) {
        return `https://${CLOUDFRONT_DOMAIN}/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

// Image processing (same as before)
const processImage = async (fileBuffer, options = {}) => {
    // Same implementation as supabaseUploader.js
};

// File validation
const validateFile = (file, folder) => {
    // Same validation logic as supabaseUploader.js
};

// Video detection
const isVideoFile = (mimetype, originalname) => {
    // Same logic as supabaseUploader.js
};

// Delete file from S3
const deleteFileFromS3 = async (url) => {
    if (!url) return null;

    try {
        // Extract key from URL
        let key;
        if (CLOUDFRONT_DOMAIN && url.includes(CLOUDFRONT_DOMAIN)) {
            key = url.split(`https://${CLOUDFRONT_DOMAIN}/`)[1];
        } else {
            key = url.split(`https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`)[1];
        }

        if (!key) {
            console.warn('Could not extract S3 key from URL');
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

module.exports = {
    uploadFileToS3,
    uploadImageToS3: uploadFileToS3, // Alias for compatibility
    uploadResumeToS3: uploadFileToS3, // Alias for compatibility
    deleteFileFromS3,
    getPublicUrl,
    generateUniqueFilename,
    processImage
};
```

#### 2.2 Create S3 Chunked Video Uploader
**File: `backend/utils/s3ChunkedVideoUploader.js`**
```javascript
const { s3Client, BUCKET_NAME } = require('../config/awsS3');
const { 
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand
} = require('@aws-sdk/client-s3');
const { CHUNKED_UPLOAD_CONFIG } = require('../config/s3Storage');
const ChunkedVideo = require('../models/chunkedVideo');

// S3 Multipart upload for large videos
const uploadVideoInChunks = async (file, folder = 'videos') => {
    try {
        console.log('🎬 Starting S3 multipart upload...');
        
        const key = generateUniqueFilename(file.originalname, folder);
        
        // Initialize multipart upload
        const createParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: file.mimetype,
            CacheControl: 'max-age=31536000'
        };

        const createCommand = new CreateMultipartUploadCommand(createParams);
        const { UploadId } = await s3Client.send(createCommand);

        const fileBuffer = file.buffer;
        const chunkSize = CHUNKED_UPLOAD_CONFIG.CHUNK_SIZE;
        const totalChunks = Math.ceil(fileBuffer.length / chunkSize);
        
        console.log(`Uploading ${totalChunks} parts to S3...`);

        const uploadPromises = [];
        const parts = [];

        // Upload parts in parallel (with concurrency limit)
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, fileBuffer.length);
            const chunk = fileBuffer.slice(start, end);

            const uploadPromise = uploadPart(BUCKET_NAME, key, UploadId, i + 1, chunk);
            uploadPromises.push(uploadPromise);

            // Limit concurrency to avoid overwhelming S3
            if (uploadPromises.length >= 5 || i === totalChunks - 1) {
                const results = await Promise.all(uploadPromises);
                parts.push(...results);
                uploadPromises.length = 0;
            }
        }

        // Sort parts by part number
        parts.sort((a, b) => a.PartNumber - b.PartNumber);

        // Complete multipart upload
        const completeParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            UploadId,
            MultipartUpload: { Parts: parts }
        };

        const completeCommand = new CompleteMultipartUploadCommand(completeParams);
        await s3Client.send(completeCommand);

        const publicUrl = getPublicUrl(key);

        console.log('✅ S3 multipart upload completed successfully');

        return {
            secure_url: publicUrl,
            public_id: key,
            format: path.extname(file.originalname).substring(1),
            resource_type: 'video',
            size: file.size,
            original_filename: file.originalname,
            isChunked: true
        };

    } catch (error) {
        console.error('Error in S3 multipart upload:', error);
        throw new Error(`S3 multipart upload failed: ${error.message}`);
    }
};

const uploadPart = async (bucket, key, uploadId, partNumber, chunk) => {
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
};

module.exports = {
    uploadVideoInChunks
};
```

### Phase 3: Update Controllers

#### 3.1 Update Import Statements
Replace all Supabase imports with S3 imports:

**Before:**
```javascript
const { uploadFileToSupabase, uploadImageToSupabase, deleteFileFromSupabase } = require('../utils/supabaseUploader');
```

**After:**
```javascript
const { uploadFileToS3, uploadImageToS3, deleteFileFromS3 } = require('../utils/s3Uploader');
```

#### 3.2 Update Function Calls
Replace all function calls:

**Before:**
```javascript
const result = await uploadImageToSupabase(file, 'profiles');
await deleteFileFromSupabase(oldImageUrl);
```

**After:**
```javascript
const result = await uploadImageToS3(file, 'profiles');
await deleteFileFromS3(oldImageUrl);
```

### Phase 4: Update Models

#### 4.1 Update ChunkedVideo Model
**File: `backend/models/chunkedVideo.js`**
```javascript
// Update to work with S3 multipart uploads instead of Supabase chunks
const mongoose = require('mongoose');

const chunkedVideoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true
    },
    originalFilename: {
        type: String,
        required: true
    },
    s3Key: {
        type: String,
        required: true
    },
    uploadId: {
        type: String,
        required: true // S3 multipart upload ID
    },
    totalSize: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    folder: {
        type: String,
        default: 'videos'
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    finalVideoUrl: {
        type: String
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChunkedVideo', chunkedVideoSchema);
```

### Phase 5: Update Routes

#### 5.1 Update Upload Routes
**File: `backend/routes/upload.js`**
```javascript
// Replace Supabase storage operations with S3 operations
const { s3Client, BUCKET_NAME, getSignedUrl, PutObjectCommand } = require('../config/awsS3');

// Generate signed URL for direct S3 upload
router.post('/signed-url', auth, async (req, res) => {
    try {
        const { filename, contentType, folder } = req.body;
        
        const key = `${folder}/${Date.now()}_${filename}`;
        
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({
            success: true,
            data: {
                signedUrl,
                key,
                publicUrl: getPublicUrl(key)
            }
        });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate signed URL'
        });
    }
});
```

### Phase 6: Environment and Configuration Updates

#### 6.1 Update Server.js
Remove Supabase initialization:
```javascript
// Remove this line:
// const { initializeStorageBuckets } = require('./config/supabaseStorage');

// Remove this from startServer function:
// await initializeStorageBuckets();
```

#### 6.2 Update Package.json
Remove Supabase dependencies and add AWS SDK:
```json
{
  "dependencies": {
    // Remove these:
    // "@supabase/supabase-js": "^2.39.0",
    
    // Add these:
    "aws-sdk": "^2.1691.0",
    "@aws-sdk/client-s3": "^3.645.0",
    "@aws-sdk/s3-request-presigner": "^3.645.0",
    "multer-s3": "^3.0.1"
  }
}
```

### Phase 7: Migration Script

#### 7.1 Create Migration Script
**File: `backend/scripts/migrateToS3.js`**
```javascript
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const { s3Client, BUCKET_NAME, PutObjectCommand } = require('../config/awsS3');
const supabase = require('../config/supabase'); // Keep temporarily for migration
const Course = require('../models/course');
const User = require('../models/user');

const migrateFilesToS3 = async () => {
    try {
        await connectDB();
        console.log('🚀 Starting migration from Supabase to S3...');

        // Migrate course thumbnails
        const courses = await Course.find({ thumbnail: { $exists: true, $ne: null } });
        console.log(`Found ${courses.length} courses with thumbnails to migrate`);

        for (const course of courses) {
            try {
                if (course.thumbnail.includes('supabase.co')) {
                    const newUrl = await migrateFile(course.thumbnail, 'courses');
                    if (newUrl) {
                        course.thumbnail = newUrl;
                        await course.save();
                        console.log(`✅ Migrated course thumbnail: ${course.courseName}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Failed to migrate course ${course.courseName}:`, error.message);
            }
        }

        // Migrate user profile images
        const users = await User.find({ image: { $exists: true, $ne: null } });
        console.log(`Found ${users.length} users with profile images to migrate`);

        for (const user of users) {
            try {
                if (user.image.includes('supabase.co')) {
                    const newUrl = await migrateFile(user.image, 'profiles');
                    if (newUrl) {
                        user.image = newUrl;
                        await user.save();
                        console.log(`✅ Migrated user profile: ${user.firstName} ${user.lastName}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Failed to migrate user ${user.firstName}:`, error.message);
            }
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

const migrateFile = async (supabaseUrl, folder) => {
    try {
        // Download from Supabase
        const response = await fetch(supabaseUrl);
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.statusText}`);
        }

        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type');
        
        // Generate S3 key
        const urlParts = supabaseUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const key = `${folder}/${Date.now()}_${filename}`;

        // Upload to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: 'max-age=31536000'
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Return new S3 URL
        return getPublicUrl(key);

    } catch (error) {
        console.error('Error migrating file:', error);
        return null;
    }
};

// Run migration
if (require.main === module) {
    migrateFilesToS3();
}

module.exports = { migrateFilesToS3 };
```

### Phase 8: Testing and Validation

#### 8.1 Create Test Script
**File: `backend/scripts/testS3Upload.js`**
```javascript
const { uploadFileToS3, deleteFileFromS3 } = require('../utils/s3Uploader');
const fs = require('fs');
const path = require('path');

const testS3Upload = async () => {
    try {
        console.log('🧪 Testing S3 upload functionality...');

        // Create a test file
        const testContent = Buffer.from('This is a test file for S3 upload');
        const testFile = {
            originalname: 'test-file.txt',
            mimetype: 'text/plain',
            buffer: testContent,
            size: testContent.length
        };

        // Test upload
        const result = await uploadFileToS3(testFile, 'test');
        console.log('✅ Upload successful:', result.secure_url);

        // Test delete
        const deleteResult = await deleteFileFromS3(result.secure_url);
        console.log('✅ Delete successful:', deleteResult);

        console.log('🎉 All S3 tests passed!');

    } catch (error) {
        console.error('❌ S3 test failed:', error);
    }
};

testS3Upload();
```

### Phase 9: Documentation Updates

#### 9.1 Update README.md
```markdown
# AWS S3 Configuration

## Environment Variables
Add the following to your `.env` file:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-lms-bucket
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net (optional)
```

## S3 Bucket Setup
1. Create an S3 bucket in your AWS account
2. Configure bucket permissions for public read access
3. Set up CORS configuration for web uploads
4. (Optional) Set up CloudFront distribution for CDN

## File Structure
Files are organized in the following folder structure:
- `images/` - General images
- `videos/` - Video files
- `documents/` - PDF and document files
- `profiles/` - User profile images
- `courses/` - Course thumbnails
- `chat-files/` - Chat attachments
```

### Phase 10: Cleanup

#### 10.1 Remove Supabase Files
After successful migration and testing:
1. Delete `backend/config/supabase.js`
2. Delete `backend/config/supabaseAdmin.js`
3. Delete `backend/config/supabaseStorage.js`
4. Delete `backend/utils/supabaseUploader.js`
5. Delete `backend/utils/supabaseHelper.js`
6. Remove Supabase dependencies from package.json
7. Update all import statements

#### 10.2 Update Docker Configuration
Update `docker-compose.yml` to include AWS environment variables:
```yaml
backend:
  environment:
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    - AWS_REGION=${AWS_REGION}
    - AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME}
```

## Migration Checklist

- [ ] Install AWS SDK dependencies
- [ ] Create AWS S3 configuration files
- [ ] Create S3 uploader utilities
- [ ] Update all controllers to use S3
- [ ] Update models for S3 compatibility
- [ ] Update routes for S3 operations
- [ ] Create migration script
- [ ] Test S3 functionality
- [ ] Run migration script
- [ ] Update documentation
- [ ] Remove Supabase dependencies
- [ ] Update Docker configuration

## Benefits of S3 Migration

1. **Cost Efficiency**: S3 is generally more cost-effective for large-scale storage
2. **Scalability**: Better handling of large files and high traffic
3. **Integration**: Native AWS integration with other services
4. **Performance**: CloudFront CDN integration for global content delivery
5. **Reliability**: 99.999999999% (11 9's) durability
6. **Security**: Advanced security features and compliance certifications

## Considerations

1. **Bandwidth Costs**: S3 charges for data transfer out
2. **Regional Latency**: Choose appropriate AWS region
3. **CloudFront Setup**: Recommended for global content delivery
4. **Backup Strategy**: Implement cross-region replication if needed
5. **Monitoring**: Set up CloudWatch for monitoring and alerts
