import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { quizEndpoints } from "../apis"

const {
  CREATE_QUIZ_API,
  UPDATE_QUIZ_API,
  GET_QUIZ_API,
  GET_ALL_QUIZZES_API,
  SUBMIT_QUIZ_API,
  GET_QUIZ_RESULTS_API,
  GET_QUIZ_STATUS_API,
  VALIDATE_SECTION_ACCESS_API,
} = quizEndpoints

// ================ Get All Quizzes ================
export const getAllQuizzes = async (token) => {
  let result = []
  try {
    const response = await apiConnector("GET", GET_ALL_QUIZZES_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Quizzes")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_ALL_QUIZZES_API ERROR............", error)
    // Don't show error toast for quiz loading failure
    // toast.error(error.message)
  }
  return result
}

// ================ Get Quiz by ID ================
export const getQuizById = async (quizId, token) => {
  let result = null
  try {
    const response = await apiConnector("GET", GET_QUIZ_API.replace(":quizId", quizId), null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Quiz")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_QUIZ_API ERROR............", error)
    toast.error(error.message)
  }
  return result
}

// ================ Create Quiz ================
export const createQuiz = async (data, token) => {
  let result = null
  const toastId = toast.loading("Creating Quiz...")
  try {
    const response = await apiConnector("POST", CREATE_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Create Quiz")
    }
    result = response?.data?.data
    toast.success("Quiz Created Successfully")
  } catch (error) {
    console.log("CREATE_QUIZ_API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ Update Quiz ================
export const updateQuiz = async (quizId, data, token) => {
  let result = null
  const toastId = toast.loading("Updating Quiz...")
  try {
    const response = await apiConnector("PUT", UPDATE_QUIZ_API.replace(":quizId", quizId), data, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Update Quiz")
    }
    result = response?.data?.data
    toast.success("Quiz Updated Successfully")
  } catch (error) {
    console.log("UPDATE_QUIZ_API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ Submit Quiz ================
export const submitQuiz = async (data, token) => {
  let result = null
  const toastId = toast.loading(data.timerExpired ? "Time's up! Submitting Quiz..." : "Submitting Quiz...")
  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!data || !data.quizId) {
      throw new Error("Quiz submission data is required")
    }

    const response = await apiConnector("POST", SUBMIT_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Submit Quiz")
    }

    if (!response?.data?.data) {
      throw new Error("No submission data received in response")
    }
    result = response?.data?.data
    
    if (data.timerExpired) {
      toast.success("Quiz auto-submitted due to time expiry")
    } else {
      toast.success("Quiz Submitted Successfully")
    }
  } catch (error) {
    console.log("SUBMIT_QUIZ_API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// ================ Get Quiz Results ================
export const getQuizResults = async (quizId, token) => {
  let result = null
  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!quizId) {
      throw new Error("Quiz ID is required")
    }

    const response = await apiConnector("GET", GET_QUIZ_RESULTS_API.replace(":quizId", quizId), null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Quiz Results")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_QUIZ_RESULTS_API ERROR............", error)
    toast.error(error.message)
  }
  return result
}

// ================ Get Quiz Status ================
export const getQuizStatus = async (quizId, token) => {
  let result = null
  try {
    const response = await apiConnector("GET", GET_QUIZ_STATUS_API.replace(":quizId", quizId), null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Get Quiz Status")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_QUIZ_STATUS_API ERROR............", error)
    // Don't show toast for quiz status errors to avoid render warnings
    // toast.error(error.message)
  }
  return result
}

// ================ Validate Section Access ================
export const validateSectionAccess = async (sectionId, token) => {
  let result = null
  try {
    const response = await apiConnector("GET", VALIDATE_SECTION_ACCESS_API.replace(":sectionId", sectionId), null, {
      Authorization: `Bearer ${token}`,
    })
    
    if (!response?.data?.success) {
      throw new Error("Could Not Validate Section Access")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("VALIDATE_SECTION_ACCESS_API ERROR............", error)
    toast.error(error.message)
  }
  return result
}
