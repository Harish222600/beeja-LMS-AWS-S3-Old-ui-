import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Custom hook to handle profile image updates and force re-renders
export const useProfileImage = () => {
  const { user } = useSelector((state) => state.profile);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    const handleProfileImageUpdate = (event) => {
      console.log('🔄 Profile image update event received in useProfileImage hook');
      console.log('Event details:', event.detail);
      // Force re-render by updating key when profile image changes
      setImageKey(prev => prev + 1);
    };

    const handleStorageUpdate = (event) => {
      if (event.key === 'user') {
        console.log('🔄 User storage update detected in useProfileImage hook');
        setImageKey(prev => prev + 1);
      }
    };

    // Listen for profile image update events
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Return the user image - let the Img component handle cache-busting
  const getImageUrl = () => {
    if (!user?.image) {
      console.log('⚠️ No user image found in Redux state');
      return null;
    }
    
    console.log('📸 Current user image URL:', user.image);
    // Return the image URL as-is, the Img component will handle cache-busting
    return user.image;
  };

  return {
    user,
    imageUrl: getImageUrl(),
    imageKey
  };
};
