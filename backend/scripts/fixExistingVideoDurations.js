const mongoose = require('mongoose');
const SubSection = require('../models/subSection');
const { extractVideoMetadata } = require('../utils/videoMetadata');
const { convertSecondsToDuration } = require('../utils/secToDuration');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

/**
 * Download video buffer from URL for metadata extraction
 * @param {string} videoUrl - The video URL
 * @returns {Promise<Buffer>} Video buffer
 */
async function downloadVideoBuffer(videoUrl, maxSize = 50 * 1024 * 1024) { // 50MB limit for metadata extraction
    return new Promise((resolve, reject) => {
        const client = videoUrl.startsWith('https:') ? https : http;
        
        console.log(`📥 Downloading video buffer from: ${videoUrl.substring(0, 100)}...`);
        
        const request = client.get(videoUrl, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            const chunks = [];
            let downloadedSize = 0;
            
            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                
                // Limit download size for metadata extraction (we don't need the full video)
                if (downloadedSize > maxSize) {
                    response.destroy();
                    console.log(`⚠️ Download stopped at ${(downloadedSize / (1024 * 1024)).toFixed(2)}MB (enough for metadata)`);
                    resolve(Buffer.concat(chunks));
                    return;
                }
                
                chunks.push(chunk);
            });
            
            response.on('end', () => {
                console.log(`✅ Downloaded ${(downloadedSize / (1024 * 1024)).toFixed(2)}MB for metadata extraction`);
                resolve(Buffer.concat(chunks));
            });
            
            response.on('error', (error) => {
                reject(error);
            });
        });
        
        request.on('error', (error) => {
            reject(error);
        });
        
        // Set timeout
        request.setTimeout(30000, () => {
            request.destroy();
            reject(new Error('Download timeout'));
        });
    });
}

/**
 * Extract video duration from URL
 * @param {string} videoUrl - The video URL
 * @returns {Promise<number>} Duration in seconds
 */
async function extractDurationFromUrl(videoUrl) {
    try {
        // Download partial video buffer for metadata extraction
        const videoBuffer = await downloadVideoBuffer(videoUrl);
        
        // Extract filename and mimetype from URL
        const urlParts = videoUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const extension = filename.split('.').pop().toLowerCase();
        
        const mimetypeMap = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'avi': 'video/avi',
            'mov': 'video/mov',
            'mkv': 'video/x-matroska'
        };
        
        const mimetype = mimetypeMap[extension] || 'video/mp4';
        
        // Extract metadata
        const metadata = await extractVideoMetadata(videoBuffer, {
            originalname: filename,
            size: videoBuffer.length,
            mimetype: mimetype
        });
        
        return metadata.duration;
        
    } catch (error) {
        console.error(`❌ Failed to extract duration from URL: ${error.message}`);
        return 0;
    }
}

async function fixExistingVideoDurations() {
    try {
        console.log('🔧 Starting video duration fix process...');
        console.log('=====================================\n');

        // Get all subsections with videos
        const subsections = await SubSection.find({ 
            videoUrl: { $exists: true, $ne: null, $ne: '' }
        });
        
        console.log(`Found ${subsections.length} subsections with videos to process\n`);

        let processed = 0;
        let updated = 0;
        let failed = 0;
        let skipped = 0;

        for (const subsection of subsections) {
            processed++;
            console.log(`\n--- Processing ${processed}/${subsections.length} ---`);
            console.log(`SubSection: ${subsection.title}`);
            console.log(`Current Duration: ${subsection.timeDuration}s (${convertSecondsToDuration(subsection.timeDuration)})`);
            console.log(`Video URL: ${subsection.videoUrl.substring(0, 80)}...`);
            
            try {
                // Extract new duration from video
                const newDuration = await extractDurationFromUrl(subsection.videoUrl);
                
                if (newDuration > 0) {
                    // Check if the duration is significantly different
                    const currentDuration = subsection.timeDuration || 0;
                    const difference = Math.abs(newDuration - currentDuration);
                    const percentageDiff = currentDuration > 0 ? (difference / currentDuration) * 100 : 100;
                    
                    console.log(`📊 Extracted Duration: ${newDuration}s (${convertSecondsToDuration(newDuration)})`);
                    console.log(`📈 Difference: ${difference}s (${percentageDiff.toFixed(1)}%)`);
                    
                    // Update if there's a significant difference (more than 5% or more than 10 seconds)
                    if (difference > 10 || percentageDiff > 5) {
                        subsection.timeDuration = newDuration;
                        await subsection.save();
                        
                        console.log(`✅ Updated duration: ${currentDuration}s → ${newDuration}s`);
                        updated++;
                    } else {
                        console.log(`⏭️ Duration is close enough, skipping update`);
                        skipped++;
                    }
                } else {
                    console.log(`❌ Failed to extract valid duration`);
                    failed++;
                }
                
            } catch (error) {
                console.error(`❌ Error processing subsection: ${error.message}`);
                failed++;
            }
            
            // Add a small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n🎯 Migration Summary:');
        console.log('====================');
        console.log(`Total subsections processed: ${processed}`);
        console.log(`Successfully updated: ${updated}`);
        console.log(`Skipped (duration close enough): ${skipped}`);
        console.log(`Failed to process: ${failed}`);
        
        if (updated > 0) {
            console.log('\n✅ Video duration fix completed successfully!');
            console.log('Course duration calculations should now be more accurate.');
        } else {
            console.log('\n⚠️ No durations were updated. This might indicate:');
            console.log('   - All durations were already accurate');
            console.log('   - Video metadata extraction is still failing');
            console.log('   - Network issues preventing video download');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the migration
fixExistingVideoDurations();
