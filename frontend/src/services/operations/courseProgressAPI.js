import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { courseEndpoints } from "../apis"

const {
  UPDATE_QUIZ_PROGRESS_API,
  CHECK_SECTION_ACCESS_API,
} = courseEndpoints

export async function updateQuizProgress(data, token) {
  try {
    const response = await apiConnector("POST", UPDATE_QUIZ_PROGRESS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE QUIZ PROGRESS API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Quiz Progress")
    }
    return response?.data?.data
  } catch (error) {
    console.log("UPDATE QUIZ PROGRESS API ERROR............", error)
    // Don't show toast error for quiz progress as it's not critical
    return null
  }
}

export async function checkSectionAccess(data, token) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await apiConnector("POST", CHECK_SECTION_ACCESS_API, data, {
      Authorization: `Bearer ${token}`,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    console.log("CHECK SECTION ACCESS API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Check Section Access")
    }
    return response?.data?.hasAccess
  } catch (error) {
    console.log("CHECK SECTION ACCESS API ERROR............", error)
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      console.log("Request timeout - assuming no access for safety")
      return false
    }
    
    // Handle specific error cases
    if (error.response?.status === 403) {
      console.log("Access denied - course access disabled by admin")
      return false
    }
    
    if (error.response?.status === 404) {
      console.log("Course or section not found")
      return false
    }
    
    if (error.response?.status === 400) {
      console.log("Bad request - invalid course or section ID")
      return false
    }
    
    // For network errors or other issues, return false to be safe
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK' || !error.response) {
      console.log("Network error or server unavailable")
      return false
    }
    
    // Return false to indicate no access in case of any error
    return false
  }
}
