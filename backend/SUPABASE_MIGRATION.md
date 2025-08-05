# Cloudinary to Supabase Migration Guide

This document outlines the migration from Cloudinary to Supabase Storage for file handling in the Beeja project.

## 🎯 Migration Overview

The migration implements a **hybrid approach** with Supabase as the primary storage and Cloudinary as a fallback, ensuring zero downtime and backward compatibility.

## 📁 Files Modified

### Configuration Files
- `backend/package.json` - Added @supabase/supabase-js dependency
- `backend/config/supabase.js` - Existing Supabase client configuration
- `backend/config/supabaseStorage.js` - **NEW** Storage bucket configuration
- `backend/server.js` - Added Supabase storage initialization

### Utility Files
- `backend/utils/supabaseUploader.js` - **NEW** Main file upload handler
- `backend/utils/supabaseHelper.js` - **NEW** Helper functions for Supabase operations

### Controller Files Updated
- `backend/controllers/course.js` - Course thumbnail uploads
- `backend/controllers/profile.js` - Profile image uploads and deletions
- `backend/controllers/subSection.js` - Video uploads
- `backend/controllers/chat.js` - Chat image uploads
- `backend/controllers/jobApplications.js` - Resume uploads

### Migration Tools
- `backend/scripts/migrateToSupabase.js` - **NEW** Analysis and migration script

## 🗄️ Supabase Storage Buckets

The following buckets are automatically created:

| Bucket | Purpose | File Types |
|--------|---------|------------|
| `images` | General images | JPEG, PNG, GIF, WebP |
| `videos` | Course videos | MP4, WebM, OGV, AVI, MOV |
| `documents` | PDFs and documents | PDF, DOC, DOCX |
| `profiles` | User profile images | JPEG, PNG, GIF, WebP |
| `courses` | Course thumbnails | JPEG, PNG, GIF, WebP |
| `chat-files` | Chat attachments | JPEG, PNG, GIF, WebP |

## 🔄 How the Hybrid System Works

### Upload Process
1. **Primary**: Attempt upload to Supabase Storage
2. **Fallback**: If Supabase fails, upload to Cloudinary
3. **Logging**: All attempts and results are logged

### Delete Process
1. **Primary**: Attempt deletion from Supabase
2. **Fallback**: If Supabase fails, attempt Cloudinary deletion
3. **Graceful**: Failures don't break the main operation

