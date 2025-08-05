const User = require('../models/user');
const Course = require('../models/course');
const Profile = require('../models/profile');
const Order = require('../models/order');
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const Notification = require('../models/notification');
const UserNotificationStatus = require('../models/userNotificationStatus');
const AdminSectionViews = require('../models/adminSectionViews');
const RatingAndReview = require('../models/ratingAndReview');
const CourseAccessRequest = require('../models/courseAccessRequest');
const BundleAccessRequest = require('../models/bundleAccessRequest');
const ContactMessage = require('../models/contactMessage');
const JobApplication = require('../models/jobApplication');
const FAQ = require('../models/faq');
const Chat = require('../models/chat');
const { convertSecondsToDuration } = require('../utils/secToDuration');
const { 
    createInstructorApprovalNotification,
    createNewCourseCreationNotification,
    createNewCourseAnnouncementToAll
} = require('./notification');

// ================ TOGGLE USER STATUS ================
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Toggle user status request:', { userId, body: req.body });

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).populate('additionalDetails');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.active = !user.active;
        await user.save();

        const updatedUser = await User.findById(userId).populate('additionalDetails').select('-password');

        // If activating an instructor, send approval notification
        if (user.active && user.accountType === 'Instructor') {
            await createInstructorApprovalNotification(user._id);
        }

        return res.status(200).json({
            success: true,
            message: `User ${user.active ? 'activated' : 'deactivated'} successfully`,
            user: updatedUser
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error toggling user status',
            error: error.message
        });
    }
};

// ================ GET ALL USERS ================
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users (both active and inactive) - don't filter by active status
        // This allows admins to see and manage all users regardless of their status
        const users = await User.find({})
            .populate('additionalDetails')
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            users,
            message: 'Users fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// ================ CREATE USER ================
exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, accountType, contactNumber } = req.body;

        console.log('Create user request received:', {
            firstName,
            lastName,
            email,
            accountType,
            contactNumber: contactNumber ? 'provided' : 'not provided'
        });

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !accountType) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be provided',
                missingFields: {
                    firstName: !firstName,
                    lastName: !lastName,
                    email: !email,
                    password: !password,
                    accountType: !accountType
                }
            });
        }

        // Validate account type
        if (!['Admin', 'Instructor', 'Student'].includes(accountType)) {
            console.log('Invalid account type:', accountType);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid account type. Must be Admin, Instructor, or Student' 
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create profile
        console.log('Creating profile with contactNumber:', contactNumber);
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber || null
        });

        console.log('Profile created successfully:', profileDetails._id);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            approved: true,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        console.log('User created successfully:', user._id);

        // Remove password from response
        user.password = undefined;

        return res.status(201).json({
            success: true,
            user,
            
        });
    } catch (error) {
        console.error('Error creating user:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Handle specific MongoDB validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// ================ UPDATE USER ================
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, accountType, contactNumber } = req.body;

        const user = await User.findById(userId).populate('additionalDetails');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (accountType) user.accountType = accountType;

        if (contactNumber && user.additionalDetails) {
            await Profile.findByIdAndUpdate(user.additionalDetails._id, { contactNumber }, { new: true });
        }

        await user.save();

        const updatedUser = await User.findById(userId).populate('additionalDetails').select('-password');

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// ================ TOGGLE COURSE VISIBILITY ================
exports.toggleCourseVisibility = async (req, res) => {
    try {
        const { courseId } = req.params;

        console.log('Toggle course visibility request:', { courseId, body: req.body });

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name');
            
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const wasPublished = course.status === 'Published';
        const wasVisible = course.isVisible;
        
        // Toggle visibility
        course.isVisible = !course.isVisible;
        
        // When making visible, always set to Published
        // When hiding, set to Draft
        course.status = course.isVisible ? 'Published' : 'Draft';

        await course.save();

        console.log(`Course ${course.courseName} visibility toggled:`, {
            isVisible: course.isVisible,
            status: course.status,
            wasPublished,
            wasVisible
        });

        // Send notifications when course is made visible/published for the first time
        if (course.isVisible && !wasPublished) {
            try {
                await createNewCourseAnnouncementToAll(courseId, course.instructor._id);
                console.log("Public notifications sent for newly visible course:", course.courseName);
            } catch (notificationError) {
                console.error("Error sending course visibility notifications:", notificationError);
                // Don't fail the visibility toggle if notifications fail
            }
        }

        const updatedCourse = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name');

        return res.status(200).json({
            success: true,
            message: `Course ${course.isVisible ? 'published and visible' : 'hidden'} successfully`,
            course: updatedCourse
        });
    } catch (error) {
        console.error('Error toggling course visibility:', error);
        return res.status(500).json({
            success: false,
            message: 'Error toggling course visibility',
            error: error.message
        });
    }
};

// ================ DELETE USER ================
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Delete user request:', { userId, body: req.body, user: req.user?.id });

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).populate('additionalDetails');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        // Delete associated profile
        if (user.additionalDetails) {
            await Profile.findByIdAndDelete(user.additionalDetails._id);
        }

        // Delete the user
        await User.findByIdAndDelete(user._id);

        return res.status(200).json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
    } catch (error) {
        console.error('Delete user failed:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting user'
        });
    }
};

