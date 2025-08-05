const User = require('../models/user');
const Course = require('../models/course');
const CourseProgress = require('../models/courseProgress');
const Order = require('../models/order');
const mongoose = require('mongoose');

// Get user-specific analytics data
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user details with populated data
        const user = await User.findById(userId)
            .populate('courses')
            .populate({
                path: 'courseProgress',
                populate: {
                    path: 'courseID',
                    select: 'courseName thumbnail category'
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get enrolled courses count
        const enrolledCoursesCount = user.courses.length;

        // Calculate progress percentage for ALL enrolled courses first to get accurate completed count
        const courseProgressData = await Promise.all(
            user.courses.map(async (courseId) => {
                const course = await Course.findById(courseId).populate({
                    path: 'courseContent',
                    populate: {
                        path: 'subSection'
                    }
                });
                if (!course) return null;

                // Find progress for this course - check both courseProgress array and direct CourseProgress query
                let progress = user.courseProgress.find(p => p.courseID && p.courseID.toString() === courseId.toString());
                
                // If not found in populated data, query directly
                if (!progress) {
                    progress = await CourseProgress.findOne({
                        userId: userId,
                        courseID: courseId
                    });
                }

                let totalSubSections = 0;
                if (course.courseContent && course.courseContent.length > 0) {
                    course.courseContent.forEach(section => {
                        if (section.subSection && Array.isArray(section.subSection)) {
                            totalSubSections += section.subSection.length;
                        }
                    });
                }

                const completedCount = progress && progress.completedVideos ? progress.completedVideos.length : 0;
                const progressPercentage = totalSubSections > 0 ? (completedCount / totalSubSections) * 100 : 0;

                console.log(`Course: ${course.courseName}`);
                console.log(`Total SubSections: ${totalSubSections}`);
                console.log(`Completed Count: ${completedCount}`);
                console.log(`Progress Percentage: ${progressPercentage}`);
                console.log(`Progress Object:`, progress);

                return {
                    courseId: course._id,
                    courseName: course.courseName,
                    thumbnail: course.thumbnail,
                    progressPercentage: Math.round(progressPercentage),
                    completedVideos: completedCount,
                    totalVideos: totalSubSections,
                    lastAccessed: progress ? progress.updatedAt : course.createdAt,
                    enrolledAt: course.createdAt,
                    status: progressPercentage === 100 ? 'Completed' : progressPercentage > 0 ? 'In Progress' : 'Not Started'
                };
            })
        );

        const validCourseProgress = courseProgressData.filter(Boolean);
        
        // Calculate total videos and completed videos for stats and completion rate
        const totalVideosAcrossCourses = validCourseProgress.reduce((sum, course) => sum + course.totalVideos, 0);
        const totalCompletedVideos = validCourseProgress.reduce((sum, course) => sum + course.completedVideos, 0);
        
        // Calculate completion rate as percentage of total videos completed
        const completionRate = totalVideosAcrossCourses > 0 
            ? Math.round((totalCompletedVideos / totalVideosAcrossCourses) * 100)
            : 0;

        // Get completed courses count based on 100% progress
        const completedCoursesCount = validCourseProgress.filter(course => course.progressPercentage === 100).length;

        // Calculate total learning time from actual watch time data
        let totalLearningTime = 0;
        
        if (user.watchTime && user.watchTime instanceof Map) {
            // Sum all watch times (stored in seconds, convert to minutes)
            for (const [videoKey, watchTimeSeconds] of user.watchTime) {
                totalLearningTime += watchTimeSeconds / 60; // Convert seconds to minutes
            }
        }

        // Get recent course progress
        const recentProgress = user.courseProgress
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        // Get user's orders for purchase history analytics
        const userOrders = await Order.find({ user: userId })
            .populate('course', 'courseName price')
            .sort({ createdAt: -1 })
            .limit(10);

        // Calculate total spent
        const totalSpent = userOrders.reduce((total, order) => {
            return total + (order.amount || 0);
        }, 0);

        // Get course categories user is interested in
        const courseCategories = user.courses.map(course => course.category).filter(Boolean);
        const uniqueCategories = [...new Set(courseCategories)];

        // Get user's login history for the past 7 days (using course progress as proxy for activity)
        const weeklyActivity = [];
        const currentDate = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            // Get day boundaries
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            
            // Get course progress for this day and calculate actual video durations watched
            let totalMinutesForDay = 0;
            let lastActivity = null;

            // Get progress activities for the day
            const progressActivities = await CourseProgress.find({
                userId: userId,
                updatedAt: { $gte: dayStart, $lte: dayEnd }
            }).populate({
                path: 'courseID',
                populate: {
                    path: 'courseContent',
                    populate: {
                        path: 'subSection'
                    }
                }
            });

            // Calculate total video duration watched
            for (const progress of progressActivities) {
                if (progress.completedVideos && progress.courseID?.courseContent) {
                    progress.courseID.courseContent.forEach(section => {
                        if (section.subSection && Array.isArray(section.subSection)) {
                            section.subSection.forEach(subSection => {
                                if (progress.completedVideos.includes(subSection._id.toString())) {
                                    totalMinutesForDay += subSection.timeDuration ? (subSection.timeDuration / 60) : 0;
                                }
                            });
                        }
                    });
                }
                // Update last activity time
                if (!lastActivity || progress.updatedAt > lastActivity) {
                    lastActivity = progress.updatedAt;
                }
            }

            // Get order activities for the day
            const orderActivities = await Order.find({
                user: userId,
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            // Update last activity time if there are orders
            if (orderActivities.length > 0) {
                const latestOrder = orderActivities[orderActivities.length - 1].createdAt;
                if (!lastActivity || latestOrder > lastActivity) {
                    lastActivity = latestOrder;
                }
            }

            weeklyActivity.push({
                day: dayName,
                hours: Math.round((totalMinutesForDay / 60) * 100) / 100, // Convert minutes to hours with 2 decimal places
                lastActivity: lastActivity
            });
        }

        // Get recent activities for login history
        const recentActivities = await CourseProgress.find({ userId: userId })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('courseID', 'courseName');

        const recentOrders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('course', 'courseName');

        // validCourseProgress is already calculated above

        // Calculate learning streak based on consecutive days of login/activity
        let learningStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        // Get user's login history and course progress to determine active days
        // We'll use course progress updates as a proxy for daily activity
        const allProgressUpdates = await CourseProgress.find({
            userId: userId
        }).sort({ updatedAt: -1 });
        
        // Create a set of unique days when user was active
        const activeDays = new Set();
        allProgressUpdates.forEach(progress => {
            const progressDate = new Date(progress.updatedAt);
            progressDate.setHours(0, 0, 0, 0);
            activeDays.add(progressDate.getTime());
        });
        
        // Check consecutive days starting from yesterday (not today)
        let checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday
        
        // Count consecutive days going backwards
        for (let i = 0; i < 365; i++) { // Check up to 1 year back
            const dayTimestamp = checkDate.getTime();
            
            if (activeDays.has(dayTimestamp)) {
                learningStreak++;
                // Move to previous day
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // No activity on this day, break the streak
                break;
            }
        }
        
        // If user has activity today, add 1 to the streak
        const todayTimestamp = today.getTime();
        if (activeDays.has(todayTimestamp)) {
            learningStreak++;
        }

        // Get recent activities with more detailed information
        const allActivities = [];

        // Add course progress activities
        for (const activity of recentActivities) {
            const course = activity.courseID;
            if (course) {
                const completedVideos = activity.completedVideos?.length || 0;
                const details = `Updated progress in ${course.courseName} (${completedVideos} videos completed)`;
                allActivities.push({
                    action: 'Course Progress',
                    details: details,
                    timestamp: activity.updatedAt,
                    type: 'progress'
                });
            }
        }

        // Add enrollment activities
        for (const order of recentOrders) {
            const courseName = order.course ? order.course.courseName : 'Unknown Course';
            allActivities.push({
                action: 'Course Enrollment',
                details: `Enrolled in ${courseName}`,
                timestamp: order.createdAt,
                type: 'enrollment',
                amount: order.amount
            });
        }

        // Sort activities by timestamp
        allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const analytics = {
            overview: {
                enrolledCourses: enrolledCoursesCount,
                completedCourses: completedCoursesCount,
                totalLearningTime: Math.round(totalLearningTime * 100) / 100, // in minutes with 2 decimal precision
                totalSpent: totalSpent,
                completionRate: completionRate,
                totalVideos: totalVideosAcrossCourses,
                completedVideos: totalCompletedVideos
            },
            courseProgress: validCourseProgress,
            weeklyActivity: weeklyActivity,
            recentOrders: userOrders.slice(0, 5),
            categories: uniqueCategories,
            learningStreak: learningStreak,
            loginHistory: allActivities.slice(0, 10), // Get latest 10 activities
            monthlyGoal: {
                target: 20, // hours
                achieved: Math.round((totalLearningTime / 60) * 100) / 100, // convert minutes to hours with 2 decimal precision
                percentage: Math.min(Math.round((totalLearningTime / 60 / 20) * 100), 100)
            }
        };

        return res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Error fetching user analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching analytics data',
            error: error.message
        });
    }
};

