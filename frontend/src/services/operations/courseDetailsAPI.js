 import { toast } from "react-hot-toast"
const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
import { updateCompletedLectures } from "../../slices/viewCourseSlice"
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector"
import { courseEndpoints } from "../apis"

const {
  COURSE_DETAILS_API,
  COURSE_CATEGORIES_API,
  GET_ALL_COURSE_API,
  CREATE_COURSE_API,
  EDIT_COURSE_API,
  CREATE_SECTION_API,
  CREATE_SUBSECTION_API,
  UPDATE_SECTION_API,
  UPDATE_SUBSECTION_API,
  DELETE_SECTION_API,
  DELETE_SUBSECTION_API,
  GET_ALL_INSTRUCTOR_COURSES_API,
  DELETE_COURSE_API,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED,
  CREATE_RATING_API,
  LECTURE_COMPLETION_API,
} = courseEndpoints



// ================ get All Courses ================
export const getAllCourses = async () => {
  const toastId = toast.loading("Loading...")
  let result = []

  try {
    const response = await apiConnector("GET", GET_ALL_COURSE_API)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Categories")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_ALL_COURSE_API API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}


// ================ fetch Course Details ================
export const fetchCourseDetails = async (courseId) => {
  // const toastId = toast.loading('Loading')
  //   dispatch(setLoading(true));
  let result = null;

  try {
    const response = await apiConnector("POST", COURSE_DETAILS_API, { courseId, })
    console.log("COURSE_DETAILS_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data
  } catch (error) {
    console.log("COURSE_DETAILS_API API ERROR............", error)
    result = error.response.data
    // toast.error(error.response.data.message);
  }
  // toast.dismiss(toastId)
  //   dispatch(setLoading(false));
  return result
}

// ================ fetch Course Categories ================
export const fetchCourseCategories = async () => {
  try {
    const response = await apiConnector("GET", COURSE_CATEGORIES_API);
    
    if (!response?.data?.success || !Array.isArray(response?.data?.data)) {
      console.log("No categories found or invalid API response");
      return [];
    }

    return response.data.data;
  } catch (error) {
    console.log("Error fetching categories:", error.message);
    return [];
  }
}


// ================ add Course Details ================
export const addCourseDetails = async (data, token) => {
  const toastId = toast.loading("Loading...")
  let result = null;

  try {
    // Check if thumbnailImage is a File object (needs upload) or URL string (already uploaded)
    const formData = new FormData()
    
    // Add all form fields
    Object.keys(data).forEach(key => {
      if (key === 'thumbnailImage') {
        // Handle thumbnail image
        if (data[key] instanceof File) {
          // File object - add to FormData for server-side upload
          formData.append(key, data[key])
        } else if (typeof data[key] === 'string' && data[key].startsWith('http')) {
          // URL string - already uploaded via direct upload
          formData.append('thumbnailImageUrl', data[key])
        }
      } else {
        formData.append(key, data[key])
      }
    })

    const response = await apiConnector("POST", CREATE_COURSE_API, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE COURSE API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error("Could Not Add Course Details")
    }

    result = response?.data?.data
    toast.success("Course Details Added Successfully")
  } catch (error) {
    console.log("CREATE COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}


// ================ edit Course Details ================
export const editCourseDetails = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")

  try {
    const response = await apiConnector("POST", EDIT_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("EDIT COURSE API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error("Could Not Update Course Details")
    }

    result = response?.data?.data
    toast.success("Course Details Updated Successfully")
  } catch (error) {
    console.log("EDIT COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}


// ================ create Section ================
export const createSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")

  try {
    const response = await apiConnector("POST", CREATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE SECTION API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Create Section")
    }

    result = response?.data?.updatedCourseDetails
    toast.success("Course Section Created")
  } catch (error) {
    console.log("CREATE SECTION API ERROR............", error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error("Authentication failed. Please login again.")
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to create sections in this course.")
    } else if (error.response?.status === 404) {
      toast.error("Course not found.")
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error(error.message || "Could Not Create Section")
    }
    
    // Re-throw error for proper handling in calling function
    throw error
  }
  toast.dismiss(toastId)
  return result
}


// ================ create SubSection ================
export const createSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")

  try {
    let formData;
    
    // Check if data is already FormData (from AdminCourseBuilder batch save)
    if (data instanceof FormData) {
      console.log("Using existing FormData for subsection creation")
      formData = data;
    } else {
      // Handle legacy object format - convert to FormData
      console.log("Converting object to FormData for subsection creation")
      formData = new FormData()
      
      // Add all form fields
      Object.keys(data).forEach(key => {
        if (key === 'video') {
          // Handle video file
          if (data[key] instanceof File) {
            // File object - add to FormData for server-side upload
            formData.append(key, data[key])
          } else if (typeof data[key] === 'string' && data[key].startsWith('http')) {
            // URL string - already uploaded via direct upload
            formData.append('videoUrl', data[key])
          }
        } else {
          formData.append(key, data[key])
        }
      })
    }

    const response = await apiConnector("POST", CREATE_SUBSECTION_API, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    })
    console.log("CREATE SUB-SECTION API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Add Lecture")
    }

    result = response?.data?.data
    toast.success("Lecture Added Successfully")
    
  } catch (error) {
    console.log("CREATE SUB-SECTION API ERROR............", error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error("Authentication failed. Please login again.")
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to add lectures to this course.")
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error(error.message || "Could Not Add Lecture")
    }
  }
  toast.dismiss(toastId)
  return result
}


// ================ Update Section ================
export const updateSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")

  try {
    const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE SECTION API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Section")
    }

    result = response?.data?.data
    toast.success("Course Section Updated")
  } catch (error) {
    console.log("UPDATE SECTION API ERROR............", error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error("Authentication failed. Please login again.")
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to update this section.")
    } else if (error.response?.status === 404) {
      toast.error("Section not found.")
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error(error.message || "Could Not Update Section")
    }
    
    // Re-throw error for proper handling in calling function
    throw error
  }
  toast.dismiss(toastId)
  return result
}


// ================ Update SubSection ================
export const updateSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")

  try {
    let formData;
    
    // Check if data is already FormData (from AdminCourseBuilder batch save)
    if (data instanceof FormData) {
      console.log("Using existing FormData for subsection update")
      formData = data;
    } else {
      // Handle legacy object format - convert to FormData
      console.log("Converting object to FormData for subsection update")
      formData = new FormData()
      
      // Add all form fields
      Object.keys(data).forEach(key => {
        if (key === 'videoFile') {
          // Handle video file
          if (data[key] instanceof File) {
            // File object - add to FormData for server-side upload
            formData.append(key, data[key])
          } else if (typeof data[key] === 'string' && data[key].startsWith('http')) {
            // URL string - already uploaded via direct upload
            formData.append('videoUrl', data[key])
          }
        } else {
          formData.append(key, data[key])
        }
      })
    }

    const response = await apiConnector("POST", UPDATE_SUBSECTION_API, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    })
    console.log("UPDATE SUB-SECTION API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Lecture")
    }

    result = response?.data?.data
    toast.success("Lecture Updated")
  } catch (error) {
    console.log("UPDATE SUB-SECTION API ERROR............", error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error("Authentication failed. Please login again.")
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to update this lecture.")
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error(error.message || "Could Not Update Lecture")
    }
  }
  toast.dismiss(toastId)
  return result
}


