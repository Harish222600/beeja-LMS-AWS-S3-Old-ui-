import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { courseAccessEndpoints } from "../apis"

const {
  GET_FREE_COURSES_API,
  REQUEST_COURSE_ACCESS_API,
  GET_USER_ACCESS_REQUESTS_API,
  GET_ALL_ACCESS_REQUESTS_API,
  HANDLE_ACCESS_REQUEST_API,
} = courseAccessEndpoints

// ================ Get Free Courses ================
export const getFreeCourses = async (page = 1, limit = 10, category = null) => {
  let result = []
  const toastId = toast.loading("Loading...")

  try {
    let url = `${GET_FREE_COURSES_API}?page=${page}&limit=${limit}`
    if (category) {
      url += `&category=${category}`
    }

    const response = await apiConnector("GET", url)
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Free Courses")
    }
    
    result = response?.data
  } catch (error) {
    console.log("GET_FREE_COURSES_API ERROR............", error)
    toast.error(error.message)
  }
  
  toast.dismiss(toastId)
  return result
}

// ================ Request Course Access ================
export const requestCourseAccess = async (data, token) => {
  let result = null
  const toastId = toast.loading("Submitting request...")

  try {
    // Remove 'Bearer ' prefix if it's already included
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    
    const response = await apiConnector("POST", REQUEST_COURSE_ACCESS_API, data, {
      Authorization: authToken,
    })
    
    console.log("REQUEST_COURSE_ACCESS_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error("Could Not Submit Access Request")
    }

    result = response?.data?.data
  } catch (error) {
    console.log("REQUEST_COURSE_ACCESS_API ERROR............", error)
    toast.error(error.response?.data?.message || error.message)
  }
  
  toast.dismiss(toastId)
  return result
}

// ================ Get User Access Requests ================
export const getUserAccessRequests = async (token) => {
  let result = []

  try {
    const response = await apiConnector("GET", GET_USER_ACCESS_REQUESTS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET_USER_ACCESS_REQUESTS_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Access Requests")
    }

    result = response?.data?.data
  } catch (error) {
    console.log("GET_USER_ACCESS_REQUESTS_API ERROR............", error)
    toast.error(error.message)
  }
  
  return result
}

// ================ Get All Access Requests (Admin) ================
export const getAllAccessRequests = async (token, status = null, page = 1, limit = 10) => {
  let result = null
  const toastId = toast.loading("Loading...")

  try {
    let url = `${GET_ALL_ACCESS_REQUESTS_API}?page=${page}&limit=${limit}`
    if (status) {
      url += `&status=${status}`
    }

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET_ALL_ACCESS_REQUESTS_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Access Requests")
    }

    result = response?.data
  } catch (error) {
    console.log("GET_ALL_ACCESS_REQUESTS_API ERROR............", error)
    toast.error(error.message)
  }
  
  toast.dismiss(toastId)
  return result
}

// ================ Handle Access Request (Admin) ================
export const handleAccessRequest = async (requestId, action, adminResponse, token) => {
  let result = null
  const toastId = toast.loading("Processing...")

  try {
    const url = HANDLE_ACCESS_REQUEST_API.replace(':requestId', requestId)
    
    const response = await apiConnector("PUT", url, {
      action,
      adminResponse
    }, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("HANDLE_ACCESS_REQUEST_API RESPONSE............", response)

    if (!response?.data?.success) {
      throw new Error("Could Not Process Access Request")
    }

    result = response?.data?.data
    toast.success(`Access request ${action}d successfully`)
  } catch (error) {
    console.log("HANDLE_ACCESS_REQUEST_API ERROR............", error)
    toast.error(error.message)
  }
  
  toast.dismiss(toastId)
  return result
}
