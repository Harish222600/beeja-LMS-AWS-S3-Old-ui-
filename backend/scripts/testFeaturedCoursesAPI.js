const mongoose = require('mongoose');
const FeaturedCourses = require('../models/FeaturedCourses');
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

async function testFeaturedCoursesAPI() {
    try {
        console.log('Testing Featured Courses API...\n');

        // Test the same logic as the controller
        let featuredCourses = await FeaturedCourses.findOne()
            .populate({
                path: 'popularPicks',
                select: 'courseName courseDescription thumbnail instructor studentsEnrolled ratingAndReviews status price courseContent',
                populate: {
                    path: 'courseContent',
                    populate: {
                        path: 'subSection',
                        select: 'timeDuration'
                    }
                }
            })
            .populate({
                path: 'topEnrollments',
                select: 'courseName courseDescription thumbnail instructor studentsEnrolled ratingAndReviews status price courseContent',
                populate: {
                    path: 'courseContent',
                    populate: {
                        path: 'subSection',
                        select: 'timeDuration'
                    }
                }
            });

        if (!featuredCourses) {
            console.log('No featured courses found in database');
            return;
        }

        console.log('Raw Featured Courses Data:');
        console.log('Popular Picks:', featuredCourses.popularPicks?.length || 0);
        console.log('Top Enrollments:', featuredCourses.topEnrollments?.length || 0);

        // Process popular picks
        console.log('\n=== POPULAR PICKS ===');
        const processedPopularPicks = featuredCourses.popularPicks
            .filter(course => course.status === 'Published')
            .map(course => {
                console.log(`\nCourse: ${course.courseName}`);
                console.log(`Status: ${course.status}`);
                console.log(`Course Content sections: ${course.courseContent?.length || 0}`);
                
                let totalDurationInSeconds = 0;
                if (course.courseContent) {
                    course.courseContent.forEach((content, sectionIndex) => {
                        console.log(`  Section ${sectionIndex + 1}: ${content.subSection?.length || 0} subsections`);
                        if (content.subSection) {
                            content.subSection.forEach((subSection, subIndex) => {
                                const timeDurationInSeconds = parseFloat(subSection.timeDuration);
                                console.log(`    SubSection ${subIndex + 1}: ${subSection.timeDuration} seconds`);
                                if (!isNaN(timeDurationInSeconds) && timeDurationInSeconds > 0) {
                                    totalDurationInSeconds += timeDurationInSeconds;
                                }
                            });
                        }
                    });
                }
                
                const formattedDuration = convertSecondsToDuration(totalDurationInSeconds);
                console.log(`Total Duration: ${totalDurationInSeconds} seconds = ${formattedDuration}`);
                
                const courseObj = course.toObject();
                courseObj.totalDuration = formattedDuration;
                delete courseObj.courseContent;
                return courseObj;
            });

        // Process top enrollments
        console.log('\n=== TOP ENROLLMENTS ===');
        const processedTopEnrollments = featuredCourses.topEnrollments
            .filter(course => course.status === 'Published')
            .map(course => {
                console.log(`\nCourse: ${course.courseName}`);
                console.log(`Status: ${course.status}`);
                console.log(`Course Content sections: ${course.courseContent?.length || 0}`);
                
                let totalDurationInSeconds = 0;
                if (course.courseContent) {
                    course.courseContent.forEach((content, sectionIndex) => {
                        console.log(`  Section ${sectionIndex + 1}: ${content.subSection?.length || 0} subsections`);
                        if (content.subSection) {
                            content.subSection.forEach((subSection, subIndex) => {
                                const timeDurationInSeconds = parseFloat(subSection.timeDuration);
                                console.log(`    SubSection ${subIndex + 1}: ${subSection.timeDuration} seconds`);
                                if (!isNaN(timeDurationInSeconds) && timeDurationInSeconds > 0) {
                                    totalDurationInSeconds += timeDurationInSeconds;
                                }
                            });
                        }
                    });
                }
                
                const formattedDuration = convertSecondsToDuration(totalDurationInSeconds);
                console.log(`Total Duration: ${totalDurationInSeconds} seconds = ${formattedDuration}`);
                
                const courseObj = course.toObject();
                courseObj.totalDuration = formattedDuration;
                delete courseObj.courseContent;
                return courseObj;
            });

        console.log('\n=== FINAL RESULT ===');
        console.log('Processed Popular Picks:', processedPopularPicks.length);
        processedPopularPicks.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseName} - Duration: ${course.totalDuration}`);
        });

        console.log('\nProcessed Top Enrollments:', processedTopEnrollments.length);
        processedTopEnrollments.forEach((course, index) => {
            console.log(`${index + 1}. ${course.courseName} - Duration: ${course.totalDuration}`);
        });

    } catch (error) {
        console.error('Error testing featured courses API:', error);
    } finally {
        mongoose.connection.close();
    }
}

testFeaturedCoursesAPI();
