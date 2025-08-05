const Profile = require('../models/profile');
const User = require('../models/user');
const Course = require('../models/course');
const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Quiz = require('../models/quiz');
const CourseProgress = require('../models/courseProgress');
const Certificate = require('../models/certificate');
const RatingAndReview = require('../models/ratingAndReview');

const { uploadImageToS3, deleteFileFromS3 } = require('../utils/s3Uploader');
const { convertSecondsToDuration } = require('../utils/secToDuration');
const { cleanupCourseFiles } = require('../utils/fileCleanup');




// ================ update Profile ================
exports.updateProfile = async (req, res) => {
    try {
        // extract data
        const { gender = '', dateOfBirth = "", about = "", contactNumber = '', firstName, lastName } = req.body;

        // extract userId
        const userId = req.user.id;


        // find profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // console.log('User profileDetails -> ', profileDetails);

        // Update the profile fields
        userDetails.firstName = firstName;
        userDetails.lastName = lastName;
        await userDetails.save()

        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        // save data to DB
        await profileDetails.save();

        const updatedUserDetails = await User.findById(userId)
            .populate({
                path: 'additionalDetails'
            })
        // console.log('updatedUserDetails -> ', updatedUserDetails);

        // return response
        res.status(200).json({
            success: true,
            updatedUserDetails,
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        console.log('Error while updating profile');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while updating profile'
        })
    }
}


// ================ delete Account ================
exports.deleteAccount = async (req, res) => {
    try {
        // extract user id
        const userId = req.user.id;
        // console.log('userId = ', userId)

        // validation
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // delete user profile picture from S3 if exists
        if (userDetails.image && !userDetails.image.includes('dicebear')) {
            // Only try to delete if it's a storage image (not a default avatar)
            await deleteFileFromS3(userDetails.image);
            console.log('✅ Profile image deleted from S3');
        }

        // Update enrolled courses
        const userEnrolledCoursesId = userDetails.courses || []
        console.log('userEnrolledCourses ids = ', userEnrolledCoursesId)

        for (const courseId of userEnrolledCoursesId) {
            await Course.findByIdAndUpdate(courseId, {
                $pull: { studentsEnrolled: userId }
            })
        }

        // If user is an instructor, handle their courses
        if (userDetails.accountType === 'Instructor') {
            const instructorCourses = await Course.find({ instructor: userId });
            
            // For each course created by this instructor, delete comprehensively
            for (const course of instructorCourses) {
                // Unenroll all students from instructor's courses
                const studentsEnrolled = course.studentsEnrolled || [];
                for (const studentId of studentsEnrolled) {
                    await User.findByIdAndUpdate(studentId, {
                        $pull: { courses: course._id }
                    });
                }

                // Delete course thumbnail from S3
                if (course.thumbnail) {
                    await deleteFileFromS3(course.thumbnail);
                    console.log('✅ Course thumbnail deleted from S3');
                }

                // Delete course reviews, progress, and certificates
                await RatingAndReview.deleteMany({ course: course._id });
                await CourseProgress.deleteMany({ courseID: course._id });
                await Certificate.deleteMany({ courseId: course._id });

                // Get all sections and subsections
                const courseSections = course.courseContent;
                const allSubSectionIds = [];
                
                // Get all subsection IDs from all sections
                for (const sectionId of courseSections) {
                    const section = await Section.findById(sectionId);
                    if (section) {
                        allSubSectionIds.push(...section.subSection);
                    }
                }

                // Get all subsections data for cleanup
                const allSubSections = await SubSection.find({ _id: { $in: allSubSectionIds } });

                // Delete all associated data in parallel
                await Promise.all([
                    // Delete all quizzes for this course's subsections
                    Quiz.deleteMany({ subSection: { $in: allSubSectionIds } }),
                    
                    // Delete all subsections and their videos
                    ...allSubSectionIds.map(async (subSectionId) => {
                        const subSection = await SubSection.findById(subSectionId);
                        if (subSection?.videoUrl) {
                            await deleteFileFromS3(subSection.videoUrl);
                            console.log('✅ Video deleted from S3');
                        }
                        await SubSection.findByIdAndDelete(subSectionId);
                    }),

                    // Delete all sections
                    ...courseSections.map(sectionId => Section.findByIdAndDelete(sectionId))
                ]);

                // Clean up local files
                await cleanupCourseFiles(course._id, allSubSections);

                // Finally delete the course
                await Course.findByIdAndDelete(course._id);
            }
        }

        // Delete user's course progress records
        await CourseProgress.deleteMany({ userId: userId });

        // Delete user's certificates
        await Certificate.deleteMany({ userId: userId });

        // Delete user's ratings and reviews
        await RatingAndReview.deleteMany({ user: userId });

        // first - delete profie (profileDetails)
        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        // second - delete account
        await User.findByIdAndDelete(userId);


        // sheduale this deleting account , crone job

        // return response
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        })
    }
    catch (error) {
        console.log('Error while deleting profile');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while deleting profile'
        })
    }
}