// ================ delete Section ================
export const deleteSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")

  try {
    const response = await apiConnector("POST", DELETE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SECTION API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Delete Section")
    }

    result = response?.data?.data
    toast.success("Course Section Deleted")
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error("Authentication failed. Please login again.")
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to delete this section.")
    } else if (error.response?.status === 404) {
      toast.error("Section not found.")
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error(error.message || "Could Not Delete Section")
    }
    
    // Re-throw error for proper handling in calling function
    throw error
  }
  toast.dismiss(toastId)
  return result
}


// ================ delete SubSection ================
export const deleteSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Delete Lecture")
    }
    result = response?.data?.data
    toast.success("Lecture Deleted")
  } catch (error) {
    console.log("DELETE SUB-SECTION API ERROR............", error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error("Authentication failed. Please login again.")
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to delete this lecture.")
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error(error.message || "Could Not Delete Lecture")
    }
    
    // Re-throw error for proper handling in calling function
    throw error
  }
  toast.dismiss(toastId)
  return result
}

// ================ fetch Instructor Courses ================
export const fetchInstructorCourses = async (token, userRole) => {
  let result = []
  // const toastId = toast.loading("Loading...")
  try {
    const endpoint =
      userRole === "Admin"
        ? GET_ALL_INSTRUCTOR_COURSES_API
        : BASE_URL + "/api/v1/course/getInstructorCoursesForInstructor"

    const response = await apiConnector("GET", endpoint, null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("INSTRUCTOR COURSES API RESPONSE", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Instructor Courses")
    }
    
    // Use the totalDuration calculated by the backend
    result = response?.data?.data || []
  } catch (error) {
    console.log("INSTRUCTOR COURSES API ERROR............", error)
    toast.error(error.message)
  }
  return result
}


// ================ delete Course ================
export const deleteCourse = async (data, token) => {
  // const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("DELETE", DELETE_COURSE_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE COURSE API RESPONSE............", response)
     if (!response?.data?.success) {
      throw new Error("Could Not Delete Course")
    }
    
  } catch (error) {
    console.log("DELETE COURSE API ERROR............", error)
    toast.error(error.message)
  }
  // toast.dismiss(toastId)
}


