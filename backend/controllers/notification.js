const Notification = require('../models/notification');
const UserNotificationStatus = require('../models/userNotificationStatus');
const User = require('../models/user');
const Course = require('../models/course');

// Create a new notification (internal use) - Legacy function for backward compatibility
exports.createNotification = async (recipientId, type, title, message, relatedCourse = null) => {
    try {
        const notification = await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            relatedCourse
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Enhanced create notification with all fields - Legacy function for backward compatibility
exports.createAdvancedNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating advanced notification:', error);
        throw error;
    }
};

// New enhanced notification creation function
exports.createEnhancedNotification = async (notificationData) => {
    try {
        const {
            title,
            message,
            recipientType,
            recipients,
            type,
            sender,
            priority = 'medium',
            actionUrl,
            relatedCourse,
            relatedUser,
            metadata = {}
        } = notificationData;

        // Validate required fields
        if (!title || !message || !recipientType || !type) {
            throw new Error('Title, message, recipientType, and type are required');
        }

        // Validate recipientType
        if (!['All', 'Student', 'Instructor', 'Admin', 'Specific'].includes(recipientType)) {
            throw new Error('Invalid recipientType');
        }

        // If recipientType is 'Specific', recipients array is required
        if (recipientType === 'Specific' && (!recipients || recipients.length === 0)) {
            throw new Error('Recipients array is required for Specific recipientType');
        }

        // Create the notification
        const notification = await Notification.create({
            title,
            message,
            recipientType,
            recipients: recipientType === 'Specific' ? recipients : [],
            type,
            sender,
            priority,
            actionUrl,
            relatedCourse,
            relatedUser,
            metadata,
            isRead: false
        });

        console.log(`Created notification: ${notification._id} for ${recipientType}`);
        return notification;
    } catch (error) {
        console.error('Error creating enhanced notification:', error);
        throw error;
    }
};

// Helper function to get target users based on recipientType
const getTargetUsers = async (recipientType, recipients = []) => {
    let targetUsers = [];

    switch (recipientType) {
        case 'All':
            targetUsers = await User.find({ active: true }).select('_id accountType');
            break;
        case 'Student':
            targetUsers = await User.find({ 
                accountType: 'Student', 
                active: true 
            }).select('_id accountType');
            break;
        case 'Instructor':
            targetUsers = await User.find({ 
                accountType: 'Instructor', 
                active: true 
            }).select('_id accountType');
            break;
        case 'Admin':
            targetUsers = await User.find({ 
                accountType: 'Admin', 
                active: true 
            }).select('_id accountType');
            break;
        case 'Specific':
            targetUsers = await User.find({ 
                _id: { $in: recipients },
                active: true 
            }).select('_id accountType');
            break;
        default:
            throw new Error('Invalid recipientType');
    }

    return targetUsers;
};

// Check if user should receive notification
const shouldUserReceiveNotification = (notification, user) => {
    // Legacy notifications (with recipient field)
    if (notification.recipient) {
        return notification.recipient.toString() === user._id.toString();
    }

    // New notification system
    switch (notification.recipientType) {
        case 'All':
            return true;
        case 'Student':
            return user.accountType === 'Student';
        case 'Instructor':
            return user.accountType === 'Instructor';
        case 'Admin':
            return user.accountType === 'Admin';
        case 'Specific':
            return notification.recipients.some(
                recipientId => recipientId.toString() === user._id.toString()
            );
        default:
            return false;
    }
};

