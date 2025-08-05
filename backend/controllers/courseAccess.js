const CourseAccessRequest = require('../models/courseAccessRequest');
const BundleAccessRequest = require('../models/bundleAccessRequest');
const Course = require('../models/course');
const User = require('../models/user');
const Order = require('../models/order');
const RatingAndReview = require('../models/ratingAndReview');
const { convertSecondsToDuration } = require("../utils/secToDuration");
const mongoose = require('mongoose');

// ================ REQUEST COURSE ACCESS ================
exports.requestCourseAccess = async (req, res) => {
    try {
        const { courseId, requestMessage } = req.body;
        const userId = req.user.id;

        // Check if course exists and is free
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.courseType !== 'Free') {
            return res.status(400).json({
                success: false,
                message: 'This course is not available for free access'
            });
        }

        // Check if user is already enrolled
        if (course.studentsEnrolled.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Check if user already has a pending request
        const existingRequest = await CourseAccessRequest.findOne({
            user: userId,
            course: courseId,
            status: 'Pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request for this course'
            });
        }

        // Create new access request
        const accessRequest = await CourseAccessRequest.create({
            user: userId,
            course: courseId,
            requestMessage: requestMessage || '',
            status: 'Pending'
        });

        const populatedRequest = await CourseAccessRequest.findById(accessRequest._id)
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName thumbnail');

        return res.status(201).json({
            success: true,
            data: populatedRequest
        });

    } catch (error) {
        console.error('Error requesting course access:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting course access request',
            error: error.message
        });
    }
};

// ================ GET USER'S ACCESS REQUESTS ================
exports.getUserAccessRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await CourseAccessRequest.find({ user: userId })
            .populate('course', 'courseName thumbnail instructor')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
            message: 'Access requests fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching user access requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching access requests',
            error: error.message
        });
    }
};

// ================ GET ALL ACCESS REQUESTS (ADMIN) ================
exports.getAllAccessRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const requests = await CourseAccessRequest.find(filter)
            .populate('user', 'firstName lastName email image')
            .populate('course', 'courseName thumbnail instructor')
            .populate('course.instructor', 'firstName lastName')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalRequests = await CourseAccessRequest.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: requests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                hasNext: page * limit < totalRequests,
                hasPrev: page > 1
            },
            message: 'Access requests fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching access requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching access requests',
            error: error.message
        });
    }
};