// ================ get details of user ================
exports.getUserDetails = async (req, res) => {
    try {
        // extract userId
        const userId = req.user.id;
        console.log('id - ', userId);

        // get user details
        const userDetails = await User.findById(userId).populate('additionalDetails').exec();

        // return response
        res.status(200).json({
            success: true,
            data: userDetails,
            message: 'User data fetched successfully'
        })
    }
    catch (error) {
        console.log('Error while fetching user details');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching user details'
        })
    }
}



// ================ Update User profile Image ================
exports.updateUserProfileImage = async (req, res) => {
    try {
        const profileImage = req.file; // multer provides file in req.file when using upload.single()
        const userId = req.user.id;

        // validation
        if (!profileImage) {
            return res.status(400).json({
                success: false,
                message: 'No profile image provided',
            });
        }

        // Validate file size (5MB limit for profile images)
        const MAX_PROFILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
        if (profileImage.size > MAX_PROFILE_SIZE) {
            return res.status(400).json({
                success: false,
                message: 'Profile image must be 5MB or less. Please choose a smaller image.',
                error: 'FILE_SIZE_EXCEEDED',
                maxSize: '5MB',
                currentSize: `${(profileImage.size / (1024 * 1024)).toFixed(2)}MB`
            });
        }

        // Validate file type - Allow any image type
        if (!profileImage.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Please upload an image file.',
                error: 'INVALID_FILE_TYPE',
                allowedTypes: ['Any image format (JPEG, PNG, GIF, WebP, BMP, TIFF, SVG, ICO, etc.)']
            });
        }

        console.log('profileImage = ', profileImage);

        // upload image to S3 with optimized settings for profile images
        // Profile images don't need to be huge, so we limit height to 800px for better performance
        const image = await uploadImageToS3(profileImage, 'profiles', 800, 80);
        console.log('✅ Profile image uploaded to S3:', image.secure_url);

        console.log('image url - ', image);

        // update in DB 
        const updatedUserDetails = await User.findByIdAndUpdate(userId,
            { image: image.secure_url },
            { new: true }
        )
            .populate({
                path: 'additionalDetails'
            })

        // success response
        res.status(200).json({
            success: true,
            message: `Image Updated successfully`,
            data: updatedUserDetails,
        })
    }
    catch (error) {
        console.log('Error while updating user profile image');
        console.log(error);

        // Handle specific upload errors with user-friendly messages
        let errorMessage = 'Error while updating user profile image';
        let statusCode = 500;

        if (error.message.includes('File size') || error.message.includes('exceeds limit')) {
            errorMessage = 'Profile image must be 5MB or less. Please choose a smaller image.';
            statusCode = 400;
        } else if (error.message.includes('File type') || error.message.includes('not allowed')) {
            errorMessage = 'Invalid file type. Please upload an image file.';
            statusCode = 400;
        } else if (error.message.includes('Upload failed') || error.message.includes('storage')) {
            errorMessage = 'Failed to upload image. Please try again.';
            statusCode = 500;
        }

        return res.status(statusCode).json({
            success: false,
            error: error.message,
            message: errorMessage,
        })
    }
}




