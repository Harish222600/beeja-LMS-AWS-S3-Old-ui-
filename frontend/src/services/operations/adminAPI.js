import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { adminEndpoints, courseEndpoints } from "../apis"

const {
  GET_ALL_USERS_API,
  CREATE_USER_API,
  UPDATE_USER_API,
  DELETE_USER_API,
  TOGGLE_USER_STATUS_API,
  GET_ALL_INSTRUCTORS_API,
  GET_ALL_COURSES_API,
  CREATE_COURSE_AS_ADMIN_API,
  APPROVE_COURSE_API,
  ADMIN_DELETE_COURSE_API,
  TOGGLE_COURSE_VISIBILITY_API,
  SET_COURSE_TYPE_API,
  GET_ANALYTICS_API,
  GET_STUDENTS_BY_COURSE_API,
  GET_STUDENT_PROGRESS_API,
  GET_ALL_REVIEWS_ADMIN_API,
  TOGGLE_REVIEW_SELECTION_API,
  BULK_UPDATE_REVIEW_SELECTION_API,
  DELETE_REVIEW_API,
  GET_NOTIFICATION_COUNTS_API,
  MARK_SECTION_SEEN_API,
} = adminEndpoints

const {
  DELETE_CATEGORY_API,
} = courseEndpoints