// Get user's notifications with enhanced role-based filtering
exports.getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, filter = 'all' } = req.query;
        const userId = req.user.id;
        const user = await User.findById(userId).select('accountType');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Build query for both legacy and new notifications
        const query = {
            recipient: userId,
            ...(filter === 'unread' && {
                $or: [
                    { read: false },
                    { isRead: false }
                ]
            })
        };

        // Get user's notification statuses
        const userStatuses = await UserNotificationStatus.find({
            user: userId
        }).select('notification read deleted');

        // Create a map of notification statuses for efficient lookup
        const statusMap = new Map(
            userStatuses.map(status => [
                status.notification.toString(),
                { read: status.read, deleted: status.deleted }
            ])
        );

        // Fetch notifications
        const notifications = await Notification.find(query)
            .populate('relatedCourse', 'courseName thumbnail')
            .populate('relatedUser', 'firstName lastName email')
            .populate('relatedSection', 'sectionName')
            .populate('relatedSubSection', 'title')
            .populate('sender', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Filter out deleted notifications and enhance with user-specific status
        const enhancedNotifications = notifications
            .filter(notification => {
                const status = statusMap.get(notification._id.toString());
                return !status?.deleted;
            })
            .map(notification => {
                const status = statusMap.get(notification._id.toString());
                const isRead = status?.read || notification.read || false;
                return {
                    ...notification.toObject(),
                    isRead: isRead,
                    read: isRead  // Add backward compatibility
                };
            });

        // Count total and unread notifications
        const totalNotifications = await Notification.countDocuments(query);
        const unreadCount = enhancedNotifications.filter(n => !n.isRead).length;

        return res.status(200).json({
            success: true,
            data: {
                notifications: enhancedNotifications,
                totalNotifications,
                unreadCount,
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// Mark notification as read with enhanced user status tracking
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        // Find the notification
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check if user should have access to this notification
        if (!shouldUserReceiveNotification(notification, req.user)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this notification'
            });
        }

        // Handle legacy notifications
        if (notification.recipient) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { read: true },
                { new: true }
            );
        }

        // Update or create user notification status
        await UserNotificationStatus.findOneAndUpdate(
            { user: userId, notification: notificationId },
            { read: true },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read with enhanced user status tracking
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('accountType');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

// Get all relevant notifications for the user
        const notifications = await Notification.find({
            $or: [
                // Legacy notifications (individual recipient)
                { recipient: userId },
                // New notification system - individual notifications for this user
                { 
                    recipient: userId,
                    type: { $exists: true }
                },
                // Bulk notifications where user matches the criteria
                {
                    $and: [
                        { recipient: userId },
                        { bulkId: { $exists: true } }
                    ]
                }
            ]
        });

        // Create status entries for all notifications
        const statusUpdates = notifications.map(notification => ({
            updateOne: {
                filter: { user: userId, notification: notification._id },
                update: { $set: { read: true } },
                upsert: true
            }
        }));

        // Update user notification statuses in bulk
        if (statusUpdates.length > 0) {
            await UserNotificationStatus.bulkWrite(statusUpdates);
        }

        // Update legacy notifications
        await Notification.updateMany(
            { recipient: userId },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read',
            error: error.message
        });
    }
};

// Delete (hide) a notification for a user
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.user.id;

        // Find the notification
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check if user should have access to this notification
        if (!shouldUserReceiveNotification(notification, req.user)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this notification'
            });
        }

        // For legacy notifications, perform hard delete
        if (notification.recipient?.toString() === userId) {
            await Notification.findOneAndDelete({
                _id: notificationId,
                recipient: userId
            });
        } else {
            // For new notifications, mark as deleted in user status
            await UserNotificationStatus.findOneAndUpdate(
                { user: userId, notification: notificationId },
                { deleted: true },
                { upsert: true }
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};

// Helper functions for specific notification types

// Student Notifications
exports.createCourseEnrollmentConfirmation = async (studentId, courseId) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: studentId,
            type: 'COURSE_ENROLLMENT_CONFIRMATION',
            title: 'Course Enrollment Confirmed',
            message: `You have successfully enrolled in "${course.courseName}". Start learning now!`,
            relatedCourse: courseId,
            priority: 'high',
            actionUrl: `/view-course/${courseId}`,
            metadata: { enrollmentDate: new Date() }
        });
    } catch (error) {
        console.error('Error creating enrollment confirmation:', error);
    }
};

