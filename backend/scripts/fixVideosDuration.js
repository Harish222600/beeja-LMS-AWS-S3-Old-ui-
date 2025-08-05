const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Section = require('../models/section');
const SubSection = require('../models/subSection');
const { convertSecondsToDuration } = require('../utils/secToDuration');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getVideoDuration(videoUrl) {
    try {
        // Extract public ID from Cloudinary URL
        const urlParts = videoUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        let publicId = '';
        
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
            const pathAfterUpload = urlParts.slice(uploadIndex + 1);
            if (pathAfterUpload[0] && pathAfterUpload[0].match(/^v\d+$/)) {
                pathAfterUpload.shift();
            }
            publicId = pathAfterUpload.join('/').replace(/\.[^/.]+$/, '');
        }

        if (!publicId) {
            console.error('Could not extract public ID from URL:', videoUrl);
            return null;
        }

        // Get resource details from Cloudinary
        const result = await cloudinary.api.resource(publicId, { resource_type: 'video' });
        return result.duration || null;
    } catch (error) {
        console.error('Error getting video duration:', error);
        return null;
    }
}

async function fixVideosDuration() {
    try {
        // Get all subsections
        const subsections = await SubSection.find({});
        console.log(`Found ${subsections.length} subsections to process`);

        let updated = 0;
        let failed = 0;

        // Process each subsection
        for (const subsection of subsections) {
            if (subsection.videoUrl && (!subsection.timeDuration || subsection.timeDuration === 0)) {
                console.log(`Processing subsection: ${subsection._id}`);
                const duration = await getVideoDuration(subsection.videoUrl);
                
                if (duration) {
                    subsection.timeDuration = duration;
                    await subsection.save();
                    console.log(`Updated duration for subsection ${subsection._id} (${subsection.title}): ${convertSecondsToDuration(duration)} (${duration}s)`);
                    updated++;
                } else {
                    console.log(`Failed to get duration for subsection ${subsection._id} (${subsection.title})`);
                    failed++;
                }
            }
        }

        console.log('\nMigration Summary:');
        console.log('------------------');
        console.log(`Total subsections processed: ${subsections.length}`);
        console.log(`Successfully updated: ${updated}`);
        console.log(`Failed to update: ${failed}`);
        console.log(`Skipped (already had duration): ${subsections.length - updated - failed}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the migration
fixVideosDuration();
