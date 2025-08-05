const Certificate = require('../models/certificate');
const CourseProgress = require('../models/courseProgress');
const Course = require('../models/course');
const User = require('../models/user');
const { createAdvancedNotification } = require('../controllers/notification');

/**
 * Calculate course progress percentage using the same logic as certificate generation
 */
const calculateProgressPercentage = (courseProgress, course) => {
    let totalItems = 0;
    let completedItems = 0;

    course.courseContent?.forEach((section) => {
        section.subSection?.forEach((subsection) => {
            // Count video
            totalItems += 1;
            if (courseProgress.completedVideos.includes(subsection._id)) {
                completedItems += 1;
            }

            // Count quiz if exists
            if (subsection.quiz) {
                totalItems += 1;
                if (courseProgress.completedQuizzes.includes(subsection._id)) {
                    completedItems += 1;
                }
            }
        });
    });

    let progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    // Round to 2 decimal places
    const multiplier = Math.pow(10, 2);
    progressPercentage = Math.round(progressPercentage * multiplier) / multiplier;

    return { progressPercentage, totalItems, completedItems };
};

/**
 * Find students who have existing certificates for a course
 */
const findStudentsWithCertificates = async (courseId) => {
    try {
        const certificates = await Certificate.find({ courseId })
            .populate('userId', 'firstName lastName email')
            .select('certificateId userId issuedDate completionDate');
        
        return certificates;
    } catch (error) {
        console.error('Error finding students with certificates:', error);
        throw error;
    }
};

/**
 * Check if students still have 100% completion after new content is added
 */
const checkStudentCompletionStatus = async (courseId, studentIds) => {
    try {
        const course = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
                populate: {
                    path: "quiz"
                }
            }
        });

        if (!course) {
            throw new Error('Course not found');
        }

        const completionStatuses = [];

        for (const studentId of studentIds) {
            const courseProgress = await CourseProgress.findOne({
                courseID: courseId,
                userId: studentId,
            });

            if (courseProgress) {
                const { progressPercentage, totalItems, completedItems } = calculateProgressPercentage(courseProgress, course);
                
                completionStatuses.push({
                    studentId,
                    progressPercentage,
                    totalItems,
                    completedItems,
                    isCompleted: progressPercentage >= 100
                });
            } else {
                completionStatuses.push({
                    studentId,
                    progressPercentage: 0,
                    totalItems: 0,
                    completedItems: 0,
                    isCompleted: false
                });
            }
        }

        return completionStatuses;
    } catch (error) {
        console.error('Error checking student completion status:', error);
        throw error;
    }
};

/**
 * Update certificate issue date while keeping the same certificate ID
 */
const updateCertificateIssueDate = async (certificateId, newIssueDate = new Date()) => {
    try {
        const updatedCertificate = await Certificate.findByIdAndUpdate(
            certificateId,
            { 
                issuedDate: newIssueDate,
                updatedAt: new Date()
            },
            { new: true }
        );

        return updatedCertificate;
    } catch (error) {
        console.error('Error updating certificate issue date:', error);
        throw error;
    }
};

/**
 * Send notification to student about certificate update
 */
