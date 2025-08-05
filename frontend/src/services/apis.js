const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/api/v1/auth/sendotp",
  SIGNUP_API: BASE_URL + "/api/v1/auth/signup",
  LOGIN_API: BASE_URL + "/api/v1/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/api/v1/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/api/v1/auth/reset-password",
  // User Analytics
  USER_ANALYTICS_API: BASE_URL + "/api/v1/user/analytics",
  USER_ACTIVITY_API: BASE_URL + "/api/v1/user/activity",
  UPDATE_WATCH_TIME_API: BASE_URL + "/api/v1/user/update-watch-time",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/api/v1/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/api/v1/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/api/v1/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/api/v1/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/api/v1/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/api/v1/payment/sendPaymentSuccessEmail",
  GET_ORDER_BY_COURSE_API: BASE_URL + "/api/v1/payment/order/course/:courseId",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/api/v1/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/api/v1/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/api/v1/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/api/v1/course/showAllCategories",
  CREATE_CATEGORY_API: BASE_URL + "/api/v1/course/createCategory",
  UPDATE_CATEGORY_API: BASE_URL + "/api/v1/course/updateCategory",
  DELETE_CATEGORY_API: BASE_URL + "/api/v1/course/deleteCategory",
  CREATE_COURSE_API: BASE_URL + "/api/v1/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/api/v1/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/api/v1/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/api/v1/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/api/v1/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/api/v1/course/getInstructorCoursesForInstructor",
  COURSE_PURCHASE_HISTORY_API: BASE_URL + "/api/v1/payment/purchaseHistory",
  DELETE_SECTION_API: BASE_URL + "/api/v1/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/api/v1/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/api/v1/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: BASE_URL + "/api/v1/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/api/v1/course/updateCourseProgress",
  UPDATE_QUIZ_PROGRESS_API: BASE_URL + "/api/v1/course/updateQuizProgress",
  CHECK_SECTION_ACCESS_API: BASE_URL + "/api/v1/course/checkSectionAccess",
  GET_PROGRESS_PERCENTAGE_API: BASE_URL + "/api/v1/course/getProgressPercentage",
  CREATE_RATING_API: BASE_URL + "/api/v1/course/createRating",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/api/v1/course/getReviews",
  SELECTED_REVIEWS_API: BASE_URL + "/api/v1/course/getSelectedReviews",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/api/v1/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/api/v1/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/api/v1/contact/submit",
}

// CONTACT MESSAGE ENDPOINTS (Admin)
export const contactMessageEndpoints = {
  GET_ALL_MESSAGES_API: BASE_URL + "/api/v1/contact/messages",
  MARK_MESSAGE_READ_API: BASE_URL + "/api/v1/contact/messages/:messageId/mark-read",
  DELETE_MESSAGE_API: BASE_URL + "/api/v1/contact/messages/:messageId",
  GET_MESSAGE_STATS_API: BASE_URL + "/api/v1/contact/stats",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/api/v1/profile/updateUserProfileImage",
  UPDATE_PROFILE_API: BASE_URL + "/api/v1/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/api/v1/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/api/v1/profile/deleteProfile",
}

// FEATURED COURSES ENDPOINTS
export const featuredCoursesEndpoints = {
  GET_FEATURED_COURSES_API: BASE_URL + "/api/v1/featured-courses",
  UPDATE_FEATURED_COURSES_API: BASE_URL + "/api/v1/featured-courses/update",
}

