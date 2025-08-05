const mongoose = require('mongoose');
const Course = require('../models/course');
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

async function testCourseDurationCalculation() {
    try {
        console.log('🎯 Testing Course Duration Calculation');
        console.log('=====================================\n');

        // Get courses with populated content
        const courses = await Course.find({})
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection',
                    select: 'title timeDuration'
                }
            })
            .limit(3);

        console.log(`Found ${courses.length} courses to test\n`);

        courses.forEach((course, index) => {
            console.log(`--- Course ${index + 1}: ${course.courseName} ---`);
            
            let totalDurationInSeconds = 0;
            let totalSubSections = 0;
            
            if (course.courseContent) {
                course.courseContent.forEach((section, sectionIndex) => {
                    console.log(`  Section ${sectionIndex + 1}: ${section.sectionName}`);
                    
                    if (section.subSection) {
                        section.subSection.forEach((subSection, subIndex) => {
                            const duration = parseFloat(subSection.timeDuration) || 0;
                            totalDurationInSeconds += duration;
                            totalSubSections++;
                            
                            console.log(`    SubSection ${subIndex + 1}: ${subSection.title}`);
                            console.log(`      Duration: ${duration}s (${convertSecondsToDuration(duration)})`);
                        });
                    }
                });
            }
            
            const formattedDuration = convertSecondsToDuration(totalDurationInSeconds);
            
            console.log(`\n📊 Course Summary:`);
            console.log(`   Total SubSections: ${totalSubSections}`);
            console.log(`   Total Duration: ${totalDurationInSeconds}s`);
            console.log(`   Formatted Duration: ${formattedDuration}`);
            console.log(`   Average per SubSection: ${totalSubSections > 0 ? Math.round(totalDurationInSeconds / totalSubSections) : 0}s`);
            
            // Check if duration seems reasonable
            const avgDurationPerSubSection = totalSubSections > 0 ? totalDurationInSeconds / totalSubSections : 0;
            if (avgDurationPerSubSection > 0 && avgDurationPerSubSection < 1800) { // Less than 30 minutes per subsection
                console.log(`   ✅ Duration seems reasonable`);
            } else if (avgDurationPerSubSection >= 1800) {
                console.log(`   ⚠️ Duration seems high (avg ${Math.round(avgDurationPerSubSection/60)} min per subsection)`);
            } else {
                console.log(`   ⚠️ No duration data available`);
            }
            
            console.log('\n' + '='.repeat(60) + '\n');
        });

        // Test the conversion function with various durations
        console.log('🧪 Testing Duration Conversion Function:');
        console.log('=======================================');
        
        const testDurations = [79, 210, 300, 3600, 7200, 0, -1, null, undefined];
        testDurations.forEach(duration => {
            const converted = convertSecondsToDuration(duration);
            console.log(`${duration} seconds → "${converted}"`);
        });

    } catch (error) {
        console.error('❌ Error testing course duration:', error);
    } finally {
        mongoose.connection.close();
    }
}

testCourseDurationCalculation();
