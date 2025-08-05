const FeaturedCourses = require('../models/FeaturedCourses');
const Course = require('../models/course');
const { convertSecondsToDuration } = require('../utils/secToDuration');

// Get featured courses
exports.getFeaturedCourses = async (req, res) => {
    try {
        console.log('=== FEATURED COURSES API CALLED ===');
        
        // Get featured courses document
        let featuredCoursesDoc = await FeaturedCourses.findOne();
        
        if (!featuredCoursesDoc) {
            featuredCoursesDoc = await FeaturedCourses.create({
                popularPicks: [],
                topEnrollments: []
            });
        }

        console.log('Featured courses IDs:', {
            popularPicks: featuredCoursesDoc.popularPicks,
            topEnrollments: featuredCoursesDoc.topEnrollments
        });

        // Manually fetch and populate courses
        const popularPicksIds = featuredCoursesDoc.popularPicks || [];
        const topEnrollmentsIds = featuredCoursesDoc.topEnrollments || [];

        // Fetch popular picks courses
        const popularPicksCourses = await Course.find({
            _id: { $in: popularPicksIds },
            status: 'Published'
        })
        .populate({
            path: 'instructor',
            select: 'firstName lastName email'
        })
        .populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
                select: 'timeDuration'
            }
        })
        .populate({
            path: 'ratingAndReviews',
            select: 'rating'
        });

        // Fetch top enrollments courses
        const topEnrollmentsCourses = await Course.find({
            _id: { $in: topEnrollmentsIds },
            status: 'Published'
        })
        .populate({
            path: 'instructor',
            select: 'firstName lastName email'
        })
        .populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
                select: 'timeDuration'
            }
        })
        .populate({
            path: 'ratingAndReviews',
            select: 'rating'
        });

        console.log('Fetched courses:', {
            popularPicksCount: popularPicksCourses.length,
            topEnrollmentsCount: topEnrollmentsCourses.length,
            firstPopularPick: popularPicksCourses[0] ? {
                name: popularPicksCourses[0].courseName,
                hasContent: !!popularPicksCourses[0].courseContent,
                contentLength: popularPicksCourses[0].courseContent?.length || 0
            } : 'none'
        });

        // Helper function to calculate rating data
        const calculateRatingData = (ratingAndReviews) => {
            if (!ratingAndReviews || ratingAndReviews.length === 0) {
                return { averageRating: 0, totalRatings: 0 };
            }
            
            const totalRating = ratingAndReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / ratingAndReviews.length;
            
            return {
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                totalRatings: ratingAndReviews.length
            };
        };

        // Calculate duration and rating for popular picks
        const processedPopularPicks = popularPicksCourses.map(course => {
            let totalDurationInSeconds = 0;
            if (course.courseContent) {
                course.courseContent.forEach((content) => {
                    if (content.subSection) {
                        content.subSection.forEach((subSection) => {
                            const timeDurationInSeconds = parseFloat(subSection.timeDuration);
                            if (!isNaN(timeDurationInSeconds) && timeDurationInSeconds > 0) {
                                totalDurationInSeconds += timeDurationInSeconds;
                            }
                        });
                    }
                });
            }
            
            const ratingData = calculateRatingData(course.ratingAndReviews);
            const courseObj = course.toObject();
            courseObj.totalDuration = convertSecondsToDuration(totalDurationInSeconds);
            courseObj.averageRating = ratingData.averageRating;
            courseObj.totalRatings = ratingData.totalRatings;
            delete courseObj.courseContent; // Remove courseContent from response
            delete courseObj.ratingAndReviews; // Remove ratingAndReviews from response
            return courseObj;
        });

        // Calculate duration and rating for top enrollments
        const processedTopEnrollments = topEnrollmentsCourses.map(course => {
            let totalDurationInSeconds = 0;
            if (course.courseContent) {
                course.courseContent.forEach((content) => {
                    if (content.subSection) {
                        content.subSection.forEach((subSection) => {
                            const timeDurationInSeconds = parseFloat(subSection.timeDuration);
                            if (!isNaN(timeDurationInSeconds) && timeDurationInSeconds > 0) {
                                totalDurationInSeconds += timeDurationInSeconds;
                            }
                        });
                    }
                });
            }
            
            const ratingData = calculateRatingData(course.ratingAndReviews);
            const courseObj = course.toObject();
            courseObj.totalDuration = convertSecondsToDuration(totalDurationInSeconds);
            courseObj.averageRating = ratingData.averageRating;
            courseObj.totalRatings = ratingData.totalRatings;
            delete courseObj.courseContent; // Remove courseContent from response
            delete courseObj.ratingAndReviews; // Remove ratingAndReviews from response
            return courseObj;
        });

        console.log('Processed courses with duration:', {
            popularPicks: processedPopularPicks.map(c => ({ name: c.courseName, duration: c.totalDuration })),
            topEnrollments: processedTopEnrollments.map(c => ({ name: c.courseName, duration: c.totalDuration }))
        });

        const result = {
            _id: featuredCoursesDoc._id,
            popularPicks: processedPopularPicks,
            topEnrollments: processedTopEnrollments,
            lastUpdated: featuredCoursesDoc.lastUpdated,
            __v: featuredCoursesDoc.__v
        };

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error in getFeaturedCourses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching featured courses',
            error: error.message
        });
    }
};

// Update featured courses (admin only)
exports.updateFeaturedCourses = async (req, res) => {
    try {
        const { popularPicks, topEnrollments } = req.body;

        console.log('Update request received:', {
            popularPicks: popularPicks ? popularPicks.length : 'undefined',
            topEnrollments: topEnrollments ? topEnrollments.length : 'undefined',
            popularPicksData: popularPicks,
            topEnrollmentsData: topEnrollments
        });

        // Get current featured courses to check existing counts
        let currentFeaturedCourses = await FeaturedCourses.findOne();
        
        console.log('Current featured courses:', {
            currentPopularPicks: currentFeaturedCourses?.popularPicks?.length || 0,
            currentTopEnrollments: currentFeaturedCourses?.topEnrollments?.length || 0
        });

        // Validate course IDs
        const allCourseIds = [...(popularPicks || []), ...(topEnrollments || [])];
        if (allCourseIds.length > 0) {
            const validCourses = await Course.find({
                _id: { $in: allCourseIds },
                status: 'Published'
            });

            const validCourseIds = validCourses.map(course => course._id.toString());
            const invalidCourseIds = allCourseIds.filter(id => !validCourseIds.includes(id));

            if (invalidCourseIds.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Some course IDs are invalid or unpublished',
                    invalidCourseIds
                });
            }
        }

        // Update or create featured courses
        let featuredCourses = currentFeaturedCourses;
        
        if (featuredCourses) {
            if (popularPicks !== undefined) {
                featuredCourses.popularPicks = popularPicks;
            }
            if (topEnrollments !== undefined) {
                featuredCourses.topEnrollments = topEnrollments;
            }
            featuredCourses.lastUpdated = Date.now();
            await featuredCourses.save();
        } else {
            featuredCourses = await FeaturedCourses.create({
                popularPicks: popularPicks || [],
                topEnrollments: topEnrollments || []
            });
        }

        console.log('Featured courses updated successfully:', {
            popularPicksCount: featuredCourses.popularPicks.length,
            topEnrollmentsCount: featuredCourses.topEnrollments.length
        });

        return res.status(200).json({
            success: true,
            data: featuredCourses
        });
    } catch (error) {
        console.error('Error in updateFeaturedCourses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating featured courses',
            error: error.message
        });
    }
};