exports.createNewContentNotification = async (courseId, sectionId, subSectionId) => {
    try {
        const course = await Course.findById(courseId)
            .populate('studentsEnrolled', '_id')
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection',
                    select: 'title'
                }
            });

        if (!course) return;

        const section = course.courseContent.find(s => s._id.toString() === sectionId);
        const subSection = section?.subSection?.find(ss => ss._id.toString() === subSectionId);

        if (!subSection) return;

        // Notify all enrolled students
        const notifications = course.studentsEnrolled.map(student => ({
            recipient: student._id,
            type: 'NEW_CONTENT_ADDED',
            title: 'New Content Available',
            message: `New content "${subSection.title}" has been added to "${course.courseName}"`,
            relatedCourse: courseId,
            relatedSection: sectionId,
            relatedSubSection: subSectionId,
            priority: 'medium',
            actionUrl: `/view-course/${courseId}`,
            metadata: { contentType: 'subsection' }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating new content notifications:', error);
    }
};

exports.createProgressMilestoneNotification = async (studentId, courseId, milestone) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: studentId,
            type: 'COURSE_PROGRESS_MILESTONE',
            title: 'Progress Milestone Reached!',
            message: `Congratulations! You've completed ${milestone}% of "${course.courseName}"`,
            relatedCourse: courseId,
            priority: 'medium',
            actionUrl: `/view-course/${courseId}`,
            metadata: { milestone, achievedAt: new Date() }
        });
    } catch (error) {
        console.error('Error creating progress milestone notification:', error);
    }
};

// Instructor Notifications
exports.createNewStudentEnrollmentNotification = async (instructorId, studentId, courseId) => {
    try {
        const [course, student] = await Promise.all([
            Course.findById(courseId).select('courseName'),
            User.findById(studentId).select('firstName lastName')
        ]);

        if (!course || !student) return;

        return await exports.createAdvancedNotification({
            recipient: instructorId,
            type: 'NEW_STUDENT_ENROLLMENT',
            title: 'New Student Enrollment',
            message: `${student.firstName} ${student.lastName} has enrolled in your course "${course.courseName}"`,
            relatedCourse: courseId,
            relatedUser: studentId,
            priority: 'medium',
            actionUrl: `/instructor/courses/${courseId}/students`,
            metadata: { enrollmentDate: new Date() }
        });
    } catch (error) {
        console.error('Error creating student enrollment notification:', error);
    }
};

exports.createNewRatingNotification = async (instructorId, courseId, rating, review) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: instructorId,
            type: 'NEW_RATING_ON_COURSE',
            title: 'New Course Rating',
            message: `Your course "${course.courseName}" received a ${rating}-star rating${review ? ' with a review' : ''}`,
            relatedCourse: courseId,
            priority: 'medium',
            actionUrl: `/instructor/courses/${courseId}/reviews`,
            metadata: { rating, hasReview: !!review }
        });
    } catch (error) {
        console.error('Error creating rating notification:', error);
    }
};

exports.createCourseStatusChangeNotification = async (instructorId, courseId, oldStatus, newStatus) => {
    try {
        const course = await Course.findById(courseId).select('courseName');
        if (!course) return;

        return await exports.createAdvancedNotification({
            recipient: instructorId,
            type: 'COURSE_STATUS_CHANGE',
            title: 'Course Status Updated',
            message: `Your course "${course.courseName}" status changed from ${oldStatus} to ${newStatus}`,
            relatedCourse: courseId,
            priority: newStatus === 'Published' ? 'high' : 'medium',
            actionUrl: `/instructor/courses/${courseId}`,
            metadata: { oldStatus, newStatus, changedAt: new Date() }
        });
    } catch (error) {
        console.error('Error creating course status change notification:', error);
    }
};

// Admin Notifications
exports.createNewCourseCreationNotification = async (courseId, instructorId) => {
    try {
        const [course, instructor, admins] = await Promise.all([
            Course.findById(courseId).select('courseName'),
            User.findById(instructorId).select('firstName lastName'),
            User.find({ accountType: 'Admin' }).select('_id')
        ]);

        if (!course || !instructor || !admins.length) return;

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'NEW_COURSE_CREATION',
            title: 'New Course Created',
            message: `${instructor.firstName} ${instructor.lastName} created a new course "${course.courseName}"`,
            relatedCourse: courseId,
            relatedUser: instructorId,
            priority: 'medium',
            actionUrl: `/admin/courses/${courseId}`,
            metadata: { createdAt: new Date() }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating course creation notifications:', error);
    }
};

exports.createNewUserRegistrationNotification = async (newUserId) => {
    try {
        const [newUser, admins] = await Promise.all([
            User.findById(newUserId).select('firstName lastName email accountType'),
            User.find({ accountType: 'Admin' }).select('_id')
        ]);

        if (!newUser || !admins.length) return;

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'NEW_USER_REGISTRATION',
            title: 'New User Registration',
            message: `${newUser.firstName} ${newUser.lastName} (${newUser.accountType}) has registered`,
            relatedUser: newUserId,
            priority: 'low',
            actionUrl: `/admin/users/${newUserId}`,
            metadata: { userType: newUser.accountType, registeredAt: new Date() }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating user registration notifications:', error);
    }
};