// ================ get Full Details Of Course ================
export const getFullDetailsOfCourse = async (courseId, token) => {
  // const toastId = toast.loading("Loading...")
  //   dispatch(setLoading(true));
  let result = null
  try {
    const response = await apiConnector(
      "POST",
      GET_FULL_COURSE_DETAILS_AUTHENTICATED,
      {
        courseId,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
    console.log("COURSE_FULL_DETAILS_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response?.data?.data
  } catch (error) {
    console.log("COURSE_FULL_DETAILS_API API ERROR............", error)
    
    // Show appropriate error message to user
    if (error.response?.status === 401) {
      toast.error("You are not authorized to access this course")
    } else if (error.response?.status === 403) {
      toast.error("You are not enrolled in this course")
    } else if (error.response?.status === 404) {
      toast.error("Course not found")
    } else {
      toast.error(error.response?.data?.message || error.message || "Failed to load course details")
    }
    
    result = null // Return null instead of error data
  }
  // toast.dismiss(toastId)
  //   dispatch(setLoading(false));
  return result
}


// ================ mark Lecture As Complete ================
export const markLectureAsComplete = async (data, token) => {
  let result = null
  // console.log("mark complete data", data)
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("MARK_LECTURE_AS_COMPLETE_API API RESPONSE............", response)

    if (response.data.message === "Course progress updated") {
      toast.success("Lecture Completed")
      result = true
    } else if (response.data.error) {
      throw new Error(response.data.error)
    } else if (response.data.success === false) {
      throw new Error(response.data.message)
    } else {
      throw new Error("Unknown error occurred")
    }
  } catch (error) {
    console.log("MARK_LECTURE_AS_COMPLETE_API API ERROR............", error)
    toast.error(error.response?.data?.error || error.response?.data?.message || error.message)
    result = false
  }
  toast.dismiss(toastId)
  return result
}


// ================ create Course Rating  ================
export const createRating = async (data, token) => {
  const toastId = toast.loading("Loading...")
  let success = false
  try {
    // Log the request details
    console.log("Creating rating with:", {
      data,
      token: token ? "Token exists" : "No token",
      headers: { Authorization: `Bearer ${token}` }
    })

    const response = await apiConnector("POST", CREATE_RATING_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE RATING API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Create Rating")
    }
    toast.success("Rating Created")
    success = true
  } catch (error) {
    success = false
    console.log("CREATE RATING API ERROR............", error)
    // Show the actual error message from the server if available
    toast.error(error.response?.data?.message || error.message || "Error creating rating")
  }
  toast.dismiss(toastId)
  return success
}

