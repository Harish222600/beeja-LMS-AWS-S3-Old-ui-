const { extractVideoMetadata, extractVideoDuration, estimateDurationFromSize } = require('../utils/videoMetadata');
const { convertSecondsToDuration } = require('../utils/secToDuration');
const SubSection = require('../models/subSection');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

async function testVideoMetadataExtraction() {
    try {
        console.log('🔍 Testing Video Metadata Extraction Logic');
        console.log('==========================================\n');

        // Get a few subsections with videos to analyze
        const subsections = await SubSection.find({ 
            videoUrl: { $exists: true, $ne: null },
            timeDuration: { $exists: true, $ne: null }
        }).limit(3);

        console.log(`Found ${subsections.length} subsections with videos to analyze:\n`);

        for (let i = 0; i < subsections.length; i++) {
            const subsection = subsections[i];
            console.log(`--- SubSection ${i + 1} ---`);
            console.log(`Title: ${subsection.title}`);
            console.log(`Stored Duration: ${subsection.timeDuration} seconds (${convertSecondsToDuration(subsection.timeDuration)})`);
            console.log(`Video URL: ${subsection.videoUrl}`);
            
            // Test different file size scenarios for estimation
            console.log('\n🧪 Testing size estimation with different file sizes:');
            
            // Test with typical 3-minute video file sizes
            const testSizes = [
                { size: 50 * 1024 * 1024, description: '50MB (high quality 3min video)' },
                { size: 25 * 1024 * 1024, description: '25MB (medium quality 3min video)' },
                { size: 10 * 1024 * 1024, description: '10MB (low quality 3min video)' },
                { size: 100 * 1024 * 1024, description: '100MB (very high quality 3min video)' }
            ];

            testSizes.forEach(test => {
                const estimatedDuration = estimateDurationFromSize(test.size, 'video/mp4');
                console.log(`  ${test.description}: ${estimatedDuration}s (${convertSecondsToDuration(estimatedDuration)})`);
            });

            console.log('\n' + '='.repeat(50) + '\n');
        }

        // Test the estimation logic with known values
        console.log('🎯 Testing Size Estimation Logic:');
        console.log('================================\n');
        
        // For a 3-minute (180 seconds) video, what file sizes would be reasonable?
        const targetDuration = 180; // 3 minutes
        const bitrates = {
            'Low quality (1 Mbps)': 1000000,
            'Medium quality (2 Mbps)': 2000000,
            'High quality (5 Mbps)': 5000000,
            'Very high quality (10 Mbps)': 10000000
        };

        console.log(`For a ${targetDuration}s (3-minute) video:`);
        Object.entries(bitrates).forEach(([quality, bitrate]) => {
            const expectedFileSize = (bitrate * targetDuration) / 8; // Convert bits to bytes
            const fileSizeMB = (expectedFileSize / (1024 * 1024)).toFixed(1);
            console.log(`  ${quality}: ~${fileSizeMB}MB`);
            
            // Test reverse calculation
            const estimatedDuration = estimateDurationFromSize(expectedFileSize, 'video/mp4');
            console.log(`    → Estimated duration: ${estimatedDuration}s (${convertSecondsToDuration(estimatedDuration)})`);
        });

    } catch (error) {
        console.error('Error testing video metadata:', error);
    } finally {
        mongoose.connection.close();
    }
}

testVideoMetadataExtraction();