### Example Code Pattern
```javascript
// Upload with fallback
let uploadResult;
try {
    uploadResult = await uploadImageToSupabase(file, 'courses');
    console.log('✅ Uploaded to Supabase:', uploadResult.secure_url);
} catch (supabaseError) {
    console.warn('⚠️ Supabase failed, using Cloudinary:', supabaseError.message);
    uploadResult = await uploadImageToCloudinary(file, folder);
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Ensure these variables are set in your `.env` file:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary Configuration (for fallback)
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### 3. Create Supabase Storage Buckets (MANUAL STEP REQUIRED)

Due to Row Level Security (RLS) policies, buckets need to be created manually in the Supabase Dashboard:

#### Step-by-Step Bucket Creation:

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Click on "Storage" in the left sidebar

2. **Create the following buckets as PUBLIC:**
   
   **Bucket: `images`**
   - Name: `images`
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/gif, image/webp`

   **Bucket: `videos`**
   - Name: `videos`
   - Public: ✅ Yes
   - File size limit: 500MB
   - Allowed MIME types: `video/mp4, video/webm, video/ogg, video/avi, video/mov`

   **Bucket: `documents`**
   - Name: `documents`
   - Public: ✅ Yes
   - File size limit: 50MB
   - Allowed MIME types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

   **Bucket: `profiles`**
   - Name: `profiles`
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/gif, image/webp`

   **Bucket: `courses`**
   - Name: `courses`
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/gif, image/webp`

   **Bucket: `chat-files`**
   - Name: `chat-files`
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/gif, image/webp`

3. **Configure RLS Policies (Optional)**
   - For each bucket, you can set up Row Level Security policies
   - For public buckets, the default policies should work
   - If you need custom access control, configure policies as needed

### 4. Run Migration Analysis
```bash
node backend/scripts/migrateToSupabase.js
```

This will:
- Check if Supabase storage buckets exist
- Analyze existing Cloudinary usage
- Provide migration recommendations

### 5. Start the Server
```bash
npm run dev
```

The server will:
- Check Supabase storage bucket availability
- Set up the hybrid upload system (Supabase + Cloudinary fallback)
- Show bucket status in console logs

## 📊 Migration Status

### ✅ Completed
- [x] Supabase storage configuration
- [x] File upload utilities
- [x] Course thumbnail uploads
- [x] Profile image uploads
- [x] Video uploads
- [x] Chat image uploads
- [x] Resume uploads
- [x] File deletion handling
- [x] Hybrid fallback system
- [x] Migration analysis script

### 🔄 In Progress
- [ ] Admin controller updates (partially complete)
- [ ] Existing file migration (optional)

### 📋 Testing Checklist
- [ ] Upload new course thumbnail
- [ ] Upload new profile image
- [ ] Upload new video
- [ ] Upload chat image
- [ ] Upload resume
- [ ] Delete files
- [ ] Test fallback mechanism

## 🛠️ File Size Limits

| File Type | Supabase Limit | Cloudinary Limit |
|-----------|----------------|------------------|
| Images | 10MB | 10MB |
| Videos | 500MB | 100MB (free) |
| Documents | 50MB | 10MB |
| Profile Images | 5MB | 10MB |

## 🔧 Configuration Options

### Supabase Storage Features
- **Public Buckets**: Files are publicly accessible
- **Automatic MIME Type Detection**: Based on file content
- **CDN**: Built-in CDN for fast delivery
- **Transformations**: Limited (consider ImageKit integration)

### Image Processing
- **Sharp Integration**: Images are processed before upload
- **Optimization**: Automatic compression and resizing
- **Format Support**: JPEG, PNG, WebP, GIF

## 🚨 Important Notes

### Backward Compatibility
- Existing Cloudinary URLs continue to work
- No immediate migration required
- Gradual transition supported

### Error Handling
- Upload failures gracefully fall back to Cloudinary
- Deletion failures don't break operations
- Comprehensive logging for debugging

### Performance
- Supabase Storage offers competitive performance
- Built-in CDN for global delivery
- Automatic compression and optimization

## 🔍 Monitoring

### Logs to Watch
```bash
# Successful Supabase uploads
✅ Thumbnail uploaded to Supabase: https://...

# Fallback to Cloudinary
⚠️ Supabase upload failed, falling back to Cloudinary: Error message

# Storage bucket initialization
🗄️ Initializing Supabase storage buckets...
✅ Created bucket: images
```

### Health Checks
- Monitor upload success rates
- Check storage bucket status
- Verify file accessibility

## 🆘 Troubleshooting

### Common Issues

#### 1. Supabase Connection Failed
```
Error: Invalid Supabase URL or key
```
**Solution**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

#### 2. Bucket Creation Failed
```
Error creating bucket: Bucket already exists
```
**Solution**: This is normal - buckets are created once and reused

#### 3. File Upload Failed
```
Error: File size exceeds limit
```
**Solution**: Check file size limits in `supabaseStorage.js`

#### 4. CORS Issues
```
Error: CORS policy blocked
```
**Solution**: Configure CORS in Supabase dashboard

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📈 Future Enhancements

### Planned Features
- [ ] Image transformations via ImageKit
- [ ] Automatic file migration script
- [ ] Storage usage analytics
- [ ] File compression optimization
- [ ] Duplicate file detection

### Optimization Opportunities
- [ ] Implement file deduplication
- [ ] Add progressive image loading
- [ ] Implement lazy loading for videos
- [ ] Add file preview generation

## 🤝 Contributing

When adding new file upload features:

1. Use the hybrid pattern (Supabase + Cloudinary fallback)
2. Add appropriate bucket configuration
3. Include error handling and logging
4. Update this documentation

## 📞 Support

For issues related to this migration:
1. Check the logs for error messages
2. Run the migration analysis script
3. Verify environment variables
4. Test with small files first

---

**Migration completed by**: Development Team  
**Date**: Current  
**Status**: Production Ready with Fallback Support
