const mongoose = require('mongoose');
require('dotenv').config();

const addIndexes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Add indexes for Course collection
        console.log('Adding indexes for Course collection...');
        
        // Index for courseType filtering
        await db.collection('courses').createIndex({ courseType: 1 });
        console.log('✓ Added index on courseType');

        // Compound index for search functionality
        await db.collection('courses').createIndex({ 
            courseName: 'text', 
            courseDescription: 'text' 
        });
        console.log('✓ Added text index on courseName and courseDescription');

        // Index for sorting by creation date
        await db.collection('courses').createIndex({ createdAt: -1 });
        console.log('✓ Added index on createdAt');

        // Compound index for filtering and sorting
        await db.collection('courses').createIndex({ 
            courseType: 1, 
            createdAt: -1 
        });
        console.log('✓ Added compound index on courseType and createdAt');

        // Index for instructor lookup
        await db.collection('courses').createIndex({ instructor: 1 });
        console.log('✓ Added index on instructor');

        // Add indexes for User collection
        console.log('Adding indexes for User collection...');
        
        // Index for instructor name search
        await db.collection('users').createIndex({ 
            firstName: 'text', 
            lastName: 'text' 
        });
        console.log('✓ Added text index on firstName and lastName');

        // Index for account type filtering
        await db.collection('users').createIndex({ accountType: 1 });
        console.log('✓ Added index on accountType');

        console.log('All indexes added successfully!');
        
    } catch (error) {
        console.error('Error adding indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

addIndexes();
