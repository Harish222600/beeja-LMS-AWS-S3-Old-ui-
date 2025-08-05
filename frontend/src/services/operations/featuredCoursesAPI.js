import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { featuredCoursesEndpoints } from "../apis"

const {
  GET_FEATURED_COURSES_API,
  UPDATE_FEATURED_COURSES_API,
} = featuredCoursesEndpoints

// Get featured courses
export const getFeaturedCourses = async () => {
  // const toastId = toast.loading("Loading featured courses...")
  try {
    const response = await apiConnector("GET", GET_FEATURED_COURSES_API)
    console.log("GET_FEATURED_COURSES_API Response:", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Fetch Featured Courses")
    }
    
    return response.data.data
  } catch (error) {
    console.error("GET_FEATURED_COURSES_API ERROR:", error)
    toast.error(error.message)
    return null
  } finally {
    // toast.dismiss(toastId)
  }
}

// Update featured courses
export const updateFeaturedCourses = async (data, token) => {
  const toastId = toast.loading("Updating featured courses...")
  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await apiConnector("POST", UPDATE_FEATURED_COURSES_API, data, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("UPDATE_FEATURED_COURSES_API Response:", response)

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Featured Courses")
    }

    
    return response.data.data
  } catch (error) {
    console.error("UPDATE_FEATURED_COURSES_API ERROR:", error)
    toast.error(error.message)
    return null
  } finally {
    toast.dismiss(toastId)
  }
}
