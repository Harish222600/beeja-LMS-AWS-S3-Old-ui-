const mongoose = require('mongoose');
const SubSection = require('../models/subSection');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

async function checkSubSectionData() {
    try {
        const subsections = await SubSection.find({}).limit(5);
        console.log('Sample SubSection data:');
        console.log('======================');
        
        subsections.forEach((subsection, index) => {
            console.log(`\nSubSection ${index + 1}:`);
            console.log(`ID: ${subsection._id}`);
            console.log(`Title: ${subsection.title}`);
            console.log(`TimeDuration: ${subsection.timeDuration} (type: ${typeof subsection.timeDuration})`);
            console.log(`VideoUrl: ${subsection.videoUrl ? 'Present' : 'Missing'}`);
        });

        // Check total count
        const totalCount = await SubSection.countDocuments({});
        const withDuration = await SubSection.countDocuments({ 
            timeDuration: { $exists: true, $ne: null, $ne: 0, $ne: "" } 
        });
        const withoutDuration = await SubSection.countDocuments({ 
            $or: [
                { timeDuration: { $exists: false } }, 
                { timeDuration: null }, 
                { timeDuration: 0 }, 
                { timeDuration: "" }
            ] 
        });
        
        console.log('\n=== SUMMARY ===');
        console.log(`Total SubSections: ${totalCount}`);
        console.log(`With Duration > 0: ${withDuration}`);
        console.log(`Without Duration: ${withoutDuration}`);

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkSubSectionData();
