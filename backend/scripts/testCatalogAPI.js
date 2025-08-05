const mongoose = require('mongoose');
const Category = require('../models/category');
const Course = require('../models/course');
const User = require('../models/user');
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

async function testCatalogAPI() {
    try {
        // Get first category
        const category = await Category.findOne({}).lean();
        if (!category) {
            console.log('No categories found');
            return;
        }

        console.log('Testing category:', category.name);
        console.log('Course IDs in category:', category.courses);

        // Get courses with courseContent populated
        const courses = await Course.find({
            _id: { $in: category.courses },
            status: "Published",
            isVisible: true
        })
        .populate([
            {
                path: "instructor",
                select: "firstName lastName email"
            },
            {
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "timeDuration"
                }
            }
        ])
        .lean();

        console.log(`\nFound ${courses.length} courses`);

        courses.forEach((course, index) => {
            console.log(`\n--- Course ${index + 1}: ${course.courseName} ---`);
            console.log('Course ID:', course._id);
            console.log('Course Content sections:', course.courseContent?.length || 0);
            
            let totalDurationInSeconds = 0;
            if (course.courseContent) {
                course.courseContent.forEach((section, sectionIndex) => {
                    console.log(`  Section ${sectionIndex + 1}: ${section.subSection?.length || 0} subsections`);
                    if (section.subSection) {
                        section.subSection.forEach((subSection, subIndex) => {
                            const duration = parseFloat(subSection.timeDuration);
                            console.log(`    SubSection ${subIndex + 1}: ${subSection.timeDuration} seconds (${typeof subSection.timeDuration})`);
                            if (!isNaN(duration) && duration > 0) {
                                totalDurationInSeconds += duration;
                            }
                        });
                    }
                });
            }
            
            const formattedDuration = convertSecondsToDuration(totalDurationInSeconds);
            console.log(`Total Duration: ${totalDurationInSeconds} seconds = ${formattedDuration}`);
        });

    } catch (error) {
        console.error('Error testing catalog API:', error);
    } finally {
        mongoose.connection.close();
    }
}

testCatalogAPI();
