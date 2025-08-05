const express = require('express');
const router = express.Router();

// Import required controllers

// course controllers 
const {
    createCourse,
    getCourseDetails,
    getAllCourses,
    getFullCourseDetails,
    editCourse,
    deleteCourse,
    getInstructorCourses,

} = require('../controllers/course')

const { updateCourseProgress, updateQuizProgress, checkSectionAccess, getProgressPercentage } = require('../controllers/courseProgress')

// categories Controllers
const {
    createCategory,
    updateCategory,
    deleteCategory,
    showAllCategories,
    getCategoryPageDetails,
} = require('../controllers/category');


// sections controllers
const {
    createSection,
    updateSection,
    deleteSection,
} = require('../controllers/section');


// subSections controllers
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require('../controllers/subSection');


// rating controllers
const {
    createRating,
    getAverageRating,
    getAllRatingReview,
    getSelectedReviews
} = require('../controllers/ratingAndReview');


// Middlewares
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth')
const { upload } = require('../middleware/multer')


// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************
// Course Management Routes (For both Instructors and Admins)
router.post('/createCourse', auth, isInstructor, upload.single('thumbnailImage'), createCourse);

// Section Management
router.post('/addSection', auth, isInstructor, createSection);
router.post('/updateSection', auth, isInstructor, updateSection);
router.post('/deleteSection', auth, isInstructor, deleteSection);

// Subsection (Lecture) Management
router.post('/addSubSection', auth, isInstructor, upload.single('video'), createSubSection);
router.post('/updateSubSection', auth, isInstructor, upload.single('videoFile'), updateSubSection);
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);


// Get Details for a Specific Courses
router.post('/getCourseDetails', getCourseDetails);
// Get all Courses
router.get('/getAllCourses', getAllCourses);
// get full course details
router.post('/getFullCourseDetails', auth, getFullCourseDetails);
// Get all Courses Under a Specific Admin
router.get("/getInstructorCourses", auth, isAdmin, getInstructorCourses)

// Get all Courses Under a Specific Instructor
router.get("/getInstructorCoursesForInstructor", auth, isInstructor, getInstructorCourses)


// Edit Course routes - Allow both instructors and admins
router.post("/editCourse", auth, upload.single('thumbnailImage'), (req, res, next) => {
    // Allow both instructors and admins to edit courses
    if (req.user.accountType === 'Instructor' || req.user.accountType === 'Admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Only instructors and admins can edit courses."
        });
    }
}, editCourse)

// Delete a Course - Allow both instructors and admins
router.delete("/deleteCourse", auth, deleteCourse)

// update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)

// update Quiz Progress
router.post("/updateQuizProgress", auth, isStudent, updateQuizProgress)

// check Section Access
router.post("/checkSectionAccess", auth, isStudent, checkSectionAccess)

// get Progress Percentage
router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)


// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin

router.post('/createCategory', auth, isAdmin, createCategory);
router.put('/updateCategory', auth, isAdmin, updateCategory);
router.delete('/deleteCategory', auth, isAdmin, deleteCategory);
router.get('/showAllCategories', showAllCategories);
router.post("/getCategoryPageDetails", getCategoryPageDetails)


// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRatingReview);
router.get('/getSelectedReviews', getSelectedReviews);


module.exports = router;
