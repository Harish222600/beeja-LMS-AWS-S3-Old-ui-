# Chunked Video Upload Implementation

This document describes the implementation of chunked video upload functionality for handling large video files in the Beeja Learning Platform.

## Overview

The chunked video upload system automatically breaks large video files (>25MB) into smaller chunks for upload to Supabase Storage, then reassembles them into a complete video file for seamless playback.

## Key Features

- **Automatic Chunking**: Videos larger than 25MB are automatically split into 25MB chunks
- **Seamless Playback**: Final video plays as a single, complete file
- **Progress Tracking**: Real-time upload progress monitoring
- **Error Recovery**: Retry mechanism for failed chunk uploads
- **Cleanup**: Automatic cleanup of temporary chunk files
- **Size Support**: Supports videos up to 2GB in size

## Architecture

### Components

1. **ChunkedVideo Model** (`models/chunkedVideo.js`)
   - Tracks upload metadata and progress
   - Stores chunk information
   - Manages upload state

2. **Chunked Video Uploader** (`utils/chunkedVideoUploader.js`)
   - Core chunking and upload logic
   - Chunk reassembly functionality
   - Progress calculation

3. **Supabase Uploader Integration** (`utils/supabaseUploader.js`)
   - Automatic detection of large videos
   - Seamless integration with existing upload flow
   - Fallback to direct upload for smaller files

4. **API Routes** (`routes/chunkedUpload.js`)
   - RESTful endpoints for chunked upload operations
   - Progress tracking endpoints
   - Upload management

### Configuration

```javascript
// Video chunking configuration
const VIDEO_CONFIG = {
    chunkThreshold: 25 * 1024 * 1024, // 25MB - files larger than this will be chunked
    maxDirectUploadSize: 100 * 1024 * 1024 // 100MB - maximum size for direct upload
};

// File size limits
const FILE_SIZE_LIMITS = {
    VIDEO: 2 * 1024 * 1024 * 1024, // 2GB (with chunked upload support)
};
```

## How It Works

### 1. Upload Detection
When a video file is uploaded through the existing `uploadFileToSupabase` function:
- File size is checked
- If > 25MB, chunked upload is automatically triggered
- If ≤ 25MB, direct upload is used

### 2. Chunking Process
```javascript
// Automatic chunking in uploadFileToSupabase
const isLargeVideo = isVideo && file.size > VIDEO_CONFIG.chunkThreshold;

if (isLargeVideo) {
    console.log('🎬 Large video detected, using chunked upload...');
    const result = await uploadVideoInChunks(file, folder);
    return result;
}
```

### 3. Upload Flow
1. **Initialize**: Create chunked video record in database
2. **Split**: Divide file buffer into 25MB chunks
3. **Upload**: Upload each chunk to Supabase Storage
4. **Track**: Monitor progress and handle retries
5. **Reassemble**: Download and concatenate chunks
6. **Finalize**: Upload complete video file
7. **Cleanup**: Remove temporary chunk files

### 4. Database Schema
```javascript
const chunkedVideoSchema = new mongoose.Schema({
    videoId: String,           // Unique identifier
    originalFilename: String,  // Original file name
    totalSize: Number,         // Total file size
    totalChunks: Number,       // Number of chunks
    uploadedChunks: [{         // Array of uploaded chunks
        chunkIndex: Number,
        chunkPath: String,
        chunkSize: Number,
        uploadedAt: Date
    }],
    isComplete: Boolean,       // Upload completion status
    finalVideoUrl: String,     // URL of final assembled video
    uploadProgress: Number     // Progress percentage
});
```

## API Endpoints

### Initialize Chunked Upload
```http
POST /api/v1/chunked-upload/initialize
Content-Type: multipart/form-data

{
    "video": <file>,
    "folder": "videos"
}
```

### Upload Chunk
```http
POST /api/v1/chunked-upload/chunk
Content-Type: multipart/form-data

{
    "videoId": "abc123",
    "chunkIndex": 0,
    "chunk": <chunk_data>
}
```

