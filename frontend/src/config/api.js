/**
 * API Configuration
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

// Get base URL from environment variable or use default
export const BASE_URL = getBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  VIDEO_STREAM: (videoId) => `${BASE_URL}/api/v1/video/stream/${videoId}`,
  VIDEO_INFO: (videoId) => `${BASE_URL}/api/v1/video/info/${videoId}`,
  VIDEO_MANIFEST: (videoId) => `${BASE_URL}/api/v1/video/manifest/${videoId}`,
  CHUNKED_UPLOAD_INIT: `${BASE_URL}/api/v1/chunked-upload/initialize`,
  CHUNKED_UPLOAD_CHUNK: `${BASE_URL}/api/v1/chunked-upload/chunk`,
  CHUNKED_UPLOAD_COMPLETE: `${BASE_URL}/api/v1/chunked-upload/complete`,
  CHUNKED_UPLOAD_PROGRESS: (videoId) => `${BASE_URL}/api/v1/chunked-upload/progress/${videoId}`
};

export default {
  BASE_URL,
  API_ENDPOINTS,
  getBaseUrl
};