// ================ GET ALL COURSES ================
exports.getAllCourses = async (req, res) => {
    try {
        console.log('Fetching all active courses with populated category...');
        // Filter out courses that are deactivated (moved to recycle bin)
        const courses = await Course.find({
            $or: [
                { isDeactivated: { $exists: false } },
                { isDeactivated: false }
            ]
        })
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name _id')
            .populate({
                path: 'courseContent',
                populate: {
                    path: 'subSection',
                    model: 'SubSection',
                    select: 'timeDuration'
                }
            })
            .sort({ createdAt: -1 });

        console.log('Active courses fetched:', courses.length);
        console.log('Sample course category:', courses[0]?.category);

        // Calculate total duration for each course
        const coursesWithDuration = courses.map(course => {
            let totalDurationInSeconds = 0;
            
            // Calculate total duration from all subsections
            if (course.courseContent && course.courseContent.length > 0) {
                course.courseContent.forEach(section => {
                    if (section.subSection && section.subSection.length > 0) {
                        section.subSection.forEach(subSection => {
                            if (subSection.timeDuration && !isNaN(subSection.timeDuration)) {
                                totalDurationInSeconds += subSection.timeDuration;
                            }
                        });
                    }
                });
            }

            // Convert to course object and add duration fields
            const courseObj = course.toObject();
            courseObj.totalDurationInSeconds = totalDurationInSeconds;
            courseObj.totalDuration = convertSecondsToDuration(totalDurationInSeconds);
            
            // Remove the populated courseContent to reduce response size
            delete courseObj.courseContent;
            
            return courseObj;
        });

        return res.status(200).json({
            success: true,
            courses: coursesWithDuration,
            message: 'Active courses fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
};

// ================ GET COURSES FOR TYPE MANAGEMENT (OPTIMIZED) ================
exports.getCoursesForTypeManagement = async (req, res) => {
    try {
        console.log('Fetching active courses for type management (optimized)...');
        
        // Only fetch essential fields for course type management, excluding deactivated courses
        const courses = await Course.find({
            $or: [
                { isDeactivated: { $exists: false } },
                { isDeactivated: false }
            ]
        })
            .select('courseName thumbnail price originalPrice courseType adminSetFree createdAt instructor category')
            .populate('instructor', 'firstName lastName email image')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance

        console.log('Active courses fetched for type management:', courses.length);

        return res.status(200).json({
            success: true,
            courses,
            message: 'Active courses fetched successfully for type management'
        });
    } catch (error) {
        console.error('Error fetching courses for type management:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching courses for type management',
            error: error.message
        });
    }
};

// ================ APPROVE COURSE ================
exports.approveCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndUpdate(
            courseId,
            { status: 'Published' },
            { new: true }
        ).populate('instructor', 'firstName lastName email');

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Send notifications when course is approved and published
        try {
            await createNewCourseAnnouncementToAll(courseId, course.instructor._id);
            console.log("Public notifications sent for newly published course:", course.courseName);
        } catch (notificationError) {
            console.error("Error sending course approval notifications:", notificationError);
            // Don't fail the approval if notifications fail
        }

        return res.status(200).json({
            success: true,
            course,
            
        });
    } catch (error) {
        console.error('Error approving course:', error);
        return res.status(500).json({
            success: false,
            message: 'Error approving course',
            error: error.message
        });
    }
};

// ================ DELETE COURSE ================
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        console.log('Delete course request:', { courseId, body: req.body });

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName email')
            .populate('courseContent');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled || [];
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            });
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent || [];
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const Section = require('../models/section');
            const SubSection = require('../models/subSection');
            
            const section = await Section.findById(sectionId);
            if (section) {
                const subSections = section.subSection || [];
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId);
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId);
        }

        // Remove course from instructor's courses list
        if (course.instructor) {
            await User.findByIdAndUpdate(course.instructor._id, {
                $pull: { courses: courseId }
            });
        }

        // Remove course from category
        if (course.category) {
            const Category = require('../models/category');
            await Category.findByIdAndUpdate(course.category, {
                $pull: { courses: courseId }
            });
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({ 
            success: true, 
             
        });
    } catch (error) {
        console.error('Delete course failed:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error deleting course'
        });
    }
};