// Get user's learning activity for a specific time period
exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = '7d' } = req.query; // 7d, 30d, 90d

        let startDate;
        const endDate = new Date();

        switch (period) {
            case '7d':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get course progress updates in the time period
        const progressUpdates = await CourseProgress.find({
            userId: userId,
            updatedAt: { $gte: startDate, $lte: endDate }
        }).populate('courseID', 'courseName');

        // Get orders in the time period
        const orders = await Order.find({
            user: userId,
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('course', 'courseName');

        // Filter out progress updates where courseID is null (deleted courses)
        const validProgressUpdates = progressUpdates.filter(progress => progress.courseID !== null);

        // Filter out orders with null courses (deleted courses)
        const validOrders = orders.filter(order => order.course);

        const activity = {
            progressUpdates: validProgressUpdates.map(progress => ({
                courseId: progress.courseID._id,
                courseName: progress.courseID.courseName,
                completedVideos: progress.completedVideos ? progress.completedVideos.length : 0,
                updatedAt: progress.updatedAt
            })),
            newEnrollments: validOrders.map(order => ({
                orderId: order._id,
                course: order.course ? order.course.courseName : 'Unknown Course',
                amount: order.amount,
                createdAt: order.createdAt
            }))
        };

        return res.status(200).json({
            success: true,
            data: activity
        });

    } catch (error) {
        console.error('Error fetching user activity:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching activity data',
            error: error.message
        });
    }
};

