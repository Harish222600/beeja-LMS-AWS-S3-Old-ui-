const mongoose = require("mongoose")
const Section = require("../models/section")
const SubSection = require("../models/subSection")
const CourseProgress = require("../models/courseProgress")


// ================ update Course Progress ================
exports.updateCourseProgress = async (req, res) => {
  console.log("updateCourseProgress called with:", req.body)
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  console.log("Request data:", { courseId, subsectionId, userId })

  try {
    // Check if user has access to this course (either free course or active order)
    const Order = require('../models/order');
    const Course = require('../models/course');
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const isFree = course.courseType === 'Free' || course.adminSetFree;
    const activeOrder = await Order.findOne({
      user: userId,
      course: courseId,
      status: true
    });

    if (!isFree && !activeOrder) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Course access has been disabled by admin.',
      });
    }

    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId)
    console.log("Subsection found:", subsection ? "Yes" : "No")
    if (!subsection) {
      console.log("Invalid subsection ID:", subsectionId)
      return res.status(404).json({ error: "Invalid subsection" })
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("Course progress found:", courseProgress ? "Yes" : "No")

    if (!courseProgress) {
      // If course progress doesn't exist, create a new one
      console.log("Course progress does not exist, creating new one")
      try {
        courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [subsectionId]
        })
        console.log("New course progress created:", courseProgress)
        return res.status(200).json({ message: "Course progress updated" })
      } catch (createError) {
        console.error("Error creating course progress:", createError)
        return res.status(500).json({ error: "Failed to create course progress" })
      }
    } else {
      // If course progress exists, check if the subsection is already completed
      if (courseProgress.completedVideos.includes(subsectionId)) {
        console.log("Subsection already completed")
        return res.status(400).json({ error: "Subsection already completed" })
      }

      // Push the subsection into the completedVideos array
      courseProgress.completedVideos.push(subsectionId)
      console.log("Updated completedVideos:", courseProgress.completedVideos)
    }

    // Save the updated course progress
    await courseProgress.save()
    console.log("Course progress saved successfully")

    return res.status(200).json({ message: "Course progress updated" })
  }
  catch (error) {
    console.error("Error in updateCourseProgress:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}



// ================ update Quiz Progress ================
exports.updateQuizProgress = async (req, res) => {
  console.log("updateQuizProgress called with:", req.body)
  const { courseId, subsectionId, quizId, score, totalMarks } = req.body
  const userId = req.user.id

  console.log("Request data:", { courseId, subsectionId, quizId, score, totalMarks, userId })

  try {
    // Check if user has access to this course (either free course or active order)
    const Order = require('../models/order');
    const Course = require('../models/course');
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const isFree = course.courseType === 'Free' || course.adminSetFree;
    const activeOrder = await Order.findOne({
      user: userId,
      course: courseId,
      status: true
    });

    if (!isFree && !activeOrder) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Course access has been disabled by admin.',
      });
    }

    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      console.log("Invalid subsection ID:", subsectionId)
      return res.status(404).json({ error: "Invalid subsection" })
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    // Calculate percentage for pass/fail
    const percentage = (score / totalMarks) * 100;
    const passed = percentage >= 60;

    if (!courseProgress) {
      // If course progress doesn't exist, create a new one
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
        completedQuizzes: [subsectionId],
        passedQuizzes: passed ? [subsectionId] : [],
        quizResults: [{
          quiz: quizId,
          score: score,
          totalMarks: totalMarks,
          percentage: percentage,
          passed: passed,
          completedAt: new Date()
        }]
      })
    } else {
      // Add to completedQuizzes if not already there
      if (!courseProgress.completedQuizzes.includes(subsectionId)) {
        courseProgress.completedQuizzes.push(subsectionId)
      }

      // Add to passedQuizzes if passed and not already there
      if (passed && !courseProgress.passedQuizzes.includes(subsectionId)) {
        courseProgress.passedQuizzes.push(subsectionId)
      }
      
      // Update or add quiz result
      const existingResultIndex = courseProgress.quizResults.findIndex(
        result => result.quiz.toString() === quizId
      )
      
      if (existingResultIndex >= 0) {
        courseProgress.quizResults[existingResultIndex] = {
          quiz: quizId,
          score: score,
          totalMarks: totalMarks,
          percentage: percentage,
          passed: passed,
          completedAt: new Date()
        }
      } else {
        courseProgress.quizResults.push({
          quiz: quizId,
          score: score,
          totalMarks: totalMarks,
          percentage: percentage,
          passed: passed,
          completedAt: new Date()
        })
      }
    }

    await courseProgress.save()
    console.log("Quiz progress saved successfully")

    return res.status(200).json({ 
      message: "Quiz progress updated",
      data: courseProgress
    })
  } catch (error) {
    console.error("Error in updateQuizProgress:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// ================ check Section Access ================
exports.checkSectionAccess = async (req, res) => {
  const { courseId, sectionId } = req.body
  const userId = req.user.id

  try {
    // Input validation
    if (!courseId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and Section ID are required.',
      });
    }

    // Check if user has access to this course (either free course or active order)
    const Order = require('../models/order');
    const Course = require("../models/course")
    
    const courseBasic = await Course.findById(courseId);
    if (!courseBasic) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const isFree = courseBasic.courseType === 'Free' || courseBasic.adminSetFree;
    const activeOrder = await Order.findOne({
      user: userId,
      course: courseId,
      status: true
    });

    if (!isFree && !activeOrder) {
      console.log(`Access denied for user ${userId} - no active order for course ${courseId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Course access has been disabled or not purchased.',
      });
    }

    // Get course with sections and subsections
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          populate: {
            path: "quiz"
          }
        }
      })

    if (!course) {
      console.log(`Course not found: ${courseId}`);
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Find the course progress
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    // Find the section index
    const sectionIndex = course.courseContent.findIndex(
      section => section._id.toString() === sectionId
    )

    if (sectionIndex === -1) {
      console.log(`Section not found: ${sectionId} in course ${courseId}`);
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    // First section is always accessible
    if (sectionIndex === 0) {
      return res.status(200).json({ 
        success: true,
        hasAccess: true,
        message: "First section is always accessible"
      })
    }

    // Check if previous section is completed (both video and quiz)
    const previousSection = course.courseContent[sectionIndex - 1]
    let previousSectionCompleted = true
    let incompleteItems = [];

    for (const subsection of previousSection.subSection) {
      // Check if video is completed
      const videoCompleted = courseProgress?.completedVideos?.includes(subsection._id)
      
      // Check if quiz is completed (if quiz exists)
      let quizCompleted = true
      if (subsection.quiz) {
        quizCompleted = courseProgress?.completedQuizzes?.includes(subsection._id)
      }

      if (!videoCompleted || !quizCompleted) {
        previousSectionCompleted = false;
        incompleteItems.push({
          type: !videoCompleted ? 'video' : 'quiz',
          title: subsection.title
        });
      }
    }

    // Detailed response with incomplete items if access is denied
    return res.status(200).json({ 
      success: true,
      hasAccess: previousSectionCompleted,
      message: previousSectionCompleted 
        ? "Access granted" 
        : "Complete previous section's content to unlock",
      details: !previousSectionCompleted ? {
        sectionName: previousSection.sectionName,
        incompleteItems: incompleteItems
      } : undefined
    })

  } catch (error) {
    console.error("Error in checkSectionAccess:", error);
    console.error("Stack trace:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ================ get Progress Percentage ================
exports.getProgressPercentage = async (req, res) => {
  const { courseId } = req.body
  const userId = req.user.id

  if (!courseId) {
    return res.status(400).json({ error: "Course ID not provided." })
  }

  try {
    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })
      .populate({
        path: "courseID",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
            populate: {
              path: "quiz"
            }
          }
        },
      })
      .exec()

    if (!courseProgress) {
      return res
        .status(400)
        .json({ error: "Can not find Course Progress with these IDs." })
    }

    let totalItems = 0
    let completedItems = 0

    courseProgress.courseID.courseContent?.forEach((section) => {
      section.subSection?.forEach((subsection) => {
        // Count video
        if (subsection.videoUrl) {
          totalItems += 1
          if (courseProgress.completedVideos.includes(subsection._id)) {
            completedItems += 1
          }
        }

        // Count quiz if exists
        if (subsection.quiz) {
          totalItems += 1
          // Consider quiz as completed if it's either completed or passed
          if (courseProgress.completedQuizzes.includes(subsection._id)) {
            // If quiz is completed but not passed, give half credit
            if (!courseProgress.passedQuizzes.includes(subsection._id)) {
              completedItems += 0.5
            } else {
              // If quiz is passed, give full credit
              completedItems += 1
            }
          }
        }
      })
    })

    console.log('Progress calculation:', {
      totalItems,
      completedItems,
      completedVideos: courseProgress.completedVideos.length,
      completedQuizzes: courseProgress.completedQuizzes.length,
      passedQuizzes: courseProgress.passedQuizzes.length
    })

    let progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

    // To make it up to 2 decimal point
    const multiplier = Math.pow(10, 2)
    progressPercentage = Math.round(progressPercentage * multiplier) / multiplier

    return res.status(200).json({
      data: progressPercentage,
      message: "Successfully fetched Course progress",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
