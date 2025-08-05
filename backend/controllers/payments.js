const User = require("../models/user");
const Course = require("../models/course");
const Order = require("../models/order");
const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");

exports.capturePayment = async (req, res) => {
    try {
        const { coursesId, couponCode, discountAmount } = req.body;
        const userId = req.user.id;

        // Validate coursesId
        if (!coursesId || !Array.isArray(coursesId)) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid course IDs"
            });
        }

        // Check if user already enrolled in any of these courses
        const user = await User.findById(userId);
        const alreadyEnrolledCourses = coursesId.filter(courseId => 
            user.courses.includes(courseId)
        );

        if (alreadyEnrolledCourses.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in one or more of these courses"
            });
        }

        // Get course details
        const courses = await Course.find({ _id: { $in: coursesId } });
        
        if (!courses || courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Courses not found"
            });
        }

        // Log coupon usage if provided
        if (couponCode) {
            console.log(`Coupon ${couponCode} applied for user ${userId}, discount: ${discountAmount}`);
        }

        // For test development, proceed directly to enrollment
        return res.status(200).json({
            success: true,
            message: "Proceed with enrollment",
            couponApplied: !!couponCode
        });

    } catch (error) {
        console.error("Error in capturePayment:", error);
        res.status(500).json({
            success: false,
            message: "Could not process enrollment"
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { coursesId, couponCode, discountAmount } = req.body;
        const userId = req.user.id;

        if (!coursesId || !Array.isArray(coursesId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course IDs provided"
            });
        }

        // Find user and validate
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Validate courses exist
        const courses = await Course.find({ _id: { $in: coursesId } });
        if (courses.length !== coursesId.length) {
            throw new Error("One or more courses not found");
        }

        // Calculate final amounts for each course
        const totalOriginalPrice = courses.reduce((sum, course) => sum + (course.price || 0), 0);
        const totalDiscountAmount = discountAmount || 0;
        const finalAmount = Math.max(0, totalOriginalPrice - totalDiscountAmount);
        
        // Create order records for each course with active status
        const orderPromises = courses.map((course, index) => {
            // Calculate proportional discount for each course if multiple courses
            const courseOriginalPrice = course.price || 0;
            const courseDiscountAmount = courses.length > 1 
                ? Math.round((courseOriginalPrice / totalOriginalPrice) * totalDiscountAmount)
                : totalDiscountAmount;
            const courseFinalAmount = Math.max(0, courseOriginalPrice - courseDiscountAmount);

            const orderData = {
                user: userId,
                course: course._id,
                amount: courseFinalAmount,
                originalPrice: courseOriginalPrice,
                discountAmount: courseDiscountAmount,
                status: true, // Set as active by default
                paymentMethod: 'test', // Default payment method for testing
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                purchaseDate: new Date()
            };

            // Only add coupon information if coupon was actually used and has discount
            if (couponCode && courseDiscountAmount > 0) {
                orderData.couponUsed = {
                    code: couponCode,
                    discountType: 'flat', // Assuming flat discount for now
                    discountValue: courseDiscountAmount,
                    discountAmount: courseDiscountAmount
                };
            }
            // If no coupon used, don't include couponUsed field at all to avoid validation errors

            return Order.create(orderData);
        });

        const orders = await Promise.all(orderPromises);

        // Add courses to user's enrolled courses using $addToSet to avoid duplicates
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: { courses: { $each: coursesId } }
            },
            { new: true }
        );

        // Update course student counts
        await Course.updateMany(
            { _id: { $in: coursesId } },
            { $addToSet: { studentsEnrolled: userId } }
        );

        // If a coupon was used, log the usage
        if (couponCode) {
            console.log(`Verifying enrollment with coupon ${couponCode} for user ${userId}`);
            console.log(`Applied discount amount: ${discountAmount}`);
        }

        // Send confirmation emails
        for (const course of courses) {
            try {
                const emailSubject = couponCode 
                    ? `Successfully enrolled in ${course.courseName} with coupon ${couponCode}`
                    : `Successfully enrolled in ${course.courseName}`;

                await mailSender(
                    updatedUser.email,
                    emailSubject,
                    courseEnrollmentEmail(course.courseName, updatedUser.firstName)
                );
            } catch (emailError) {
                console.error("Error sending enrollment email:", emailError);
                // Don't fail the enrollment if email fails
            }
        }

        return res.status(200).json({
            success: true,
            message: "Courses enrolled successfully",
            couponApplied: !!couponCode
        });

    } catch (error) {
        console.error("Error in verifyPayment:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Could not complete enrollment"
        });
    }
};

exports.getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all orders for the user and populate course and user details
        const orders = await Order.find({ user: userId, status: true })
            .populate({
                path: 'course',
                model: 'Course',
                select: 'courseName description thumbnail instructor',
                populate: {
                    path: 'instructor',
                    model: 'User',
                    select: 'firstName lastName email'
                }
            })
            .populate({
                path: 'user',
                model: 'User',
                select: 'firstName lastName email additionalDetails',
                populate: {
                    path: 'additionalDetails',
                    model: 'Profile',
                    select: 'contactNumber'
                }
            })
            .sort({ purchaseDate: -1 });

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No purchase history found"
            });
        }

        // Transform the orders data to include all necessary details for invoices
        const purchaseHistory = orders.map(order => ({
            _id: order._id,
            courseName: order.course?.courseName || 'N/A',
            courseDescription: order.course?.description || '',
            thumbnail: order.course?.thumbnail || '',
            price: order.amount || 0,
            originalPrice: order.originalPrice || order.amount || 0,
            discountAmount: order.discountAmount || 0,
            purchaseDate: order.purchaseDate,
            status: "Completed",
            // Order details for invoice
            transactionId: order.transactionId,
            paymentMethod: order.paymentMethod,
            // Coupon information
            couponUsed: order.couponUsed || null,
            // Course and user details for invoice
            course: order.course,
            user: order.user
        }));

        return res.status(200).json({
            success: true,
            data: purchaseHistory
        });

    } catch (error) {
        console.error("Error fetching purchase history:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch purchase history",
            error: error.message
        });
    }
};
