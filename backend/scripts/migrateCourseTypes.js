const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../models/course');

const migrateCourseTypes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find all courses that don't have courseType set
        const courses = await Course.find({
            $or: [
                { courseType: { $exists: false } },
                { adminSetFree: { $exists: false } },
                { originalPrice: { $exists: false } }
            ]
        });

        console.log(`Found ${courses.length} courses to update`);

        // Update each course
        for (const course of courses) {
            // Store original price if not already stored
            if (!course.originalPrice) {
                course.originalPrice = course.price;
            }

            // Set default course type to Paid
            if (!course.courseType) {
                course.courseType = 'Paid';
            }

            // Set default adminSetFree to false
            if (typeof course.adminSetFree === 'undefined') {
                course.adminSetFree = false;
            }

            await course.save();
            console.log(`Updated course: ${course._id}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateCourseTypes();
