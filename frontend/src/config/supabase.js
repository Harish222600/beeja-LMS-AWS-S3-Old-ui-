import { createClient } from '@supabase/supabase-js'

// Supabase configuration for frontend (using anon key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables and handle missing ones gracefully
let supabase
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase') || supabaseAnonKey.includes('your_supabase')) {
  console.warn('⚠️ Supabase environment variables not configured properly. Direct upload features will be disabled.')
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file')
  
  // Create a mock client to prevent errors
  supabase = {
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase not configured')),
        download: () => Promise.reject(new Error('Supabase not configured')),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: () => Promise.reject(new Error('Supabase not configured'))
      })
    }
  }
} else {
  // Create Supabase client for frontend operations
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    storage: {
      // Enable resumable uploads
      resumable: true,
    }
  })
}

export { supabase }

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  VIDEOS: 'videos', 
  DOCUMENTS: 'documents',
  PROFILES: 'profiles',
  COURSES: 'courses',
  CHAT: 'chat-files'
}

// File size limits and upload configuration
export const UPLOAD_CONFIG = {
  // File size limits (in bytes)
  IMAGE_MAX_SIZE: 10 * 1024 * 1024,    // 10MB
  VIDEO_MAX_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
  DOCUMENT_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Upload strategy thresholds
  DIRECT_UPLOAD_THRESHOLD: 50 * 1024 * 1024, // 50MB - files larger will use resumable
  CHUNK_SIZE: 25 * 1024 * 1024, // 25MB chunks for resumable uploads
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // Base delay for exponential backoff (ms)
  
  // Concurrent upload settings
  MAX_CONCURRENT_CHUNKS: 3, // Maximum parallel chunk uploads
}

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  VIDEOS: [
    'video/mp4', 
    'video/mpeg', 
    'video/quicktime', 
    'video/x-msvideo', 
    'video/webm',
    'video/x-matroska', // .mkv files
    'video/x-flv',      // .flv files
    'video/x-ms-wmv',   // .wmv files
    'application/octet-stream' // Sometimes .mkv files are detected as this
  ],
  DOCUMENTS: [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

/**
 * Get the appropriate bucket for a file type
 */
export const getBucketForFileType = (mimetype, folder = '', originalname = '') => {
  console.log('🗂️ Determining bucket for:', { mimetype, folder, originalname })
  
  // Enhanced video detection
  const isVideoByMimetype = ALLOWED_FILE_TYPES.VIDEOS.includes(mimetype)
  const isVideoByExtension = originalname && /\.(mp4|mov|avi|wmv|mkv|flv|webm)$/i.test(originalname)
  const isMkvFile = originalname && /\.mkv$/i.test(originalname)
  const isOctetStreamMkv = mimetype === 'application/octet-stream' && isMkvFile
  
  if (isVideoByMimetype || isVideoByExtension || isOctetStreamMkv) {
    console.log('📹 Using VIDEOS bucket')
    return STORAGE_BUCKETS.VIDEOS
  }
  
  if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(mimetype)) {
    console.log('📄 Using DOCUMENTS bucket')
    return STORAGE_BUCKETS.DOCUMENTS
  }
  
  if (ALLOWED_FILE_TYPES.IMAGES.includes(mimetype)) {
    if (folder && folder.includes('profile')) {
      console.log('👤 Using PROFILES bucket')
      return STORAGE_BUCKETS.PROFILES
    }
    if (folder && (folder.includes('course') || folder === 'courses')) {
      console.log('📚 Using COURSES bucket')
      return STORAGE_BUCKETS.COURSES
    }
    if (folder && folder.includes('chat')) {
      console.log('💬 Using CHAT bucket')
      return STORAGE_BUCKETS.CHAT
    }
    console.log('🖼️ Using default IMAGES bucket')
    return STORAGE_BUCKETS.IMAGES
  }
  
  console.log('🔄 Using fallback IMAGES bucket')
  return STORAGE_BUCKETS.IMAGES
}

/**
 * Validate file type and size
 */
export const validateFile = (file, bucket) => {
  const errors = []
  
  // Enhanced video detection
  const isVideoByMimetype = file.mimetype.startsWith('video/')
  const isVideoByExtension = file.originalname && /\.(mp4|mov|avi|wmv|mkv|flv|webm)$/i.test(file.originalname)
  const isVideo = isVideoByMimetype || isVideoByExtension
  const isMkvFile = file.originalname && /\.mkv$/i.test(file.originalname)
  const isOctetStreamMkv = file.mimetype === 'application/octet-stream' && isMkvFile
  
  // Check file size
  let sizeLimit
  if (isVideo) {
    sizeLimit = UPLOAD_CONFIG.VIDEO_MAX_SIZE
  } else if (file.mimetype.startsWith('image/')) {
    sizeLimit = UPLOAD_CONFIG.IMAGE_MAX_SIZE
  } else {
    sizeLimit = UPLOAD_CONFIG.DOCUMENT_MAX_SIZE
  }
  
  if (file.size > sizeLimit) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit (${(sizeLimit / 1024 / 1024).toFixed(2)}MB)`)
  }
  
  // Check file type
  const allowedTypes = bucket === STORAGE_BUCKETS.VIDEOS ? ALLOWED_FILE_TYPES.VIDEOS :
                      bucket === STORAGE_BUCKETS.DOCUMENTS ? ALLOWED_FILE_TYPES.DOCUMENTS :
                      ALLOWED_FILE_TYPES.IMAGES
  
  const isTypeAllowed = allowedTypes.includes(file.mimetype) || isOctetStreamMkv
  
  if (!isTypeAllowed) {
    if (isVideoByExtension && !isVideoByMimetype) {
      errors.push(`Video file type not properly detected. File extension suggests video but mimetype is ${file.mimetype}`)
    } else {
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    willUseResumableUpload: file.size > UPLOAD_CONFIG.DIRECT_UPLOAD_THRESHOLD,
    isVideo,
    detectedAsVideo: isVideo
  }
}

/**
 * Check if file should use resumable upload
 */
export const shouldUseResumableUpload = (file) => {
  return file.size > UPLOAD_CONFIG.DIRECT_UPLOAD_THRESHOLD
}

export default supabase