exports.createCourseModificationNotification = async (courseId, instructorId, modificationType) => {
    try {
        const [course, instructor, admins] = await Promise.all([
            Course.findById(courseId).select('courseName'),
            User.findById(instructorId).select('firstName lastName'),
            User.find({ accountType: 'Admin' }).select('_id')
        ]);

        if (!course || !instructor || !admins.length) return;

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'COURSE_MODIFICATION',
            title: 'Course Modified',
            message: `${instructor.firstName} ${instructor.lastName} made ${modificationType} changes to "${course.courseName}"`,
            relatedCourse: courseId,
            relatedUser: instructorId,
            priority: 'low',
            actionUrl: `/admin/courses/${courseId}`,
            metadata: { modificationType, modifiedAt: new Date() }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating course modification notifications:', error);
    }
};

// Bulk notification helpers
exports.notifyEnrolledStudents = async (courseId, notificationData) => {
    try {
        const course = await Course.findById(courseId).populate('studentsEnrolled', '_id');
        if (!course) return;

        const notifications = course.studentsEnrolled.map(student => ({
            ...notificationData,
            recipient: student._id,
            relatedCourse: courseId
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying enrolled students:', error);
    }
};

exports.notifyAllAdmins = async (notificationData) => {
    try {
        const admins = await User.find({ accountType: 'Admin' }).select('_id');
        const notifications = admins.map(admin => ({
            ...notificationData,
            recipient: admin._id
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying all admins:', error);
    }
};

exports.notifyAllInstructors = async (notificationData) => {
    try {
        const instructors = await User.find({ accountType: 'Instructor' }).select('_id');
        const notifications = instructors.map(instructor => ({
            ...notificationData,
            recipient: instructor._id
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying all instructors:', error);
    }
};

// Instructor Approval Notification
exports.createInstructorApprovalNotification = async (instructorId) => {
    try {
        const instructor = await User.findById(instructorId).select('firstName lastName email');
        
        if (!instructor) return;

        const notification = new Notification({
            recipient: instructorId,
            type: 'INSTRUCTOR_APPROVAL',
            title: 'Account Approved!',
            message: `Congratulations! Your instructor account has been approved. You can now create and manage courses.`,
            priority: 'high',
            actionUrl: '/dashboard/instructor',
            metadata: { approvedAt: new Date() }
        });

        await notification.save();
    } catch (error) {
        console.error('Error creating instructor approval notification:', error);
    }
};

// New Course Announcement to All Users
exports.createNewCourseAnnouncementToAll = async (courseId, instructorId) => {
    try {
        const [course, instructor, allUsers] = await Promise.all([
            Course.findById(courseId).select('courseName courseDescription thumbnail'),
            User.findById(instructorId).select('firstName lastName'),
            User.find({ 
                accountType: { $in: ['Student', 'Instructor'] },
                active: true 
            }).select('_id accountType')
        ]);

        if (!course || !instructor || !allUsers.length) return;

        const notifications = allUsers.map(user => ({
            recipient: user._id,
            type: 'NEW_COURSE_CREATION',
            title: 'New Course Available!',
            message: `${instructor.firstName} ${instructor.lastName} has created a new course "${course.courseName}". Check it out now!`,
            relatedCourse: courseId,
            relatedUser: instructorId,
            priority: 'medium',
            actionUrl: `/courses/${courseId}`,
            metadata: { 
                createdAt: new Date(),
                userType: user.accountType,
                announcementType: 'new_course_launch'
            }
        }));

        await Notification.insertMany(notifications);
        console.log(`Created ${notifications.length} new course announcement notifications`);
    } catch (error) {
        console.error('Error creating new course announcement notifications:', error);
    }
};

// Notify all students about new course
exports.notifyAllStudents = async (notificationData) => {
    try {
        const students = await User.find({ 
            accountType: 'Student',
            active: true 
        }).select('_id');
        
        const notifications = students.map(student => ({
            ...notificationData,
            recipient: student._id
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying all students:', error);
    }
};
