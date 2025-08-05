const Certificate = require("../models/certificate");
const Course = require("../models/course");
const User = require("../models/user");
const CourseProgress = require("../models/courseProgress");
const { regenerateCertificatesForCourse } = require("../utils/certificateRegeneration");

// ================ Generate Certificate ================
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if course exists and populate category
    const course = await Course.findById(courseId).populate('category', 'name');
    
    // Check if user has access to this course
    // First check if user is enrolled in the course
    const user = await User.findById(userId);
    const isEnrolled = user.courses.includes(courseId);
    
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not enrolled in this course.',
      });
    }
    
    // If enrolled, check if course is free or user has active order
    const isFree = course.courseType === 'Free' || course.adminSetFree;
    
    if (!isFree) {
      const Order = require('../models/order');
      const activeOrder = await Order.findOne({
        user: userId,
        course: courseId,
        status: true
      });

      // Allow certificate generation if user is enrolled, regardless of current course type
      // This ensures students who enrolled when course was free can still get certificates
      if (!activeOrder) {
        console.log(`Certificate generation allowed for enrolled student - User: ${userId}, Course: ${courseId}`);
      }
    }
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // User details already fetched above for enrollment check
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if course is 100% completed using existing logic
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    }).populate({
      path: "courseID",
      populate: {
        path: "courseContent",
        populate: {
          path: "subSection",
          populate: {
            path: "quiz"
          }
        }
      }
    });

    if (!courseProgress) {
      return res.status(400).json({
        success: false,
        message: "Course progress not found. Please start the course first."
      });
    }

    // Calculate progress percentage using the same logic as getProgressPercentage
    let totalItems = 0;
    let completedItems = 0;

    courseProgress.courseID.courseContent?.forEach((section) => {
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
    
    // Round to 2 decimal places like in getProgressPercentage
    const multiplier = Math.pow(10, 2);
    progressPercentage = Math.round(progressPercentage * multiplier) / multiplier;

    console.log(`Certificate generation check - User: ${userId}, Course: ${courseId}, Progress: ${progressPercentage}%, Total Items: ${totalItems}, Completed: ${completedItems}`);

    if (progressPercentage < 100) {
      return res.status(400).json({
        success: false,
        message: "Course not completed yet. Complete all videos and quizzes to get certificate.",
        debug: {
          progressPercentage,
          totalItems,
          completedItems,
          completedVideos: courseProgress.completedVideos.length,
          completedQuizzes: courseProgress.completedQuizzes.length
        }
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      courseId: courseId,
      userId: userId
    });

    if (!certificate) {
      // Generate unique certificate ID with format: BA-25FJ2849
      // BA- -> company name with hyphen
      // 25 -> current year
      // FJ -> random 2 alphabets
      // 2849 -> random 4 numbers
      const generateCertificateId = () => {
        const companyPrefix = 'BA-';
        const currentYear = new Date().getFullYear().toString().slice(-2);
        
        // Generate 2 random alphabets
        const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomAlphabets = Array(2).fill(0)
          .map(() => alphabets.charAt(Math.floor(Math.random() * alphabets.length)))
          .join('');
        
        // Generate 4 random numbers
        const randomNumbers = Array(4).fill(0)
          .map(() => Math.floor(Math.random() * 10))
          .join('');
        
        return `${companyPrefix}${currentYear}${randomAlphabets}${randomNumbers}`;
      };

      let certificateId;
      let isUnique = false;
      
      // Ensure the generated ID is unique
      while (!isUnique) {
        certificateId = generateCertificateId();
        const existingCertificate = await Certificate.findOne({ certificateId });
        if (!existingCertificate) {
          isUnique = true;
        }
      }

      // Create new certificate
      certificate = await Certificate.create({
        certificateId,
        courseId,
        userId,
        courseName: course.courseName,
        categoryName: course.category?.name || 'General',
        studentName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        completionDate: new Date(),
        issuedDate: new Date()
      });
    } else {
      // Certificate already exists - only update if this is a new completion after course modification
      // Check if the course has been modified since the certificate was last issued
      
      // Get the course progress to check when it was last updated
      const progressLastUpdated = courseProgress.updatedAt;
      const certificateLastIssued = certificate.issuedDate;
      
      // If the progress was updated after the certificate was issued, it means student completed new content
      if (progressLastUpdated > certificateLastIssued) {
        // Student has completed new content since certificate was issued
        certificate.issuedDate = new Date();
        certificate.completionDate = new Date();
        certificate.categoryName = course.category?.name || 'General';
        await certificate.save();
        
        console.log(`Certificate regenerated - student completed new content. Student: ${user.firstName} ${user.lastName}, Course: ${course.courseName}, New dates: ${certificate.issuedDate}`);
      } else {
        // No new completion, just return existing certificate
        console.log(`Returning existing certificate - no new completion. Student: ${user.firstName} ${user.lastName}, Course: ${course.courseName}, Original dates: ${certificate.issuedDate}`);
      }
    }

    // Ensure we return the most up-to-date certificate data
    const updatedCertificate = await Certificate.findById(certificate._id);
    
    return res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      data: updatedCertificate
    });

  } catch (error) {
    console.error("Error generating certificate:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ================ Verify Certificate ================
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate({
        path: "courseId",
        select: "courseName category",
        populate: {
          path: "category",
          select: "name"
        }
      })
      .populate("userId", "firstName lastName email");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: certificate
    });

  } catch (error) {
    console.error("Error verifying certificate:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ================ Get User Certificates ================
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.find({ userId })
      .populate({
        path: "courseId",
        select: "courseName thumbnail category",
        populate: {
          path: "category",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Certificates fetched successfully",
      data: certificates
    });

  } catch (error) {
    console.error("Error fetching certificates:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ================ Regenerate Certificates for Course (Admin Only) ================
exports.regenerateCertificatesForCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Regenerate certificates for this course
    const result = await regenerateCertificatesForCourse(courseId, 'manual');

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        courseId: result.courseId,
        courseName: result.courseName,
        regeneratedCount: result.regeneratedCount,
        invalidatedCount: result.invalidatedCount,
        results: result.results
      }
    });

  } catch (error) {
    console.error("Error regenerating certificates:", error);
    return res.status(500).json({
      success: false,
      message: "Error regenerating certificates",
      error: error.message
    });
  }
};

