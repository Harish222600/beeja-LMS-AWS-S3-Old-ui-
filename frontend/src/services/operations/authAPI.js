import { toast } from "react-hot-toast"

import { setLoading, setToken, setUser, clearAuth } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser as setProfileUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { endpoints } from "../apis"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints

// ================ send Otp ================
export function sendOtp(email, navigate) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      })
      // console.log("SENDOTP API RESPONSE ---> ", response)

      // console.log(response.data.success)
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      navigate("/verify-email");
      toast.success("OTP Sent Successfully");
    } catch (error) {
      console.log("SENDOTP API ERROR --> ", error);
      toast.error(error.response.data?.message);
      // toast.error("Could Not Send OTP")
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  }
}

// ================ sign Up ================
export function signUp(accountType, firstName, lastName, email, password, confirmPassword, otp, navigate) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      })

      // console.log("SIGNUP API RESPONSE --> ", response);
      if (!response.data.success) {
        toast.error(response.data.message);
        throw new Error(response.data.message);
      }

      toast.success("Signup Successful");
      navigate("/login");
    } catch (error) {
      console.log("SIGNUP API ERROR --> ", error);
      const errorMessage = error.response?.data?.message || "Invalid OTP";
      toast.error(errorMessage);
      // Clear the OTP input and stay on verify-email page
      dispatch(setLoading(false));
      toast.dismiss(toastId);
      return;
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ Login ================
export function login(email, password, navigate) {
  return async (dispatch) => {

    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      console.log("LOGIN API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Login Successful")
      dispatch(setToken(response.data.token))

      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`

      const userData = { ...response.data.user, image: userImage };
      
      // Set user data in both auth and profile slices
      dispatch(setUser(userData));
      dispatch(setProfileUser(userData));

      navigate("/dashboard/my-profile");
    } catch (error) {
      console.log("LOGIN API ERROR.......", error)
      toast.error(error.response?.data?.message)
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}


// ================ get Password Reset Token ================
export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending reset email...")
    dispatch(setLoading(true))
    
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email: email.toLowerCase().trim(),
      })

      console.log("RESET PASS TOKEN RESPONSE:", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success(response.data.message || "Reset email sent successfully!")
      setEmailSent(true)
      
    } catch (error) {
      console.error("RESET PASS TOKEN ERROR:", error)
      
      // Handle different types of errors
      if (error.response?.status === 429) {
        toast.error("Too many attempts. Please wait before trying again.")
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Invalid email address")
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.")
      } else {
        toast.error(error.response?.data?.message || "Failed to send reset email")
      }
    } finally {
      toast.dismiss(toastId)
      dispatch(setLoading(false))
    }
  }
}

// ================ verify Reset Token ================
export function verifyResetToken(token) {
  return async () => {
    try {
      const response = await apiConnector("GET", `${RESETPASSTOKEN_API.replace('reset-password-token', 'verify-reset-token')}/${token}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error("VERIFY TOKEN ERROR:", error)
      return { 
        success: false, 
        message: error.response?.data?.message || "Invalid or expired reset token" 
      }
    }
  }
}

// ================ reset Password ================
export function resetPassword(password, confirmPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Resetting password...")
    dispatch(setLoading(true))

    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log("RESETPASSWORD RESPONSE:", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success(response.data.message || "Password reset successfully!")
      
      // Clear any stored auth data
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate("/login")
      }, 1500)
      
    } catch (error) {
      console.error("RESETPASSWORD ERROR:", error)
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Show password requirement errors
          errorData.errors.forEach(err => toast.error(err))
        } else {
          toast.error(errorData.message || "Invalid password requirements")
        }
      } else if (error.response?.status === 401) {
        toast.error("Reset token has expired. Please request a new password reset.")
        setTimeout(() => {
          navigate("/forgot-password")
        }, 2000)
      } else {
        toast.error(error.response?.data?.message || "Failed to reset password")
      }
    } finally {
      toast.dismiss(toastId)
      dispatch(setLoading(false))
    }
  }
}


// ================ Logout ================
export function logout(navigate) {
  return (dispatch) => {
    dispatch(clearAuth())
    dispatch(setProfileUser(null))
    dispatch(resetCart())
    toast.success("Logged Out")
    navigate("/")
  }
}
