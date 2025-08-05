const multer = require('multer');
const path = require('path');

// Configure memory storage for direct streaming to Cloudinary
const storage = multer.memoryStorage();

const resumeUpload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for resumes
    },
    fileFilter: function (req, file, cb) {
        // Accept PDF and document files for resumes
        if (!file.originalname.match(/\.(pdf|doc|docx)$/i)) {
            return cb(new Error('Only PDF and Word document files are allowed for resumes!'), false);
        }
        cb(null, true);
    }
});

module.exports = { resumeUpload };