// ================ SET COURSE TYPE ================
exports.setCourseType = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { courseType } = req.body; // 'Paid' or 'Free'

        // Validate course type
        if (!['Paid', 'Free'].includes(courseType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid course type. Use "Paid" or "Free"'
            });
        }

        // First, get the current course to preserve the original price
        const currentCourse = await Course.findById(courseId);
        if (!currentCourse) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        let updateData = {
            courseType,
            adminSetFree: courseType === 'Free'
        };



        // Update the course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: updateData },
            { 
                new: true, // Return updated document
                select: 'courseName thumbnail price originalPrice courseType adminSetFree createdAt instructor category', // Only return needed fields
                populate: [
                    { path: 'instructor', select: 'firstName lastName email image' },
                    { path: 'category', select: 'name' }
                ]
            }
        );

        return res.status(200).json({
            success: true,
            message: `Course set as ${courseType.toLowerCase()} successfully`,
            data: updatedCourse
        });

    } catch (error) {
        console.error('Error setting course type:', error);
        return res.status(500).json({
            success: false,
            message: 'Error setting course type',
            error: error.message
        });
    }
};

// ================ GET ANALYTICS DATA ================
exports.getAnalytics = async (req, res) => {
    try {
        // Count all users (both active and inactive) for total count
        const totalUsers = await User.countDocuments({});
        const activeUsers = await User.countDocuments({ active: true });
        const inactiveUsers = await User.countDocuments({ active: false });
        
        // Count by account type (both active and inactive)
        const studentCount = await User.countDocuments({ accountType: 'Student' });
        const instructorCount = await User.countDocuments({ accountType: 'Instructor' });
        const adminCount = await User.countDocuments({ accountType: 'Admin' });
        
        // Count active users by account type
        const activeStudentCount = await User.countDocuments({ accountType: 'Student', active: true });
        const activeInstructorCount = await User.countDocuments({ accountType: 'Instructor', active: true });
        const activeAdminCount = await User.countDocuments({ accountType: 'Admin', active: true });

        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ status: 'Published' });
        const draftCourses = await Course.countDocuments({ status: 'Draft' });
        const freeCourses = await Course.countDocuments({ courseType: 'Free' });
        const paidCourses = await Course.countDocuments({ courseType: 'Paid' });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get pending access requests count
        const CourseAccessRequest = require('../models/courseAccessRequest');
        const pendingRequests = await CourseAccessRequest.countDocuments({ status: 'Pending' });

        // Get recent courses (last 30 days to show more courses)
        const thirtyDaysAgoForCourses = new Date();
        thirtyDaysAgoForCourses.setDate(thirtyDaysAgoForCourses.getDate() - 30);
        
        console.log('Fetching recent courses created after:', thirtyDaysAgoForCourses);
        
        const recentCourses = await Course.find({
            createdAt: { $gte: thirtyDaysAgoForCourses }
        })
        .populate('instructor', 'firstName lastName')
        .populate('category', 'name')
        .select('courseName createdAt instructor category status price courseType')
        .sort({ createdAt: -1 })
        .limit(10);

        console.log('Found recent courses:', recentCourses.length);
        console.log('Recent courses data:', recentCourses.map(course => ({
            name: course.courseName,
            createdAt: course.createdAt,
            instructor: course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown'
        })));

        // Get recent user logins (last 7 days to show more activity)
        const sevenDaysAgoForUsers = new Date();
        sevenDaysAgoForUsers.setDate(sevenDaysAgoForUsers.getDate() - 7);
        
        console.log('Fetching recent users created after:', sevenDaysAgoForUsers);
        
        // For recent logins, we'll get recently created users as a proxy since we don't track login times
        const recentLogins = await User.find({
            createdAt: { $gte: sevenDaysAgoForUsers }
        })
        .select('firstName lastName email accountType createdAt active')
        .sort({ createdAt: -1 })
        .limit(10);

        console.log('Found recent users:', recentLogins.length);

        // Get active users (users created in last 30 days)
        const activeLogins = await User.find({
            createdAt: { $gte: thirtyDaysAgo }
        })
        .select('firstName lastName email accountType createdAt active')
        .sort({ createdAt: -1 })
        .limit(10);

        return res.status(200).json({
            success: true,
            analytics: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers,
                    students: studentCount,
                    instructors: instructorCount,
                    admins: adminCount,
                    activeStudents: activeStudentCount,
                    activeInstructors: activeInstructorCount,
                    activeAdmins: activeAdminCount,
                    recentRegistrations
                },
                courses: {
                    total: totalCourses,
                    published: publishedCourses,
                    draft: draftCourses,
                    free: freeCourses,
                    paid: paidCourses
                },
                requests: {
                    pendingAccessRequests: pendingRequests
                },
                recentCourses: recentCourses,
                recentLogins: recentLogins,
                activeLogins: activeLogins
            },
            message: 'Analytics data fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// ================ GET ALL INSTRUCTORS ================
