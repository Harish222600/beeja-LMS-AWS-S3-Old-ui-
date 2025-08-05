/**
 * Utility functions for handling video URLs and chunked video playback
 */

/**
 * Get base URL from environment variable or use dynamic detection
 * @returns {string} - The base URL for API calls
 */
export const getBaseUrl = () => {
  // For Vite, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_REACT_APP_BASE_URL) {
    return import.meta.env.VITE_REACT_APP_BASE_URL;
  }
  // Fallback to process.env (for Create React App)
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BASE_URL) {
    return process.env.REACT_APP_BASE_URL;
  }
  
  // Dynamic detection based on current window location
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    
    // If accessing via localhost, use localhost with backend port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    
    // If accessing via public IP or domain, use the same host with backend port
    // Assuming backend runs on port 5001 in production as well
    return `${protocol}//${hostname}:5001`;
  }
  
  // Final fallback
  return 'http://localhost:5001';
};

/**
 * Check if a video URL is a chunked video manifest
 * @param {string} videoUrl - The video URL to check
 * @returns {boolean} - True if it's a chunked video manifest
 */
export const isChunkedVideo = (videoUrl) => {
  if (!videoUrl) return false;
  return videoUrl.includes('_manifest.json') || videoUrl.includes('/manifests/');
};

/**
 * Extract video ID from a chunked video manifest URL
 * @param {string} manifestUrl - The manifest URL
 * @returns {string|null} - The video ID or null if not found
 */
export const extractVideoIdFromManifest = (manifestUrl) => {
  if (!manifestUrl) return null;
  
  // Extract video ID from manifest filename
  // Format: /videos/manifests/{videoId}_manifest.json
  const match = manifestUrl.match(/\/([a-f0-9]+)_manifest\.json/);
  return match ? match[1] : null;
};

/**
 * Get the appropriate video URL for playback
 * @param {string} videoUrl - The original video URL
 * @param {string} token - Authentication token
 * @param {string} subSectionId - The subsection ID (for direct S3 videos)
 * @returns {string} - The URL to use for video playback
 */
export const getPlaybackUrl = (videoUrl, token, subSectionId = null) => {
  if (!videoUrl) return '';
  
  const baseUrl = getBaseUrl();
  
  // If it's a chunked video, use our chunked streaming endpoint
  if (isChunkedVideo(videoUrl)) {
    const videoId = extractVideoIdFromManifest(videoUrl);
    if (videoId) {
      // Use our streaming endpoint with authentication
      return `${baseUrl}/api/v1/video/stream/${videoId}?token=${token}`;
    }
  }
  
  // For direct S3 videos, use our direct streaming endpoint
  if (videoUrl.includes('amazonaws.com') || videoUrl.includes('cloudfront.net')) {
    if (subSectionId) {
      return `${baseUrl}/api/v1/video/direct/${subSectionId}?token=${token}`;
    } else {
      console.warn('SubSection ID required for direct S3 video streaming');
      // Fallback to original URL (may not work due to CORS)
      return videoUrl;
    }
  }
  
  // For other video URLs (external links, etc.), return as-is
  return videoUrl;
};

/**
 * Check if a video is available for playback
 * @param {string} videoUrl - The video URL to check
 * @param {string} token - Authentication token
 * @param {string} subSectionId - The subsection ID (for direct S3 videos)
 * @returns {Promise<boolean>} - True if video is available
 */
export const checkVideoAvailability = async (videoUrl, token, subSectionId = null) => {
  if (!videoUrl) return false;
  
  try {
    const baseUrl = getBaseUrl();
    
    if (isChunkedVideo(videoUrl)) {
      const videoId = extractVideoIdFromManifest(videoUrl);
      if (!videoId) return false;
      
      // Check if chunked video is complete
      const response = await fetch(`${baseUrl}/api/v1/video/info/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.success && data.data.isComplete;
      }
    } else if (videoUrl.includes('amazonaws.com') || videoUrl.includes('cloudfront.net')) {
      // For direct S3 videos, check via our API
      if (subSectionId) {
        const response = await fetch(`${baseUrl}/api/v1/video/direct-info/${subSectionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.success && data.data.videoUrl;
        }
      }
    } else {
      // For external videos, try to fetch the URL
      try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        return response.ok;
      } catch (corsError) {
        // If CORS blocks the request, assume it's available
        console.warn('CORS blocked video availability check, assuming available');
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking video availability:', error);
  }
  
  return false;
};

/**
 * Get video metadata for chunked videos
 * @param {string} videoUrl - The video URL
 * @param {string} token - Authentication token
 * @returns {Promise<object|null>} - Video metadata or null
 */
export const getVideoMetadata = async (videoUrl, token) => {
  if (!videoUrl || !isChunkedVideo(videoUrl)) return null;
  
  try {
    const videoId = extractVideoIdFromManifest(videoUrl);
    if (!videoId) return null;
    
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/video/info/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.data : null;
    }
  } catch (error) {
    console.error('Error getting video metadata:', error);
  }
  
  return null;
};