// ADMIN ENDPOINTS
export const adminEndpoints = {
  // User Management
  GET_ALL_USERS_API: BASE_URL + "/api/v1/admin/users",
  CREATE_USER_API: BASE_URL + "/api/v1/admin/users",
  UPDATE_USER_API: BASE_URL + "/api/v1/admin/users/:userId",
  DELETE_USER_API: BASE_URL + "/api/v1/admin/users/:userId",
  TOGGLE_USER_STATUS_API: BASE_URL + "/api/v1/admin/users/:userId/toggle-status",
  GET_ALL_INSTRUCTORS_API: BASE_URL + "/api/v1/admin/instructors",

  // Coupon Management
  GET_ALL_COUPONS_API: BASE_URL + "/api/v1/admin/coupons",
  GET_FRONTEND_COUPONS_API: BASE_URL + "/api/v1/admin/coupons/frontend",
  CREATE_COUPON_API: BASE_URL + "/api/v1/admin/coupons/create",
  VALIDATE_COUPON_API: BASE_URL + "/api/v1/admin/coupons/validate",
  APPLY_COUPON_API: BASE_URL + "/api/v1/admin/coupons/apply",
  VALIDATE_AND_APPLY_COUPON_API: BASE_URL + "/api/v1/admin/coupons/validate-and-apply",
  TOGGLE_COUPON_STATUS_API: BASE_URL + "/api/v1/admin/coupons/:couponId/toggle",

  // Course Management
  GET_ALL_COURSES_API: BASE_URL + "/api/v1/admin/courses",
  CREATE_COURSE_AS_ADMIN_API: BASE_URL + "/api/v1/admin/courses/create",
  APPROVE_COURSE_API: BASE_URL + "/api/v1/admin/courses/:courseId/approve",
  ADMIN_DELETE_COURSE_API: BASE_URL + "/api/v1/admin/courses/:courseId",
  TOGGLE_COURSE_VISIBILITY_API: BASE_URL + "/api/v1/admin/courses/:courseId/toggle-visibility",
  SET_COURSE_TYPE_API: BASE_URL + "/api/v1/admin/courses/:courseId/set-type",

  // Student Progress Tracking
  GET_STUDENTS_BY_COURSE_API: BASE_URL + "/api/v1/admin/courses/:courseId/students",
  GET_STUDENT_PROGRESS_API: BASE_URL + "/api/v1/admin/courses/:courseId/students/:studentId/progress",

  // Analytics
  GET_ANALYTICS_API: BASE_URL + "/api/v1/admin/analytics",

  // Orders Management
  GET_ALL_ORDERS_API: BASE_URL + "/api/v1/admin/orders",
  DELETE_ORDER_API: BASE_URL + "/api/v1/admin/orders/:orderId",
  UPDATE_ORDER_STATUS_API: BASE_URL + "/api/v1/admin/orders/:orderId/status",
  GENERATE_ORDERS_PDF_API: BASE_URL + "/api/v1/admin/orders/export-pdf",
  GET_ORDER_BY_COURSE_API: BASE_URL + "/api/v1/admin/orders/course/:courseId",
  // Notification Management
  SEND_NOTIFICATION_API: BASE_URL + "/api/v1/admin/notifications/send",
  GET_ALL_NOTIFICATIONS_API: BASE_URL + "/api/v1/admin/notifications",
  DELETE_NOTIFICATION_API: BASE_URL + "/api/v1/admin/notifications/:notificationId",
  GET_NOTIFICATION_COUNTS_API: BASE_URL + "/api/v1/admin/notification-counts",
  MARK_SECTION_SEEN_API: BASE_URL + "/api/v1/admin/mark-section-seen/:sectionId",

  // Review Management
  GET_ALL_REVIEWS_ADMIN_API: BASE_URL + "/api/v1/admin/reviews",
  TOGGLE_REVIEW_SELECTION_API: BASE_URL + "/api/v1/admin/reviews/:reviewId/toggle-selection",
  BULK_UPDATE_REVIEW_SELECTION_API: BASE_URL + "/api/v1/admin/reviews/bulk-update-selection",
  DELETE_REVIEW_API: BASE_URL + "/api/v1/admin/reviews/:reviewId",
}

// COURSE ACCESS ENDPOINTS
export const courseAccessEndpoints = {
  // Public
  GET_FREE_COURSES_API: BASE_URL + "/api/v1/course-access/free-courses",
  
  // Student
  REQUEST_COURSE_ACCESS_API: BASE_URL + "/api/v1/course-access/request-access",
  GET_USER_ACCESS_REQUESTS_API: BASE_URL + "/api/v1/course-access/my-requests",
  REQUEST_BUNDLE_ACCESS_API: BASE_URL + "/api/v1/course-access/bundle-request",
  
  // Admin
  GET_ALL_ACCESS_REQUESTS_API: BASE_URL + "/api/v1/course-access/requests",
  HANDLE_ACCESS_REQUEST_API: BASE_URL + "/api/v1/course-access/requests/:requestId",
  GET_BUNDLE_REQUESTS_API: BASE_URL + "/api/v1/course-access/bundle-requests",
  UPDATE_BUNDLE_REQUEST_STATUS_API: BASE_URL + "/api/v1/course-access/bundle-update-status/:bundleId",
}

// QUIZ ENDPOINTS
export const quizEndpoints = {
  CREATE_QUIZ_API: BASE_URL + "/api/v1/quiz/create",
  UPDATE_QUIZ_API: BASE_URL + "/api/v1/quiz/update/:quizId",
  GET_QUIZ_API: BASE_URL + "/api/v1/quiz/:quizId",
  GET_ALL_QUIZZES_API: BASE_URL + "/api/v1/quiz/all",
  SUBMIT_QUIZ_API: BASE_URL + "/api/v1/quiz/submit",
  GET_QUIZ_RESULTS_API: BASE_URL + "/api/v1/quiz/results/:quizId",
  GET_QUIZ_STATUS_API: BASE_URL + "/api/v1/quiz/status/:quizId",
  VALIDATE_SECTION_ACCESS_API: BASE_URL + "/api/v1/quiz/validate-access/:sectionId",
}

// CERTIFICATE ENDPOINTS
export const certificateEndpoints = {
  GENERATE_CERTIFICATE_API: BASE_URL + "/api/v1/certificate/generate",
  VERIFY_CERTIFICATE_API: BASE_URL + "/api/v1/certificate/verify",
  GET_USER_CERTIFICATES_API: BASE_URL + "/api/v1/certificate/user-certificates",
}
// NOTIFICATION ENDPOINTS
export const notificationEndpoints = {
  GET_NOTIFICATIONS_API: BASE_URL + "/api/v1/notification/get-notifications",
  MARK_AS_READ_API: BASE_URL + "/api/v1/notification/mark-as-read",
  MARK_ALL_READ_API: BASE_URL + "/api/v1/notification/mark-all-as-read",
  DELETE_NOTIFICATION_API: BASE_URL + "/api/v1/notification/delete",
}