// ================ Get Enrolled Courses ================
exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        let userDetails = await User.findOne({ _id: userId, })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                        populate: {
                            path: "quiz"
                        }
                    },
                },
            })
            .exec()

        userDetails = userDetails.toObject()

        // Import Order model to check order status
        const Order = require('../models/order');

        // Filter courses based on enrollment and order status
        const activeCourses = []
        
        for (let i = 0; i < userDetails.courses.length; i++) {
            const course = userDetails.courses[i]
            
            // Check if course is currently free
            const isFree = course.courseType === 'Free' || course.adminSetFree;
            
            // Check if user has an active order for paid courses
            const activeOrder = await Order.findOne({
                user: userId,
                course: course._id,
                status: true
            })

            // Determine if course should be accessible
            let isAccessible = true;
            let isDeactivated = false;
            let isOrderInactive = false;
            
            // First check if course is deleted by admin (in recycle bin)
            if (course.isDeactivated) {
                isDeactivated = true;
                isAccessible = false;
            } else {
                // Check if there's any order (active or inactive) for this course
                const anyOrder = await Order.findOne({
                    user: userId,
                    course: course._id
                });
                
                if (anyOrder) {
                    // If there's an order, check its status
                    if (!anyOrder.status) {
                        // Order exists but is inactive - different from recycle bin deletion
                        isOrderInactive = true;
                        isAccessible = false;
                    }
                } else if (!isFree) {
                    // For paid courses without any order, they shouldn't be accessible
                    isAccessible = false;
                }
                // Free courses without orders remain accessible
            }

            // Calculate course details
            let totalDurationInSeconds = 0
            let SubsectionLength = 0
            
            for (var j = 0; j < course.courseContent.length; j++) {
                totalDurationInSeconds += course.courseContent[j].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                course.totalDuration = convertSecondsToDuration(totalDurationInSeconds)
                SubsectionLength += course.courseContent[j].subSection.length
            }

            let courseProgress = await CourseProgress.findOne({
                courseID: course._id,
                userId: userId,
            })

            if (!courseProgress) {
                course.progressPercentage = 0
            } else {
                // Calculate progress using the same logic as certificate generation
                let totalItems = 0
                let completedItems = 0

                // Count videos and quizzes for each subsection
                for (let j = 0; j < course.courseContent.length; j++) {
                    for (let k = 0; k < course.courseContent[j].subSection.length; k++) {
                        const subsection = course.courseContent[j].subSection[k]
                        
                        // Count video
                        totalItems += 1
                        if (courseProgress.completedVideos.includes(subsection._id)) {
                            completedItems += 1
                        }

                        // Count quiz if exists
                        if (subsection.quiz) {
                            totalItems += 1
                            if (courseProgress.completedQuizzes && courseProgress.completedQuizzes.includes(subsection._id)) {
                                completedItems += 1
                            }
                        }
                    }
                }

                if (totalItems === 0) {
                    course.progressPercentage = 100
                } else {
                    // To make it up to 2 decimal point
                    const multiplier = Math.pow(10, 2)
                    course.progressPercentage =
                        Math.round((completedItems / totalItems) * 100 * multiplier) / multiplier
                }
            }
            
            // Add deactivation status to course object
            course.isDeactivated = isDeactivated;
            course.isOrderInactive = isOrderInactive;
            course.isAccessible = isAccessible;
            
            // Add course to list
            activeCourses.push(course)
        }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }

        return res.status(200).json({
            success: true,
            data: activeCourses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}




// ================ instructor Dashboard ================
exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id })

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            // Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats
        })

        res.status(200).json(
            {
                courses: courseData,
                message: 'Instructor Dashboard Data fetched successfully'
            },

        )
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}