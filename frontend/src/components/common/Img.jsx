import React, { useMemo, useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'

const Img = ({ src, className, alt, width, height }) => {
    const [imageKey, setImageKey] = useState(0);

    // Listen for profile image updates
    useEffect(() => {
        const handleProfileImageUpdate = (event) => {
            console.log('🔄 Profile image update event received in Img component');
            // Force re-render by updating key when profile image changes
            setImageKey(prev => prev + 1);
        };

        window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
        window.addEventListener('storage', handleProfileImageUpdate);

        return () => {
            window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
            window.removeEventListener('storage', handleProfileImageUpdate);
        };
    }, []);

    // Function to handle both S3 and Cloudinary URLs
    const getOptimizedUrl = useMemo(() => {
        if (!src) return src;

        // Handle S3 URLs (AWS S3 or CloudFront)
        if (src.includes('amazonaws.com') || src.includes('cloudfront.net')) {
            console.log('📸 Using S3 URL:', src);
            return src; // Return S3 URL as-is, no transformations needed
        }

        // Handle Cloudinary URLs (legacy support)
        if (src.includes('cloudinary.com')) {
            console.log('📸 Using Cloudinary URL:', src);
            try {
                const baseUrl = src.split('/upload/')[0] + '/upload/';
                const imagePath = src.split('/upload/')[1];

                // Default transformations for all images
                const transformations = [
                    'q_auto', // Automatic quality optimization
                    'f_auto', // Automatic format selection based on browser
                    'c_limit', // Limit mode for resizing
                ];

                // Add responsive sizing
                if (width) transformations.push(`w_${width}`);
                if (height) transformations.push(`h_${height}`);

                // Add transformations to URL
                return `${baseUrl}${transformations.join(',')}/${imagePath}`;
            } catch (error) {
                console.warn('Error optimizing Cloudinary URL:', error);
                return src;
            }
        }

        // For other URLs (including dicebear avatars), return as-is
        console.log('📸 Using direct URL:', src);
        return src;
    }, [src, width, height, imageKey]);

    // Generate srcSet only for Cloudinary images
    const srcSet = useMemo(() => {
        if (!src || !src.includes('cloudinary.com')) return undefined;

        try {
            const baseUrl = src.split('/upload/')[0] + '/upload/';
            const imagePath = src.split('/upload/')[1];
            
            // Generate multiple sizes for responsive images
            const sizes = [200, 400, 600, 800];
            return sizes
                .map(size => {
                    const transformations = [
                        'q_auto',
                        'f_auto',
                        `w_${size}`,
                        'c_limit'
                    ].join(',');
                    return `${baseUrl}${transformations}/${imagePath} ${size}w`;
                })
                .join(', ');
        } catch (error) {
            console.warn('Error generating srcSet:', error);
            return undefined;
        }
    }, [src]);

    // Generate placeholder only for Cloudinary images
    const placeholderSrc = useMemo(() => {
        if (!src || !src.includes('cloudinary.com')) return undefined;

        try {
            const baseUrl = src.split('/upload/')[0] + '/upload/';
            const imagePath = src.split('/upload/')[1];
            
            // Create a tiny, blurred version for placeholder
            const transformations = [
                'w_20',
                'h_20',
                'q_10',
                'e_blur:1000',
                'f_auto'
            ].join(',');
            
            return `${baseUrl}${transformations}/${imagePath}`;
        } catch (error) {
            console.warn('Error generating placeholder:', error);
            return undefined;
        }
    }, [src]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <LazyLoadImage
                key={`${src}-${imageKey}`} // Force re-render when image changes
                className={className}
                alt={alt || 'Image'}
                effect="blur"
                src={getOptimizedUrl}
                srcSet={srcSet}
                sizes="(max-width: 640px) 200px, (max-width: 768px) 400px, (max-width: 1024px) 600px, 800px"
                placeholderSrc={placeholderSrc}
                threshold={100}
                loading="lazy"
                decoding="async"
                style={{
                    minHeight: '100%',
                    background: '#1f2937', // Rich black background
                    transition: 'opacity 0.3s ease-in-out'
                }}
                onError={(e) => {
                    console.error('❌ Image failed to load:', src);
                    console.error('Error details:', e);
                }}
                onLoad={() => {
                    console.log('✅ Image loaded successfully:', src);
                }}
            />
        </div>
    )
}

// Remove React.memo to ensure component re-renders when props change
export default Img