// ================ Get All Users ================
export const getAllUsers = async (token) => {
  let result = []
  const toastId = toast.loading("Loading users...")

  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Ensure token is properly formatted
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    console.log("Making request to:", GET_ALL_USERS_API);
    console.log("Using token:", formattedToken);
    
    const response = await apiConnector("GET", GET_ALL_USERS_API, null, {
      Authorization: formattedToken,
    })
    
    console.log("GET_ALL_USERS_API Response:", response)
    
    if (!response?.data?.success) {
      const error = response?.data?.message || "Could Not Fetch Users"
      console.error("API Error:", error)
      throw new Error(error)
    }
    
    result = response?.data?.users
    if (!result) {
      console.error("No users data in response")
      throw new Error("No users data received")
    }
    
    console.log("Fetched users:", result)
  } catch (error) {
    console.error("GET_ALL_USERS_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    toast.error(error.response?.data?.message || error.message)
    throw error // Re-throw to handle in component
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Create User ================
export const createUser = async (data, token) => {
  const toastId = toast.loading("Creating user...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!data) {
      throw new Error("User data is required")
    }

    const response = await apiConnector("POST", CREATE_USER_API, data, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("CREATE_USER_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Create User")
    }

    if (!response?.data?.user) {
      throw new Error("No user data received in response")
    }

    
    result = response.data.user
  } catch (error) {
    console.error("CREATE_USER_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to create user"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Update User ================
export const updateUser = async (userId, data, token) => {
  const toastId = toast.loading("Updating user...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!userId) {
      throw new Error("User ID is required")
    }

    if (!data) {
      throw new Error("Update data is required")
    }

    const url = UPDATE_USER_API.replace(':userId', userId)
    
    const response = await apiConnector("PUT", url, data, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("UPDATE_USER_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update User")
    }

    if (!response?.data?.user) {
      throw new Error("No user data received in response")
    }

    toast.success("User updated successfully")
    result = response.data.user
  } catch (error) {
    console.error("UPDATE_USER_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to update user"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Delete User ================
export const deleteUser = async (userId, token) => {
  const toastId = toast.loading("Deleting user...")
  let result = false

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!userId) {
      throw new Error("User ID is required")
    }

    const url = DELETE_USER_API.replace(':userId', userId)
    
    const response = await apiConnector("DELETE", url, undefined, {
      Authorization: `Bearer ${token}`
    })
    
    console.log("DELETE_USER_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Delete User")
    }

    toast.success("User deleted successfully")
    result = true
  } catch (error) {
    console.error("DELETE_USER_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete user"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Toggle User Status ================
export const toggleUserStatus = async (userId, token) => {
  const toastId = toast.loading("Updating user status...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!userId) {
      throw new Error("User ID is required")
    }

    const url = TOGGLE_USER_STATUS_API.replace(':userId', userId)
    
    const response = await apiConnector("PUT", url, {}, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    
    console.log("TOGGLE_USER_STATUS_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update User Status")
    }

    if (!response?.data?.user) {
      throw new Error("No user data received in response")
    }

    toast.success("User status updated successfully")
    result = response.data.user
  } catch (error) {
    console.error("TOGGLE_USER_STATUS_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to update user status"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Get All Courses ================
export const getAllCourses = async (token) => {
  let result = []

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await apiConnector("GET", GET_ALL_COURSES_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET_ALL_COURSES_API Response:", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Fetch Courses")
    }
    
    if (!response?.data?.courses) {
      throw new Error("No courses data received")
    }
    
    result = response.data.courses
    console.log("Fetched courses:", result.length)
  } catch (error) {
    console.error("GET_ALL_COURSES_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch courses"
    toast.error(errorMessage)
    throw error
  }
  
  return { courses: result }
}

// ================ Approve Course ================
export const approveCourse = async (courseId, token) => {
  const toastId = toast.loading("Approving course...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!courseId) {
      throw new Error("Course ID is required")
    }

    const url = APPROVE_COURSE_API.replace(':courseId', courseId)
    
    const response = await apiConnector("PUT", url, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("APPROVE_COURSE_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Approve Course")
    }

    if (!response?.data?.course) {
      throw new Error("No course data received in response")
    }

    
    result = response.data.course
  } catch (error) {
    console.error("APPROVE_COURSE_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to approve course"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Delete Course ================
export const deleteCourse = async (courseId, token) => {
  const toastId = toast.loading("Deleting course...")
  let result = false

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!courseId) {
      throw new Error("Course ID is required")
    }

    const url = ADMIN_DELETE_COURSE_API.replace(':courseId', courseId)
    
    const response = await apiConnector("DELETE", url, undefined, {
      Authorization: `Bearer ${token}`
    })
    
    console.log("ADMIN_DELETE_COURSE_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Delete Course")
    }

    
    result = true
  } catch (error) {
    console.error("ADMIN_DELETE_COURSE_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete course"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Toggle Course Visibility ================
export const toggleCourseVisibility = async (courseId, token) => {
  const toastId = toast.loading("Updating course visibility...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!courseId) {
      throw new Error("Course ID is required")
    }

    const url = TOGGLE_COURSE_VISIBILITY_API.replace(':courseId', courseId)
    
    const response = await apiConnector("PUT", url, {}, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    
    console.log("TOGGLE_COURSE_VISIBILITY_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Course Visibility")
    }

    if (!response?.data?.course) {
      throw new Error("No course data received in response")
    }
    result = response.data.course
  } catch (error) {
    console.error("TOGGLE_COURSE_VISIBILITY_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to update course visibility"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Get All Instructors ================
export const getAllInstructors = async (token) => {
  let result = []
  const toastId = toast.loading("Loading instructors...")

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await apiConnector("GET", GET_ALL_INSTRUCTORS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET_ALL_INSTRUCTORS_API Response:", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Fetch Instructors")
    }
    
    if (!response?.data?.instructors) {
      throw new Error("No instructors data received")
    }
    
    result = response.data.instructors
  } catch (error) {
    console.error("GET_ALL_INSTRUCTORS_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch instructors"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Create Course As Admin ================
export const createCourseAsAdmin = async (formData, token) => {
  const toastId = toast.loading("Creating course...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!formData) {
      throw new Error("Course data is required")
    }

    console.log("Sending course creation request with formData:", formData)
    
    const response = await apiConnector("POST", CREATE_COURSE_AS_ADMIN_API, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    })
    
    console.log("CREATE_COURSE_AS_ADMIN_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Create Course")
    }

    if (!response?.data?.course) {
      throw new Error("No course data received in response")
    }

    
    result = response.data.course
  } catch (error) {
    console.error("CREATE_COURSE_AS_ADMIN_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to create course"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Get Analytics ================
export const getAnalytics = async (token) => {
  let result = null
  const toastId = toast.loading("Loading analytics...")

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await apiConnector("GET", GET_ANALYTICS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET_ANALYTICS_API Response:", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Fetch Analytics")
    }
    
    if (!response?.data?.analytics) {
      throw new Error("No analytics data received")
    }
    
    // Map the backend response to match the frontend expected structure
    const analytics = response.data.analytics
    result = {
      users: analytics.users,
      courses: analytics.courses,
      requests: analytics.requests,
      revenue: analytics.revenue,
      enrollments: analytics.enrollments,
      recentCourses: analytics.recentCourses || [],
      recentLogins: analytics.recentLogins || [],
      activeLogins: analytics.activeLogins || []
    }

    console.log("Mapped analytics data:", result)
  } catch (error) {
    console.error("GET_ANALYTICS_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch analytics"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Get Students By Course ================
export const getStudentsByCourse = async (courseId, token) => {
  let result = []
  const toastId = toast.loading("Loading students...")

  try {
    const url = GET_STUDENTS_BY_COURSE_API.replace(':courseId', courseId)
    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Students")
    }
    
    result = response?.data?.students
  } catch (error) {
    console.log("GET_STUDENTS_BY_COURSE_API ERROR............", error)
    toast.error(error.message)
  }
  
  toast.dismiss(toastId)
  return result
}

// ================ Get Student Progress ================
export const getStudentProgress = async (courseId, studentId, token) => {
  let result = null
  const toastId = toast.loading("Loading progress...")

  try {
    const url = GET_STUDENT_PROGRESS_API
      .replace(':courseId', courseId)
      .replace(':studentId', studentId)
    
    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Student Progress")
    }
    
    result = response?.data?.progress
  } catch (error) {
    console.log("GET_STUDENT_PROGRESS_API ERROR............", error)
    toast.error(error.message)
  }
  
  toast.dismiss(toastId)
  return result
}

// ================ Set Course Type ================
export const setCourseType = async (courseId, courseType, token) => {
  const toastId = toast.loading("Updating course type...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!courseId) {
      throw new Error("Course ID is required")
    }

    if (!courseType) {
      throw new Error("Course type is required")
    }

    const url = SET_COURSE_TYPE_API.replace(':courseId', courseId)
    
    const response = await apiConnector("PUT", url, { courseType }, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("SET_COURSE_TYPE_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Course Type")
    }

    if (!response?.data?.data) {
      throw new Error("No course data received in response")
    }

    result = response.data.data
  } catch (error) {
    console.error("SET_COURSE_TYPE_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to update course type"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Get All Reviews for Admin ================
export const getAllReviewsForAdmin = async (token) => {
  let result = []
  const toastId = toast.loading("Loading reviews...")

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await apiConnector("GET", GET_ALL_REVIEWS_ADMIN_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET_ALL_REVIEWS_ADMIN_API Response:", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Fetch Reviews")
    }
    
    if (!response?.data?.data) {
      throw new Error("No reviews data received")
    }
    
    result = response.data.data
    console.log("Fetched reviews:", result.length)
  } catch (error) {
    console.error("GET_ALL_REVIEWS_ADMIN_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch reviews"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Toggle Review Selection ================
export const toggleReviewSelection = async (reviewId, token) => {
  const toastId = toast.loading("Updating review selection...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!reviewId) {
      throw new Error("Review ID is required")
    }

    const url = TOGGLE_REVIEW_SELECTION_API.replace(':reviewId', reviewId)
    
    const response = await apiConnector("PUT", url, {}, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("TOGGLE_REVIEW_SELECTION_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Review Selection")
    }

    if (!response?.data?.data) {
      throw new Error("No review data received in response")
    }

    toast.success(response?.data?.message || "Review selection updated successfully")
    result = response.data.data
  } catch (error) {
    console.error("TOGGLE_REVIEW_SELECTION_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to update review selection"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Bulk Update Review Selection ================
export const bulkUpdateReviewSelection = async (reviewIds, isSelected, token) => {
  const toastId = toast.loading("Updating review selections...")
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!reviewIds || !Array.isArray(reviewIds)) {
      throw new Error("Review IDs array is required")
    }

    if (typeof isSelected !== 'boolean') {
      throw new Error("isSelected must be a boolean value")
    }

    const response = await apiConnector("PUT", BULK_UPDATE_REVIEW_SELECTION_API, {
      reviewIds,
      isSelected
    }, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("BULK_UPDATE_REVIEW_SELECTION_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Review Selections")
    }

    if (!response?.data?.data) {
      throw new Error("No data received in response")
    }

    toast.success(response?.data?.message || "Review selections updated successfully")
    result = response.data.data
  } catch (error) {
    console.error("BULK_UPDATE_REVIEW_SELECTION_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to update review selections"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Delete Review ================
export const deleteReview = async (reviewId, token) => {
  const toastId = toast.loading("Deleting review...")
  let result = false

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!reviewId) {
      throw new Error("Review ID is required")
    }

    const url = DELETE_REVIEW_API.replace(':reviewId', reviewId)
    
    const response = await apiConnector("DELETE", url, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("DELETE_REVIEW_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Delete Review")
    }

    
    result = true
  } catch (error) {
    console.error("DELETE_REVIEW_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete review"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Delete Category ================
export const deleteCategory = async (categoryId, token) => {
  const toastId = toast.loading("Deleting category...")
  let result = false

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!categoryId) {
      throw new Error("Category ID is required")
    }

    const response = await apiConnector("DELETE", DELETE_CATEGORY_API, {
      categoryId: categoryId
    }, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    })
    
    console.log("DELETE_CATEGORY_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Delete Category")
    }

    toast.success("Category moved to recycle bin successfully")
    result = true
  } catch (error) {
    console.error("DELETE_CATEGORY_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete category"
    toast.error(errorMessage)
    throw error
  } finally {
    toast.dismiss(toastId)
  }
  
  return result
}

// ================ Get Notification Counts ================
export const getNotificationCounts = async (token) => {
  let result = null

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await apiConnector("GET", GET_NOTIFICATION_COUNTS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET_NOTIFICATION_COUNTS_API Response:", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Fetch Notification Counts")
    }
    
    if (!response?.data?.data) {
      throw new Error("No notification counts data received")
    }
    
    result = response.data.data
    console.log("Fetched notification counts:", result)
  } catch (error) {
    console.error("GET_NOTIFICATION_COUNTS_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    // Don't show toast error for this as it's a background operation
    throw error
  }
  
  return result
}

// ================ Mark Section As Seen ================
export const markSectionAsSeen = async (sectionId, token) => {
  let result = false

  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!sectionId) {
      throw new Error("Section ID is required")
    }

    const url = MARK_SECTION_SEEN_API.replace(':sectionId', sectionId)
    
    const response = await apiConnector("POST", url, {}, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("MARK_SECTION_SEEN_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Mark Section As Seen")
    }

    result = true
  } catch (error) {
    console.error("MARK_SECTION_SEEN_API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    // Don't show toast error for this as it's a background operation
    throw error
  }
  
  return result
}