### Complete Upload
```http
POST /api/v1/chunked-upload/complete

{
    "videoId": "abc123"
}
```

### Get Progress
```http
GET /api/v1/chunked-upload/progress/:videoId
```

### List Uploads
```http
GET /api/v1/chunked-upload/list?status=incomplete&page=1&limit=10
```

## Integration with Existing Code

The chunked upload system is designed to be transparent to existing code:

### SubSection Controller
```javascript
// No changes needed - automatic detection
const videoFileDetails = await uploadFileToSupabase(videoFile, 'videos');
console.log('Upload method:', videoFileDetails.size > 25 * 1024 * 1024 ? 'Chunked Upload' : 'Direct Upload');
```

### Error Handling
Enhanced error messages for chunked uploads:
```javascript
if (uploadError.message.includes('chunk')) {
    errorMessage = 'Error during chunked upload. Please try again or use a smaller video file.';
    statusCode = 500;
}
```

## Configuration Updates

### File Size Limits
- **Images**: 10MB (unchanged)
- **Videos**: 2GB (increased from 100MB)
- **Documents**: 50MB (unchanged)

### Timeout Settings
- **Upload Timeout**: Extended to 30 minutes for large files
- **Chunk Retry**: 3 attempts with exponential backoff

## Maintenance

### Cleanup Script
Run periodically to clean up old incomplete uploads:
```bash
node backend/scripts/cleanupChunkedUploads.js
```

### Monitoring
- Track upload progress via API endpoints
- Monitor chunk upload failures
- Review cleanup logs

## Benefits

1. **Large File Support**: Handle videos up to 2GB
2. **Reliability**: Retry mechanism for failed chunks
3. **User Experience**: Progress tracking and better error messages
4. **Storage Efficiency**: Automatic cleanup of temporary files
5. **Seamless Integration**: Works with existing upload flow
6. **Scalability**: Handles multiple concurrent uploads

## Error Handling

### Common Errors
- **Chunk Upload Failure**: Automatic retry with exponential backoff
- **Network Timeout**: Extended timeout for large files
- **Storage Limit**: Clear error messages with size information
- **Invalid Format**: Validation before chunking begins

### Recovery
- Incomplete uploads are tracked in database
- Failed chunks can be re-uploaded
- Automatic cleanup prevents storage bloat

## Performance Considerations

### Upload Speed
- Parallel chunk uploads (configurable)
- Optimized chunk size (25MB)
- Retry mechanism for reliability

### Storage
- Temporary chunks are cleaned up automatically
- Final video replaces chunks
- Database tracks minimal metadata

### Memory Usage
- Streaming approach for large files
- Chunk-by-chunk processing
- Efficient buffer management

## Security

### Authentication
- All endpoints require authentication
- User access validation
- Role-based permissions

### Validation
- File type validation
- Size limit enforcement
- Malicious file detection

## Future Enhancements

1. **Resume Uploads**: Support for resuming interrupted uploads
2. **Parallel Chunks**: Upload multiple chunks simultaneously
3. **Compression**: Optional video compression during upload
4. **CDN Integration**: Direct upload to CDN for better performance
5. **Real-time Progress**: WebSocket-based progress updates

## Troubleshooting

### Common Issues
1. **Upload Timeout**: Increase timeout settings
2. **Chunk Failure**: Check network connectivity
3. **Storage Full**: Monitor Supabase storage usage
4. **Memory Issues**: Optimize chunk size

### Debug Logs
Enable detailed logging for troubleshooting:
```javascript
console.log('🎬 Large video detected, using chunked upload...');
console.log('📤 Uploading chunk', chunkIndex);
console.log('✅ Chunk uploaded successfully');
```

## Conclusion

The chunked video upload system provides a robust, scalable solution for handling large video files while maintaining seamless integration with the existing codebase. It automatically handles the complexity of chunking and reassembly, providing users with a smooth upload experience for videos of any size up to 2GB.