// ================ APPROVE/REJECT ACCESS REQUEST (ADMIN) ================
exports.handleAccessRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, adminResponse } = req.body; // action: 'approve' or 'reject'
        const adminId = req.user.id;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "approve" or "reject"'
            });
        }

        const accessRequest = await CourseAccessRequest.findById(requestId)
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName studentsEnrolled');

        if (!accessRequest) {
            return res.status(404).json({
                success: false,
                message: 'Access request not found'
            });
        }

        if (accessRequest.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been processed'
            });
        }

        // Update request status
        accessRequest.status = action === 'approve' ? 'Approved' : 'Rejected';
        accessRequest.adminResponse = adminResponse || '';
        accessRequest.approvedBy = adminId;
        accessRequest.responseDate = new Date();

        await accessRequest.save();

        // If approved, enroll user in the course
        if (action === 'approve') {
            const course = await Course.findById(accessRequest.course._id);
            if (!course.studentsEnrolled.includes(accessRequest.user._id)) {
                course.studentsEnrolled.push(accessRequest.user._id);
                await course.save();
            }

            // Add course to user's enrolled courses
            const user = await User.findById(accessRequest.user._id);
            if (!user.courses.includes(accessRequest.course._id)) {
                user.courses.push(accessRequest.course._id);
                await user.save();
            }

            // Create order record for free course enrollment
            const freeOrderTransactionId = `FREE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await Order.create({
                user: accessRequest.user._id,
                course: accessRequest.course._id,
                amount: 0,
                status: true,
                paymentMethod: 'Free',
                transactionId: freeOrderTransactionId,
                purchaseDate: new Date()
            });
        }

        const updatedRequest = await CourseAccessRequest.findById(requestId)
            .populate('user', 'firstName lastName email')
            .populate('course', 'courseName thumbnail')
            .populate('approvedBy', 'firstName lastName');

        return res.status(200).json({
            success: true,
            message: `Access request ${action}d successfully`,
            data: updatedRequest
        });

    } catch (error) {
        console.error('Error handling access request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing access request',
            error: error.message
        });
    }
};

// Helper function to calculate average rating
const calculateAverageRating = async (courseId) => {
    try {
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { 
                        $avg: "$rating"
                    },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        if (result.length > 0) {
            return {
                averageRating: result[0].averageRating,
                totalRatings: result[0].totalRatings
            };
        }
        
        return {
            averageRating: 0,
            totalRatings: 0
        };
    } catch (error) {
        console.log('Error calculating average rating:', error);
        return {
            averageRating: 0,
            totalRatings: 0
        };
    }
};

// ================ GET FREE COURSES ================
exports.getFreeCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const skip = (page - 1) * limit;

        const filter = {
            courseType: 'Free',
            status: 'Published',
            isVisible: true
        };

        if (category) {
            filter.category = category;
        }

        const courses = await Course.find(filter)
            .populate('instructor', 'firstName lastName')
            .populate('category', 'name')
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "timeDuration"
                }
            })
            .select('courseName courseDescription thumbnail price originalPrice courseType tag createdAt studentsEnrolled courseContent')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Add average rating and total duration to each course
        const coursesWithRatingAndDuration = await Promise.all(
            courses.map(async (course) => {
                const ratingData = await calculateAverageRating(course._id);
                
                // Calculate total duration
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
                
                const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
                
                return {
                    ...course.toObject(),
                    averageRating: ratingData.averageRating,
                    totalRatings: ratingData.totalRatings,
                    totalDuration: totalDuration
                };
            })
        );

        const totalCourses = await Course.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: coursesWithRatingAndDuration,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCourses / limit),
                totalCourses,
                hasNext: page * limit < totalCourses,
                hasPrev: page > 1
            },
            message: 'Free courses fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching free courses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching free courses',
            error: error.message
        });
    }
};

// ================ REQUEST BUNDLE ACCESS ================
exports.requestBundleAccess = async (req, res) => {
    try {
        const { courseIds } = req.body;
        const userId = req.user.id;

        // Check if all courses exist and are free
        const courses = await Course.find({ _id: { $in: courseIds } });
        
        if (courses.length !== courseIds.length) {
            return res.status(404).json({
                success: false,
                message: 'One or more courses not found'
            });
        }

        // Verify all courses are free
        const nonFreeCourses = courses.filter(course => course.courseType !== 'Free');
        if (nonFreeCourses.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bundle contains non-free courses'
            });
        }

        // Check for existing pending bundle request
        const existingRequest = await BundleAccessRequest.findOne({
            user: userId,
            status: 'pending',
            courses: { $all: courseIds }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request for this bundle'
            });
        }

        // Create new bundle access request
        const bundleRequest = await BundleAccessRequest.create({
            user: userId,
            courses: courseIds,
            status: 'pending'
        });

        const populatedRequest = await BundleAccessRequest.findById(bundleRequest._id)
            .populate('user', 'firstName lastName email')
            .populate('courses', 'courseName thumbnail');

        return res.status(201).json({
            success: true,
            message: 'Bundle access request submitted successfully',
            data: populatedRequest
        });

    } catch (error) {
        console.error('Error requesting bundle access:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting bundle access request',
            error: error.message
        });
    }
};

// ================ GET ALL BUNDLE REQUESTS (ADMIN) ================
exports.getBundleRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const requests = await BundleAccessRequest.find(filter)
            .populate('user', 'firstName lastName email image')
            .populate('courses', 'courseName thumbnail instructor')
            .populate('processedBy', 'firstName lastName')
            .sort({ requestedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalRequests = await BundleAccessRequest.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: requests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                hasNext: page * limit < totalRequests,
                hasPrev: page > 1
            },
            message: 'Bundle requests fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching bundle requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching bundle requests',
            error: error.message
        });
    }
};

// ================ UPDATE BUNDLE REQUEST STATUS (ADMIN) ================
exports.updateBundleRequestStatus = async (req, res) => {
    try {
        const { bundleId } = req.params;
        const { status, notes } = req.body;
        const adminId = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Use "approved" or "rejected"'
            });
        }

        const bundleRequest = await BundleAccessRequest.findById(bundleId)
            .populate('user')
            .populate('courses');

        if (!bundleRequest) {
            return res.status(404).json({
                success: false,
                message: 'Bundle request not found'
            });
        }

        if (bundleRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This bundle request has already been processed'
            });
        }

        // Update request status
        bundleRequest.status = status;
        bundleRequest.notes = notes || '';
        bundleRequest.processedBy = adminId;
        bundleRequest.processedAt = new Date();

        await bundleRequest.save();

        // If approved, enroll user in all courses
        if (status === 'approved') {
            const courseUpdates = bundleRequest.courses.map(async (course) => {
                if (!course.studentsEnrolled.includes(bundleRequest.user._id)) {
                    course.studentsEnrolled.push(bundleRequest.user._id);
                    await course.save();
                }
            });

            await Promise.all(courseUpdates);

            // Add courses to user's enrolled courses
            const user = await User.findById(bundleRequest.user._id);
            bundleRequest.courses.forEach(course => {
                if (!user.courses.includes(course._id)) {
                    user.courses.push(course._id);
                }
            });
            await user.save();

            // Create order records for each free course in the bundle
            const orderCreationPromises = bundleRequest.courses.map(async (course) => {
                const freeOrderTransactionId = `FREE_BUNDLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                return Order.create({
                    user: bundleRequest.user._id,
                    course: course._id,
                    amount: 0,
                    status: true,
                    paymentMethod: 'Free',
                    transactionId: freeOrderTransactionId,
                    purchaseDate: new Date()
                });
            });

            await Promise.all(orderCreationPromises);
        }

        const updatedRequest = await BundleAccessRequest.findById(bundleId)
            .populate('user', 'firstName lastName email')
            .populate('courses', 'courseName thumbnail')
            .populate('processedBy', 'firstName lastName');

        return res.status(200).json({
            success: true,
            message: `Bundle request ${status} successfully`,
            data: updatedRequest
        });

    } catch (error) {
        console.error('Error updating bundle request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing bundle request',
            error: error.message
        });
    }
};