// Update user's watch time for a specific video
exports.updateWatchTime = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, subSectionId, watchTime } = req.body;

        // Validate required fields
        if (!courseId || !subSectionId || watchTime === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Course ID, SubSection ID, and watch time are required'
            });
        }

        // Find or create user's watch time record
        const User = require('../models/user');
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize watchTime object if it doesn't exist
        if (!user.watchTime) {
            user.watchTime = new Map();
        }

        // Create a unique key for this video
        const videoKey = `${courseId}_${subSectionId}`;
        
        // Get current watch time for this video or default to 0
        const currentWatchTime = user.watchTime.get(videoKey) || 0;
        
        // Add the new watch time (in seconds)
        const newWatchTime = currentWatchTime + watchTime;
        
        // Update the watch time
        user.watchTime.set(videoKey, newWatchTime);
        
        // Mark the field as modified for Mongoose
        user.markModified('watchTime');
        
        // Save the user
        await user.save();

        console.log(`Updated watch time for user ${userId}, video ${videoKey}: +${watchTime}s (total: ${newWatchTime}s)`);

        return res.status(200).json({
            success: true,
            message: 'Watch time updated successfully',
            data: {
                videoKey,
                addedTime: watchTime,
                totalTime: newWatchTime
            }
        });

    } catch (error) {
        console.error('Error updating watch time:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating watch time',
            error: error.message
        });
    }
};