// FAQ ENDPOINTS
export const faqEndpoints = {
  SUBMIT_QUESTION_API: BASE_URL + "/api/v1/faqs/ask",
  GET_ALL_FAQS_API: BASE_URL + "/api/v1/faqs/all",
  GET_PUBLISHED_FAQS_API: BASE_URL + "/api/v1/faqs/published",
  ANSWER_FAQ_API: BASE_URL + "/api/v1/faqs/answer/:id",
  TOGGLE_FAQ_PUBLISH_API: BASE_URL + "/api/v1/faqs/toggle-publish/:id",
  DELETE_FAQ_API: BASE_URL + "/api/v1/faqs/delete/:id",
}

// CHAT ENDPOINTS
export const chatEndpoints = {
  // Student endpoints
  INITIATE_CHAT_API: BASE_URL + "/api/v1/chat/initiate",
  GET_STUDENT_CHATS_API: BASE_URL + "/api/v1/chat/student/chats",
  
  // Instructor endpoints
  GET_INSTRUCTOR_CHATS_API: BASE_URL + "/api/v1/chat/instructor/chats",
  
  // Admin endpoints
  GET_ALL_CHATS_API: BASE_URL + "/api/v1/chat/admin/chats",
  ARCHIVE_CHAT_API: BASE_URL + "/api/v1/chat/admin/archive",
  UNARCHIVE_CHAT_API: BASE_URL + "/api/v1/chat/admin/unarchive",
  FLAG_CHAT_API: BASE_URL + "/api/v1/chat/admin/flag",
  UNFLAG_CHAT_API: BASE_URL + "/api/v1/chat/admin/unflag",
  DELETE_CHAT_API: BASE_URL + "/api/v1/chat/admin/delete",
  HIDE_MESSAGE_API: BASE_URL + "/api/v1/chat/admin/hide-message",
  
  // Common endpoints
  SEND_MESSAGE_API: BASE_URL + "/api/v1/chat/message",
  GET_CHAT_MESSAGES_API: BASE_URL + "/api/v1/chat/messages",
  GET_CHAT_DETAILS_API: BASE_URL + "/api/v1/chat/details",
}

// JOB ENDPOINTS
export const jobsEndpoints = {
  // Public endpoints
  GET_PUBLISHED_JOBS_API: BASE_URL + "/api/v1/jobs/published",
  GET_JOB_DETAILS_API: BASE_URL + "/api/v1/jobs/details/:jobId",
  
  // Admin job management endpoints
  CREATE_JOB_API: BASE_URL + "/api/v1/jobs/create",
  GET_ALL_JOBS_API: BASE_URL + "/api/v1/jobs/all",
  UPDATE_JOB_API: BASE_URL + "/api/v1/jobs/update/:jobId",
  DELETE_JOB_API: BASE_URL + "/api/v1/jobs/delete/:jobId",
  TOGGLE_JOB_PUBLICATION_API: BASE_URL + "/api/v1/jobs/toggle-publication/:jobId",
  GET_JOBS_ANALYTICS_API: BASE_URL + "/api/v1/jobs/analytics",
  
  // Application management endpoints (Admin)
  GET_JOB_APPLICATIONS_API: BASE_URL + "/api/v1/jobs/applications/:jobId",
  GET_ALL_APPLICATIONS_API: BASE_URL + "/api/v1/jobs/applications",
  UPDATE_APPLICATION_STATUS_API: BASE_URL + "/api/v1/jobs/application/:applicationId/status",
  
  // Job application endpoints (Public)
  SUBMIT_APPLICATION_API: BASE_URL + "/api/v1/job-applications/submit",
  GET_APPLICATION_BY_ID_API: BASE_URL + "/api/v1/job-applications/:applicationId",
  DELETE_APPLICATION_API: BASE_URL + "/api/v1/job-applications/:applicationId",
  BULK_UPDATE_APPLICATION_STATUS_API: BASE_URL + "/api/v1/job-applications/bulk-update",
  GET_APPLICATION_STATISTICS_API: BASE_URL + "/api/v1/job-applications/statistics/:jobId?",
  GET_APPLICATIONS_BY_EMAIL_API: BASE_URL + "/api/v1/job-applications/email/:email",
  DOWNLOAD_RESUME_API: BASE_URL + "/api/v1/job-applications/download/:applicationId",
}

// COUPON ENDPOINTS (User accessible)
export const couponEndpoints = {
  // User accessible coupon endpoints
  GET_FRONTEND_COUPONS_API: BASE_URL + "/api/v1/auth/coupons/frontend",
  VALIDATE_AND_APPLY_COUPON_API: BASE_URL + "/api/v1/auth/coupons/validate-and-apply",
  
  // Legacy endpoints (for backward compatibility)
  VALIDATE_COUPON_API: BASE_URL + "/api/v1/auth/coupons/validate-and-apply",
  APPLY_COUPON_API: BASE_URL + "/api/v1/auth/coupons/validate-and-apply",
}