const notifyStudentAboutCertificateUpdate = async (studentId, courseId, courseName) => {
    try {
        await createAdvancedNotification({
            recipient: studentId,
            type: 'CERTIFICATE_UPDATED',
            title: 'Certificate Updated',
            message: `Your certificate for "${courseName}" has been updated with new content. The certificate has been reissued with today's date.`,
            relatedCourse: courseId,
            priority: 'medium',
            actionUrl: `/dashboard/certificates`,
            metadata: { 
                updateReason: 'new_content_added',
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error sending certificate update notification:', error);
    }
};

/**
 * Main function to regenerate certificates for students who still have 100% completion
 */
const regenerateCertificatesForCourse = async (courseId, contentType = 'content') => {
    try {
        console.log(`Starting certificate regeneration for course: ${courseId}`);
        
        // Find all students with existing certificates for this course
        const existingCertificates = await findStudentsWithCertificates(courseId);
        
        if (existingCertificates.length === 0) {
            console.log('No existing certificates found for this course');
            return {
                success: true,
                message: 'No existing certificates found for this course',
                regeneratedCount: 0,
                invalidatedCount: 0
            };
        }

        console.log(`Found ${existingCertificates.length} existing certificates`);

        // Get student IDs
        const studentIds = existingCertificates.map(cert => cert.userId._id);

        // Check completion status for all students
        const completionStatuses = await checkStudentCompletionStatus(courseId, studentIds);

        // Get course details for notifications
        const course = await Course.findById(courseId).select('courseName');
        
        let regeneratedCount = 0;
        let invalidatedCount = 0;
        const results = [];

        // Process each student
        for (const status of completionStatuses) {
            const certificate = existingCertificates.find(
                cert => cert.userId._id.toString() === status.studentId.toString()
            );

            if (!certificate) continue;

            if (status.isCompleted) {
                // Student still has 100% completion - regenerate certificate
                const updatedCertificate = await updateCertificateIssueDate(certificate._id);
                
                // Send notification to student
                await notifyStudentAboutCertificateUpdate(
                    status.studentId,
                    courseId,
                    course.courseName
                );

                regeneratedCount++;
                results.push({
                    studentId: status.studentId,
                    studentName: `${certificate.userId.firstName} ${certificate.userId.lastName}`,
                    action: 'regenerated',
                    certificateId: certificate.certificateId,
                    newIssueDate: updatedCertificate.issuedDate,
                    progressPercentage: status.progressPercentage
                });

                console.log(`Certificate regenerated for student: ${certificate.userId.firstName} ${certificate.userId.lastName}`);
            } else {
                // Student no longer has 100% completion - certificate becomes invalid but we keep it
                invalidatedCount++;
                results.push({
                    studentId: status.studentId,
                    studentName: `${certificate.userId.firstName} ${certificate.userId.lastName}`,
                    action: 'invalidated',
                    certificateId: certificate.certificateId,
                    progressPercentage: status.progressPercentage,
                    reason: 'Incomplete course after new content addition'
                });

                console.log(`Certificate invalidated for student: ${certificate.userId.firstName} ${certificate.userId.lastName} (Progress: ${status.progressPercentage}%)`);
            }
        }

        console.log(`Certificate regeneration completed. Regenerated: ${regeneratedCount}, Invalidated: ${invalidatedCount}`);

        return {
            success: true,
            message: `Certificate regeneration completed for course`,
            regeneratedCount,
            invalidatedCount,
            results,
            courseId,
            courseName: course.courseName
        };

    } catch (error) {
        console.error('Error in certificate regeneration:', error);
        throw error;
    }
};

/**
 * Regenerate certificates when new content is added to a course
 */
const handleNewContentAddition = async (courseId, contentType, contentDetails) => {
    try {
        console.log(`New ${contentType} added to course ${courseId}:`, contentDetails);
        
        // Regenerate certificates for this course
        const result = await regenerateCertificatesForCourse(courseId, contentType);
        
        // Log the results
        if (result.regeneratedCount > 0 || result.invalidatedCount > 0) {
            console.log(`Certificate regeneration summary for course ${courseId}:`);
            console.log(`- Certificates regenerated: ${result.regeneratedCount}`);
            console.log(`- Certificates invalidated: ${result.invalidatedCount}`);
        }

        return result;
    } catch (error) {
        console.error('Error handling new content addition:', error);
        throw error;
    }
};

module.exports = {
    calculateProgressPercentage,
    findStudentsWithCertificates,
    checkStudentCompletionStatus,
    updateCertificateIssueDate,
    notifyStudentAboutCertificateUpdate,
    regenerateCertificatesForCourse,
    handleNewContentAddition
};
