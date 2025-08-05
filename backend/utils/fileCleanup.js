const fs = require('fs');
const path = require('path');

// Function to delete a file from the local filesystem
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Successfully deleted file: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }
};

// Function to delete all files in a directory that match a pattern
const deleteFilesInDirectory = (directory, pattern) => {
    try {
        if (fs.existsSync(directory)) {
            const files = fs.readdirSync(directory);
            files.forEach(file => {
                if (pattern.test(file)) {
                    deleteFile(path.join(directory, file));
                }
            });
        }
    } catch (error) {
        console.error(`Error cleaning directory ${directory}:`, error);
    }
};

// Function to extract video ID from Cloudinary URL
const getVideoIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0]; // Remove file extension
};

// Function to clean up course-related files
const cleanupCourseFiles = async (courseId, subsections) => {
    const uploadsDir = '/Users/joshwa/Documents/Internship/My Backend working project/beeja-project-merge/backend/tmp/uploads';

    try {
        // Delete local video files for each subsection
        for (const subsection of subsections) {
            // Get video ID from videoUrl if it exists
            if (subsection.videoUrl) {
                const videoId = getVideoIdFromUrl(subsection.videoUrl);
                if (videoId) {
                    // Try both mp4 and webm formats
                    deleteFile(path.join(uploadsDir, `${videoId}.mp4`));
                    deleteFile(path.join(uploadsDir, `${videoId}.webm`));
                    // Also try with video- prefix
                    deleteFile(path.join(uploadsDir, `video-${videoId}.mp4`));
                    deleteFile(path.join(uploadsDir, `video-${videoId}.webm`));
                }
            }
        }

        // Delete any remaining files associated with the course
        deleteFilesInDirectory(uploadsDir, new RegExp(`${courseId}`));

    } catch (error) {
        console.error('Error in cleanupCourseFiles:', error);
    }
};

module.exports = {
    deleteFile,
    deleteFilesInDirectory,
    cleanupCourseFiles
};