// ================ Get Certificate Regeneration Status ================
exports.getCertificateRegenerationStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Find all certificates for this course
    const certificates = await Certificate.find({ courseId })
      .populate('userId', 'firstName lastName email')
      .select('certificateId userId issuedDate completionDate createdAt updatedAt');

    // Get course content to calculate total items
    const courseWithContent = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
        populate: {
          path: "quiz"
        }
      }
    });

    let totalCourseItems = 0;
    courseWithContent.courseContent?.forEach((section) => {
      section.subSection?.forEach((subsection) => {
        totalCourseItems += 1; // video
        if (subsection.quiz) {
          totalCourseItems += 1; // quiz
        }
      });
    });

    // Check current completion status for each certificate holder
    const certificateStatuses = [];
    for (const certificate of certificates) {
      const courseProgress = await CourseProgress.findOne({
        courseID: courseId,
        userId: certificate.userId._id,
      });

      let currentProgress = 0;
      let completedItems = 0;
      
      if (courseProgress) {
        completedItems = courseProgress.completedVideos.length + courseProgress.completedQuizzes.length;
        currentProgress = totalCourseItems > 0 ? (completedItems / totalCourseItems) * 100 : 0;
      }

      certificateStatuses.push({
        certificateId: certificate.certificateId,
        studentName: `${certificate.userId.firstName} ${certificate.userId.lastName}`,
        studentEmail: certificate.userId.email,
        issuedDate: certificate.issuedDate,
        completionDate: certificate.completionDate,
        currentProgress: Math.round(currentProgress * 100) / 100,
        isCurrentlyValid: currentProgress >= 100,
        needsRegeneration: currentProgress >= 100 && certificate.updatedAt < certificate.createdAt
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate status fetched successfully",
      data: {
        courseId,
        courseName: course.courseName,
        totalCertificates: certificates.length,
        totalCourseItems,
        certificates: certificateStatuses
      }
    });

  } catch (error) {
    console.error("Error fetching certificate regeneration status:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching certificate status",
      error: error.message
    });
  }
};