exports.getAllInstructors = async (req, res) => {
    try {
        // Only fetch active instructors (exclude instructors that have been moved to recycle bin)
        const instructors = await User.find({ accountType: 'Instructor', active: true })
            .select('firstName lastName email _id')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Instructors fetched successfully',
            instructors
        });

    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.sendNotification = async (req, res) => {
    try {
        const { title, message, recipients, selectedUsers, relatedCourse, priority = 'medium' } = req.body;

        console.log('=== SEND NOTIFICATION DEBUG ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Recipients:', recipients);
        console.log('Selected Users:', selectedUsers);
        console.log('Selected Users type:', typeof selectedUsers);
        console.log('Selected Users length:', selectedUsers?.length);

        // Validate admin user
        if (!req.user?.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: Admin ID missing' 
            });
        }

        // Validate required fields
        if (!title?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required and cannot be empty'
            });
        }

        if (!recipients || !['all', 'students', 'instructors', 'admins', 'specific'].includes(recipients)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid recipient type. Must be one of: all, students, instructors, admins, specific'
            });
        }

        // Validate specific recipients
        if (recipients === 'specific') {
            if (!selectedUsers || !Array.isArray(selectedUsers) || selectedUsers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected users array is required for specific recipients'
                });
            }

            // Validate each user ID format - simplified validation
            const invalidIds = [];
            for (const id of selectedUsers) {
                if (!id || typeof id !== 'string' || id.length !== 24) {
                    invalidIds.push(id);
                }
            }
            
            if (invalidIds.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid user IDs: ${invalidIds.join(', ')}`
                });
            }

            // Verify users exist - with error handling
            try {
                const validUsers = await User.find({
                    _id: { $in: selectedUsers },
                    active: true
                }).select('_id');

                if (validUsers.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No valid active users found from the selected users'
                    });
                }

                if (validUsers.length !== selectedUsers.length) {
                    const foundIds = validUsers.map(u => u._id.toString());
                    const notFoundIds = selectedUsers.filter(id => !foundIds.includes(id));
                    console.log('Some users were not found or are inactive:', notFoundIds);
                }
            } catch (userValidationError) {
                console.error('Error validating users:', userValidationError);
                return res.status(400).json({
                    success: false,
                    message: 'Error validating selected users'
                });
            }
        }

        // Validate priority
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority. Must be one of: low, medium, high'
            });
        }

        // Get target users based on recipient type
        let targetUsers = [];
        let recipientType = '';

        console.log('Processing recipients:', recipients);
        console.log('Selected users:', selectedUsers);

        switch (recipients) {
            case 'all':
                recipientType = 'All';
                targetUsers = await User.find({ active: true }).select('_id accountType firstName lastName');
                break;
            case 'students':
                recipientType = 'Student';
                targetUsers = await User.find({ 
                    accountType: 'Student', 
                    active: true 
                }).select('_id accountType firstName lastName');
                break;
            case 'instructors':
                recipientType = 'Instructor';
                targetUsers = await User.find({ 
                    accountType: 'Instructor', 
                    active: true 
                }).select('_id accountType firstName lastName');
                break;
            case 'admins':
                recipientType = 'Admin';
                targetUsers = await User.find({ 
                    accountType: 'Admin', 
                    active: true 
                }).select('_id accountType firstName lastName');
                break;
            case 'specific':
                recipientType = 'Specific';
                if (!selectedUsers || !Array.isArray(selectedUsers) || selectedUsers.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Selected users are required for specific recipients'
                    });
                }
                
                console.log('Processing specific users:', selectedUsers);
                
                // Find valid users
                targetUsers = await User.find({
                    _id: { $in: selectedUsers },
                    active: true
                }).select('_id accountType firstName lastName');
                
                console.log(`Found ${targetUsers.length} valid users out of ${selectedUsers.length} selected`);
                
                if (targetUsers.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No valid active users found from the selected users'
                    });
                }
                
                // Log which users were not found (for debugging)
                const foundUserIds = targetUsers.map(user => user._id.toString());
                const notFoundUsers = selectedUsers.filter(id => !foundUserIds.includes(id));
                if (notFoundUsers.length > 0) {
                    console.log('Users not found or inactive:', notFoundUsers);
                }
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid recipients type'
                });
        }

        if (targetUsers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid users found for the selected recipient type'
            });
        }

        // Generate a unique bulk ID for grouping these notifications
        const bulkId = new mongoose.Types.ObjectId();

        // Create individual notification records for each target user
        const notifications = targetUsers.map(user => ({
            recipient: user._id,
            recipientType: recipientType,
            recipients: recipients === 'specific' ? selectedUsers : undefined,
            type: 'ADMIN_ANNOUNCEMENT',
            title,
            message,
            sender: req.user.id,
            priority,
            relatedCourse: relatedCourse || null,
            bulkId: bulkId,
            isRead: false,
            read: false,
            metadata: {
                sentByAdmin: true,
                adminId: req.user.id,
                sentAt: new Date(),
                recipientType: recipientType,
                recipients: recipients === 'specific' ? selectedUsers : undefined,
                targetUsers: recipients === 'specific' ? selectedUsers : undefined,
                bulkId: bulkId
            },
            createdAt: new Date()
        }));

        // Insert all notifications in bulk
        const insertedNotifications = await Notification.insertMany(notifications);

        console.log(`Created ${insertedNotifications.length} individual notifications for ${recipientType} users with bulkId: ${bulkId}`);

        return res.status(201).json({
            success: true,
            message: `Notification sent to ${targetUsers.length} users successfully`,
            data: {
                notificationId: bulkId,
                title,
                recipientType,
                recipientCount: targetUsers.length,
                priority,
                bulkId: bulkId
            }
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error sending notification',
            error: error.message
        });
    }
};
// Get all notifications sent by admin
exports.getAllNotifications = async (req, res) => {
    try {
        // First, get distinct bulkIds from both the dedicated field and metadata
        const distinctBulkIds = await Notification.distinct('bulkId', {
            $or: [
                { 'metadata.sentByAdmin': true },
                { type: 'ADMIN_ANNOUNCEMENT' }
            ],
            bulkId: { $exists: true, $ne: null }
        });

        // Also get bulkIds from metadata for backward compatibility
        const metadataBulkIds = await Notification.distinct('metadata.bulkId', {
            $or: [
                { 'metadata.sentByAdmin': true },
                { type: 'ADMIN_ANNOUNCEMENT' }
            ],
            'metadata.bulkId': { $exists: true, $ne: null }
        });

        // Combine both arrays and remove duplicates
        const allBulkIds = [...new Set([...distinctBulkIds, ...metadataBulkIds])];

        // Get all admin notifications with populated user data
        const allNotifications = await Notification.find({
            $or: [
                { 'metadata.sentByAdmin': true },
                { type: 'ADMIN_ANNOUNCEMENT' }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'firstName lastName email')
        .populate('recipient', 'firstName lastName email'); // Populate recipient details for specific notifications

        // Group notifications
        const groupedNotifications = new Map();
        
        // First, handle notifications with bulkIds
        for (const bulkId of allBulkIds) {
            const bulkNotifications = allNotifications.filter(
                n => n.bulkId?.toString() === bulkId.toString() || 
                     n.metadata?.bulkId?.toString() === bulkId.toString()
            );
            
            if (bulkNotifications.length > 0) {
                const firstNotification = bulkNotifications[0];
                groupedNotifications.set(bulkId.toString(), {
                    _id: firstNotification._id,
                    title: firstNotification.title,
                    message: firstNotification.message,
                    sender: firstNotification.sender,
                    recipients: (() => {
                        // For specific recipients, show actual email addresses
                        if (firstNotification.metadata?.recipientType === 'Specific' || 
                            firstNotification.recipientType === 'Specific') {
                            const emails = bulkNotifications
                                .filter(n => n.recipient && n.recipient.email)
                                .map(n => n.recipient.email);
                            return emails.length > 0 ? emails.join(', ') : 'Specific users';
                        }
                        // For bulk recipients (all, students, instructors, admins), show the type
                        return firstNotification.metadata?.recipientType || 
                               firstNotification.recipientType || 'unknown';
                    })(),
                    relatedCourse: firstNotification.relatedCourse,
                    createdAt: firstNotification.createdAt,
                    recipientCount: bulkNotifications.length,
                    readCount: bulkNotifications.filter(n => n.read).length,
                    type: firstNotification.type,
                    bulkId: bulkId,
                    priority: firstNotification.priority || 'normal'
                });
            }
        }

        // Then handle individual notifications (without bulkId)
        allNotifications
            .filter(notification => !notification.bulkId && !notification.metadata?.bulkId)
            .forEach(notification => {
                groupedNotifications.set(notification._id.toString(), {
                    _id: notification._id,
                    title: notification.title,
                    message: notification.message,
                    sender: notification.sender,
                    recipients: notification.recipient?.email || notification.recipientType || 'unknown',
                    relatedCourse: notification.relatedCourse,
                    createdAt: notification.createdAt,
                    recipientCount: 1,
                    readCount: notification.read ? 1 : 0,
                    type: notification.type,
                    bulkId: null,
                    priority: notification.priority || 'normal'
                });
            });

        // Convert map to array and sort by creation date
        const formattedNotifications = Array.from(groupedNotifications.values())
            .map(notification => ({
                ...notification,
                // Use bulkId as displayId for bulk notifications, otherwise use the notification _id
                displayId: notification.bulkId || notification._id
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 50); // Limit to 50 most recent

        console.log('Found grouped notifications:', formattedNotifications.length);

        return res.status(200).json({
            success: true,
            data: formattedNotifications,
            message: 'Notifications fetched successfully'
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

exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        console.log('Delete notification request:', { 
            notificationId, 
            user: req.user?.id,
            userType: req.user?.accountType 
        });

        // Validate notification ID format
        if (!notificationId) {
            console.log('Missing notification ID');
            return res.status(400).json({
                success: false,
                message: 'Notification ID is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            console.log('Invalid notification ID format:', notificationId);
            return res.status(400).json({
                success: false,
                message: 'Invalid notification ID format'
            });
        }

        // Check if this is a bulk notification (using bulkId) or individual notification
        let deletedCount = 0;
        
        // First, try to find notifications with this bulkId
        const bulkNotifications = await Notification.find({ bulkId: notificationId });
        
        if (bulkNotifications.length > 0) {
            // This is a bulk notification - delete all notifications with this bulkId
            console.log(`Found ${bulkNotifications.length} notifications with bulkId: ${notificationId}`);
            
            // Delete related user notification statuses for all bulk notifications
            const bulkNotificationIds = bulkNotifications.map(n => n._id);
            const statusDeleteResult = await UserNotificationStatus.deleteMany({
                notification: { $in: bulkNotificationIds }
            });
            console.log(`Deleted ${statusDeleteResult.deletedCount} user notification statuses for bulk notifications`);

            // Delete all notifications with this bulkId
            const deleteResult = await Notification.deleteMany({ bulkId: notificationId });
            deletedCount = deleteResult.deletedCount;
            console.log(`Successfully deleted ${deletedCount} bulk notifications`);
        } else {
            // Try to find individual notification by ID
            const notification = await Notification.findById(notificationId);
            if (!notification) {
                console.log('Notification not found in database');
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found'
                });
            }

            console.log('Found individual notification to delete:', {
                id: notification._id,
                title: notification.title,
                type: notification.type
            });

            // Delete related user notification statuses
            const statusDeleteResult = await UserNotificationStatus.deleteMany({
                notification: notificationId
            });
            console.log(`Deleted ${statusDeleteResult.deletedCount} user notification statuses`);

            // Delete the individual notification
            await Notification.findByIdAndDelete(notificationId);
            deletedCount = 1;
            console.log('Successfully deleted individual notification');
        }

        return res.status(200).json({
            success: true,
            message: `${deletedCount} notification${deletedCount > 1 ? 's' : ''} deleted successfully`,
            deletedCount: deletedCount
        });

    } catch (error) {
        console.error('Error deleting notification:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            notificationId: req.params?.notificationId
        });
        
        return res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
// ================ CREATE COURSE AS ADMIN ================
exports.createCourseAsAdmin = async (req, res) => {
    try {
        console.log('Create course request received:', {
            body: req.body,
            files: req.files ? Object.keys(req.files) : 'No files'
        });

        const {
            courseName,
            courseDescription,
            price,
            category,
            whatYouWillLearn,
            instructorId,
            status,
            tag,
            instructions
        } = req.body;

        // Get the thumbnail image from the request - fix variable naming
        const thumbnailImage = req.files?.thumbnailImage?.[0];

        console.log('Extracted data:', {
            courseName,
            courseDescription,
            price,
            category,
            whatYouWillLearn,
            instructorId,
            status,
            tag,
            instructions,
            thumbnailImage: thumbnailImage ? 'File present' : 'No file'
        });

        // Enhanced validation with better error messages
        const missingFields = [];
        if (!courseName) missingFields.push('courseName');
        if (!courseDescription) missingFields.push('courseDescription');
        if (!price) missingFields.push('price');
        if (!category) missingFields.push('category');
        if (!whatYouWillLearn) missingFields.push('whatYouWillLearn');
        if (!instructorId) missingFields.push('instructorId');
        if (!status) missingFields.push('status');
        if (!thumbnailImage) missingFields.push('thumbnailImage');

        if (missingFields.length > 0) {
            console.log('Validation failed - missing fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields: missingFields
            });
        }

        // Validate file type and size
        if (thumbnailImage) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(thumbnailImage.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
                });
            }

            // Check file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (thumbnailImage.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum size allowed is 10MB.'
                });
            }
        }

        // Verify instructor exists and is valid
        console.log('Verifying instructor:', instructorId);
        const instructor = await User.findById(instructorId);
        if (!instructor) {
            console.log('Instructor not found:', instructorId);
            return res.status(400).json({
                success: false,
                message: 'Instructor not found'
            });
        }
        
        if (instructor.accountType !== 'Instructor') {
            console.log('Invalid instructor account type:', instructor.accountType);
            return res.status(400).json({
                success: false,
                message: 'Selected user is not an instructor'
            });
        }

        // Verify category exists
        console.log('Verifying category:', category);
        const Category = require('../models/category');
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            console.log('Category not found:', category);
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        // Upload thumbnail to S3 with enhanced error handling
        let thumbnailUrl;
        try {
            const { uploadImageToS3 } = require('../utils/s3Uploader');
            console.log('Uploading thumbnail to S3...');
            
            const uploadResult = await uploadImageToS3(
                thumbnailImage,
                'courses'
            );
            
            thumbnailUrl = uploadResult.secure_url;
            console.log('Thumbnail uploaded successfully:', thumbnailUrl);
        } catch (uploadError) {
            console.error('S3 upload error:', uploadError);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload thumbnail image',
                error: uploadError.message
            });
        }

        // Parse JSON fields with better error handling
        let parsedTags = [];
        let parsedInstructions = [];

        try {
            parsedTags = tag ? JSON.parse(tag) : [];
            if (!Array.isArray(parsedTags)) {
                parsedTags = [];
            }
        } catch (parseError) {
            console.error('Error parsing tags:', parseError);
            parsedTags = [];
        }

        try {
            parsedInstructions = instructions ? JSON.parse(instructions) : [];
            if (!Array.isArray(parsedInstructions)) {
                parsedInstructions = [];
            }
        } catch (parseError) {
            console.error('Error parsing instructions:', parseError);
            parsedInstructions = [];
        }

        console.log('Parsed data:', {
            parsedTags,
            parsedInstructions
        });

        // Validate and convert price
        const coursePrice = Number(price);
        if (isNaN(coursePrice) || coursePrice < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid price. Price must be a valid number.'
            });
        }

        // Create new course with enhanced data validation
        console.log('Creating course in database...');
        const newCourse = await Course.create({
            courseName: courseName.trim(),
            courseDescription: courseDescription.trim(),
            instructor: instructorId,
            whatYouWillLearn: whatYouWillLearn.trim(),
            price: coursePrice,
            tag: parsedTags,
            category,
            thumbnail: thumbnailUrl,
            status,
            instructions: parsedInstructions,
            createdAt: new Date(),
        });

        console.log('Course created successfully:', newCourse._id);

        // Add course to instructor's courses
        try {
            await User.findByIdAndUpdate(
                instructorId,
                { $push: { courses: newCourse._id } },
                { new: true }
            );
            console.log('Course added to instructor profile');
        } catch (updateError) {
            console.error('Error updating instructor profile:', updateError);
            // Continue execution as this is not critical
        }

        // Add course to category
        try {
            await Category.findByIdAndUpdate(
                category,
                { $push: { courses: newCourse._id } },
                { new: true }
            );
            console.log('Course added to category');
        } catch (updateError) {
            console.error('Error updating category:', updateError);
            // Continue execution as this is not critical
        }

        // Populate the course with instructor and category details
        const populatedCourse = await Course.findById(newCourse._id)
            .populate('instructor', 'firstName lastName email')
            .populate('category', 'name description');

        // Send notifications with error handling
        try {
            // Always create notification for admins about new course creation
            await createNewCourseCreationNotification(newCourse._id, instructorId);
            console.log("Admin notification sent for new course creation");

            // Create notification for all students and instructors if course is published
            if (status === "Published") {
                await createNewCourseAnnouncementToAll(newCourse._id, instructorId);
                console.log("Public notifications sent for new published course:", newCourse.courseName);
            } else {
                console.log("Course created in draft state - only admin notified");
            }
        } catch (notificationError) {
            console.error("Error sending notifications:", notificationError);
            // Don't fail the course creation if notifications fail
        }

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course: populatedCourse
        });

    } catch (error) {
        console.error('Error creating course:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Course validation failed',
                errors: validationErrors
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format provided',
                error: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Course with this name already exists'
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating course',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};

// ================ GET NOTIFICATION COUNTS ================
exports.getNotificationCounts = async (req, res) => {
    try {
        const adminId = req.user.id;

        // Get admin's section views or create if doesn't exist
        let adminViews = await AdminSectionViews.findOne({ adminId });
        if (!adminViews) {
            adminViews = await AdminSectionViews.create({
                adminId,
                sectionViews: {}
            });
        }

        const counts = {};
        const now = new Date();

        // Get reviews count (new reviews since last seen)
        const reviewsLastSeen = adminViews.sectionViews.reviews?.lastSeenAt || new Date(0);
        counts.reviews = await RatingAndReview.countDocuments({
            createdAt: { $gt: reviewsLastSeen }
        });

        // Get access requests count (only pending requests or new ones since last seen)
        const accessRequestsLastSeen = adminViews.sectionViews.accessRequests?.lastSeenAt || new Date(0);
        counts.accessRequests = await CourseAccessRequest.countDocuments({
            $or: [
                { status: 'Pending' },
                { 
                    createdAt: { $gt: accessRequestsLastSeen }, 
                    status: { $ne: 'Rejected' } 
                }
            ]
        });

        // Get bundle requests count (only pending requests or new ones since last seen)
        const bundleRequestsLastSeen = adminViews.sectionViews.bundleRequests?.lastSeenAt || new Date(0);
        counts.bundleRequests = await BundleAccessRequest.countDocuments({
            $or: [
                { status: 'Pending' },
                { 
                    createdAt: { $gt: bundleRequestsLastSeen }, 
                    status: { $ne: 'Rejected' } 
                }
            ]
        });

        // Get careers count (new job applications since last seen)
        const careersLastSeen = adminViews.sectionViews.careers?.lastSeenAt || new Date(0);
        counts.careers = await JobApplication.countDocuments({
            createdAt: { $gt: careersLastSeen }
        });

        // Get notifications count (new notifications since last seen)
        const notificationsLastSeen = adminViews.sectionViews.notifications?.lastSeenAt || new Date(0);
        counts.notifications = await Notification.countDocuments({
            recipient: adminId,
            createdAt: { $gt: notificationsLastSeen }
        });

        // Get contact messages count (new unread messages since last seen)
        const contactMessagesLastSeen = adminViews.sectionViews.contactMessages?.lastSeenAt || new Date(0);
        counts.contactMessages = await ContactMessage.countDocuments({
            createdAt: { $gt: contactMessagesLastSeen }
        });

        // Get FAQs count (new unanswered FAQs since last seen)
        const faqsLastSeen = adminViews.sectionViews.faqs?.lastSeenAt || new Date(0);
        counts.faqs = await FAQ.countDocuments({
            createdAt: { $gt: faqsLastSeen },
            status: 'pending'
        });

        // Get chats count (only new chats or chats with new messages from non-admin users since last seen)
        const chatsLastSeen = adminViews.sectionViews.chats?.lastSeenAt || new Date(0);
        
        // Use aggregation to find chats with new activity from non-admin users
        const Message = require('../models/message');
        const User = require('../models/user');
        
        // Get chats with new messages from STUDENTS ONLY since last seen
        const chatsWithNewMessages = await Message.aggregate([
            {
                $match: {
                    createdAt: { $gt: chatsLastSeen }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'senderInfo'
                }
            },
            {
                $match: {
                    'senderInfo.accountType': 'Student'
                }
            },
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chat',
                    foreignField: '_id',
                    as: 'chatInfo'
                }
            },
            {
                $match: {
                    'chatInfo.isActive': true
                }
            },
            {
                $group: {
                    _id: '$chat'
                }
            },
            {
                $count: 'totalChats'
            }
        ]);
        
        // Get count of new chats created since last seen
        const newChatsCount = await Chat.countDocuments({
            isActive: true,
            createdAt: { $gt: chatsLastSeen }
        });
        
        // Combine both counts
        const chatsWithNewMessagesCount = chatsWithNewMessages.length > 0 ? chatsWithNewMessages[0].totalChats : 0;
        counts.chats = newChatsCount + chatsWithNewMessagesCount;

        console.log('Notification counts calculated:', {
            adminId,
            chatsLastSeen,
            chatsCount: counts.chats,
            timestamp: now
        });

        return res.status(200).json({
            success: true,
            data: counts,
            message: 'Notification counts fetched successfully'
        });

    } catch (error) {
        console.error('Error fetching notification counts:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching notification counts',
            error: error.message
        });
    }
};

// ================ MARK SECTION AS SEEN ================
exports.markSectionAsSeen = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { sectionId } = req.params;

        // Validate section ID
        const validSections = [
            'reviews', 'accessRequests', 'bundleRequests', 'careers',
            'notifications', 'contactMessages', 'faqs', 'chats'
        ];

        if (!validSections.includes(sectionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid section ID'
            });
        }

        // Update or create admin section views
        const updateQuery = {};
        updateQuery[`sectionViews.${sectionId}.lastSeenAt`] = new Date();

        await AdminSectionViews.findOneAndUpdate(
            { adminId },
            { $set: updateQuery },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            success: true,
            message: `Section ${sectionId} marked as seen successfully`
        });

    } catch (error) {
        console.error('Error marking section as seen:', error);
        return res.status(500).json({
            success: false,
            message: 'Error marking section as seen',
            error: error.message
        });
    }
};
