import { toast } from 'react-hot-toast';

// Utility function to clear authentication state
export const clearAuthState = () => {
  try {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear sessionStorage if used
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Show success message
    toast.success('Authentication cleared. Please login again.');
    
    // Reload the page to reset Redux state
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error clearing auth state:', error);
    toast.error('Error clearing authentication state');
    return false;
  }
};

// Function to check if user needs to re-authenticate
export const checkAuthValidity = async (token) => {
  if (!token) return false;
  
  try {
    const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL || 
                   (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
                     ? `${window.location.protocol}//${window.location.hostname}:5001` 
                     : 'http://localhost:5001');
    const response = await fetch(`${baseUrl}/api/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.status !== 401;
  } catch (error) {
    console.error('Error checking auth validity:', error);
    return false;
  }
};
