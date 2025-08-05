const mongoose = require('mongoose');
const ChunkedVideo = require('../models/chunkedVideo');
require('dotenv').config();

/**
 * Cleanup script for old incomplete chunked uploads
 * This script should be run periodically (e.g., daily via cron job)
 */
const cleanupOldUploads = async () => {
    try {
        console.log('🧹 Starting cleanup of old incomplete chunked uploads...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to database');
        
        // Clean up old uploads using the static method
        const deletedCount = await ChunkedVideo.cleanupOldUploads();
        
        console.log(`🎉 Cleanup completed. Removed ${deletedCount} old incomplete uploads.`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run cleanup if script is executed directly
if (require.main === module) {
    cleanupOldUploads();
}

module.exports = { cleanupOldUploads };
