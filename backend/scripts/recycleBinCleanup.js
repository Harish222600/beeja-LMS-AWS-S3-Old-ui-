const cron = require('node-cron');
const { connectDB } = require('../config/database');
const RecycleBin = require('../models/recycleBin');
const Course = require('../models/course');
const User = require('../models/user');
const Category = require('../models/category');

// Auto-cleanup function
const cleanupExpiredItems = async () => {
    try {
        console.log('Starting recycle bin cleanup...');
        
        // Find expired items
        const expiredItems = await RecycleBin.find({
            expiresAt: { $lte: new Date() }
        });

        console.log(`Found ${expiredItems.length} expired items to cleanup`);

        let deletedCount = 0;
        
        for (const item of expiredItems) {
            try {
                // Permanently delete the original item based on type
                switch (item.itemType) {
                    case 'Course':
                        await Course.findByIdAndDelete(item.originalId);
                        console.log(`Permanently deleted course: ${item.originalId}`);
                        break;
                    case 'User':
                        await User.findByIdAndDelete(item.originalId);
                        console.log(`Permanently deleted user: ${item.originalId}`);
                        break;
                    case 'Category':
                        await Category.findByIdAndDelete(item.originalId);
                        console.log(`Permanently deleted category: ${item.originalId}`);
                        break;
                }
                
                // Remove from recycle bin
                await RecycleBin.findByIdAndDelete(item._id);
                deletedCount++;
                
            } catch (error) {
                console.error(`Error deleting item ${item._id}:`, error);
            }
        }

        console.log(`Cleanup completed. Permanently deleted ${deletedCount} items.`);
        
    } catch (error) {
        console.error('Error during recycle bin cleanup:', error);
    }
};

// Schedule cleanup to run daily at 2 AM
const scheduleCleanup = () => {
    // Run every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('Running scheduled recycle bin cleanup...');
        await cleanupExpiredItems();
    }, {
        scheduled: true,
        timezone: "UTC"
    });
    
    console.log('Recycle bin cleanup scheduled to run daily at 2:00 AM UTC');
};

// Manual cleanup function for testing
const runManualCleanup = async () => {
    try {
        await connectDB();
        await cleanupExpiredItems();
        process.exit(0);
    } catch (error) {
        console.error('Manual cleanup failed:', error);
        process.exit(1);
    }
};

// Check if script is run directly
if (require.main === module) {
    runManualCleanup();
}

module.exports = {
    cleanupExpiredItems,
    scheduleCleanup
};
