const Course = require('../../models/course');
const User = require('../../models/user');
const CourseProgress = require('../../models/courseProgress');
const Certificate = require('../../models/certificate');
const Order = require('../../models/order');

// Get all students enrolled in a course
exports.getStudentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find the course and populate enrolled students
    const course = await Course.findById(courseId)
      .populate({
        path: 'studentsEnrolled',
        select: 'firstName lastName email image createdAt',
        model: 'User'
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get progress data for each student
    const studentsWithProgress = await Promise.all(
      course.studentsEnrolled.map(async (student) => {
        const progress = await CourseProgress.findOne({
          courseID: courseId,
          userId: student._id
        });

        // Calculate progress percentage
        let progressPercentage = 0;
        if (progress) {
          const totalVideos = await getTotalVideosInCourse(courseId);
          const totalQuizzes = await getTotalQuizzesInCourse(courseId);
          const completedVideos = progress.completedVideos?.length || 0;
          const passedQuizzes = progress.passedQuizzes?.length || 0;
          
          const totalContent = totalVideos + totalQuizzes;
          const completedContent = completedVideos + passedQuizzes;
          
          if (totalContent > 0) {
            progressPercentage = Math.round((completedContent / totalContent) * 100);
          }
        }

        // Get enrollment date from order purchase date, then course progress creation, then user creation date
        const order = await Order.findOne({
          user: student._id,
          course: courseId,
          status: true
        }).sort({ purchaseDate: 1 }); // Get the earliest purchase if multiple exist
        
        const enrollmentDate = order?.purchaseDate || progress?.createdAt || student.createdAt;
        
        return {
          ...student.toObject(),
          enrolledAt: enrollmentDate,
          progress: {
            completedVideos: progress?.completedVideos || [],
            passedQuizzes: progress?.passedQuizzes || [],
            progressPercentage
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      students: studentsWithProgress
    });

  } catch (error) {
    console.error('Error fetching students by course:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get detailed progress for a student in a course
exports.getStudentProgress = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
          model: 'SubSection'
        }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get course progress
    const progress = await CourseProgress.findOne({
      courseID: courseId,
      userId: studentId
    }).populate({
      path: 'quizResults.quiz',
      select: 'title'
    });

    // Calculate totals
    const totalVideos = await getTotalVideosInCourse(courseId);
    const totalQuizzes = await getTotalQuizzesInCourse(courseId);
    
    const completedVideos = progress?.completedVideos?.length || 0;
    const passedQuizzes = progress?.passedQuizzes?.length || 0;
    
    const totalContent = totalVideos + totalQuizzes;
    const completedContent = completedVideos + passedQuizzes;
    
    const progressPercentage = totalContent > 0 ? 
      Math.round((completedContent / totalContent) * 100) : 0;

    // Check for certificate
    const certificate = await Certificate.findOne({
      userId: studentId,
      courseId: courseId
    });

    const progressData = {
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        image: student.image
      },
      course: {
        _id: course._id,
        courseName: course.courseName,
        thumbnail: course.thumbnail
      },
      progressPercentage,
      totalVideos,
      totalQuizzes,
      completedVideos: progress?.completedVideos || [],
      passedQuizzes: progress?.passedQuizzes || [],
      quizResults: progress?.quizResults ? 
        // Remove duplicates by keeping only the latest result for each quiz
        progress.quizResults.reduce((acc, current) => {
          const existingIndex = acc.findIndex(item => 
            item.quiz._id.toString() === current.quiz._id.toString()
          );
          
          if (existingIndex >= 0) {
            // Keep the one with the latest completedAt date
            if (new Date(current.completedAt) > new Date(acc[existingIndex].completedAt)) {
              acc[existingIndex] = current;
            }
          } else {
            acc.push(current);
          }
          
          return acc;
        }, []) : [],
      certificateStatus: certificate ? {
        issuedDate: certificate.issuedDate,
        certificateId: certificate._id
      } : null
    };

    res.status(200).json({
      success: true,
      progress: progressData
    });

  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to get total videos in a course
async function getTotalVideosInCourse(courseId) {
  try {
    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
          model: 'SubSection'
        }
      });

    if (!course) return 0;

    let totalVideos = 0;
    course.courseContent.forEach(section => {
      section.subSection.forEach(subSection => {
        if (subSection.videoUrl) {
          totalVideos++;
        }
      });
    });

    return totalVideos;
  } catch (error) {
    console.error('Error calculating total videos:', error);
    return 0;
  }
}

// Helper function to get total quizzes in a course
async function getTotalQuizzesInCourse(courseId) {
  try {
    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
          model: 'SubSection'
        }
      });

    if (!course) return 0;

    let totalQuizzes = 0;
    course.courseContent.forEach(section => {
      section.subSection.forEach(subSection => {
        if (subSection.quiz) {
          totalQuizzes++;
        }
      });
    });

    return totalQuizzes;
  } catch (error) {
    console.error('Error calculating total quizzes:', error);
    return 0;
  }
}
