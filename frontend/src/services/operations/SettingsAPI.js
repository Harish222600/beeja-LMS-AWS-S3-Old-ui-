import { toast } from "react-hot-toast"

import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { settingsEndpoints } from "../apis"
import { logout } from "./authAPI"

const {
  UPDATE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
} = settingsEndpoints



// ================ update User Profile Image  ================
export function updateUserProfileImage(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")

    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      )
      console.log("UPDATE_DISPLAY_PICTURE_API API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Display Picture Updated Successfully")
      
      // Get the complete updated user data from the backend response
      const backendUserData = response.data.data;
      console.log("Backend response - Complete user data:", backendUserData);
      
      // Add cache-busting parameter to the image URL to force reload
      const imageWithCacheBust = backendUserData.image + '?v=' + Date.now();
      const finalUserData = {
        ...backendUserData,
        image: imageWithCacheBust
      };
      
      console.log("Final user data with cache-busting:", finalUserData);
      
      // Update Redux store with the complete user data from backend
      console.log("🔄 Updating Redux store with new user data");
      dispatch(setUser(finalUserData));

      // Update localStorage - this is crucial for persistence across page refreshes
      console.log("💾 Updating localStorage with new user data");
      localStorage.setItem("user", JSON.stringify(finalUserData));
      
      // Force all image elements to reload by dispatching custom events
      console.log("📡 Dispatching profileImageUpdated event");
      window.dispatchEvent(new CustomEvent('profileImageUpdated', { 
        detail: { 
          newImageUrl: imageWithCacheBust,
          originalUrl: backendUserData.image,
          userId: backendUserData._id,
          userData: finalUserData
        } 
      }));
      
      // Also dispatch a storage event to trigger updates in other components
      console.log("📡 Dispatching storage event");
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(finalUserData),
        url: window.location.href
      }));
      
      console.log("✅ Profile image updated successfully without page reload");
      console.log("🔍 Current Redux state after update:", finalUserData);
    } catch (error) {
      console.log("UPDATE_DISPLAY_PICTURE_API API ERROR............", error)
      
      // Show specific error message from backend if available
      let errorMessage = "Could Not Update Profile Picture";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error types with user-friendly messages
      if (errorMessage.includes('5MB') || errorMessage.includes('FILE_SIZE_EXCEEDED')) {
        toast.error("Profile image must be 5MB or less. Please choose a smaller image.");
      } else if (errorMessage.includes('Invalid file type') || errorMessage.includes('INVALID_FILE_TYPE')) {
        toast.error("Invalid file type. Please upload an image file.");
      } else {
        toast.error(errorMessage);
      }
    }
    toast.dismiss(toastId)
  }
}

// ================ update Profile  ================
export function updateProfile(token, formData) {
  return async (dispatch) => {
    // console.log('This is formData for updated profile -> ', formData)
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
        Authorization: `Bearer ${token}`,
      })
      console.log("UPDATE_PROFILE_API API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      const userImage = response.data?.updatedUserDetails?.image
        ? response.data.updatedUserDetails?.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.updatedUserDetails.firstName} ${response.data.updatedUserDetails.lastName}`

      dispatch(setUser({ ...response.data.updatedUserDetails, image: userImage }))

   
      // console.log('DATA = ', data)
      localStorage.setItem("user", JSON.stringify({ ...response.data.updatedUserDetails, image: userImage }));
      toast.success("Profile Updated Successfully")
    } catch (error) {
      console.log("UPDATE_PROFILE_API API ERROR............", error)
      toast.error("Could Not Update Profile")
    }
    toast.dismiss(toastId)
  }
}


// ================ change Password  ================
export async function changePassword(token, formData) {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CHANGE_PASSWORD_API, formData, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CHANGE_PASSWORD_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    toast.success("Password Changed Successfully")
  } catch (error) {
    console.log("CHANGE_PASSWORD_API API ERROR............", error)
    toast.error(error.response.data.message)
  }
  toast.dismiss(toastId)
}

// ================ delete Profile ================
export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
        Authorization: `Bearer ${token}`,
      })
      console.log("DELETE_PROFILE_API API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Profile Deleted Successfully")
      dispatch(logout(navigate))
    } catch (error) {
      console.log("DELETE_PROFILE_API API ERROR............", error)
      toast.error("Could Not Delete Profile")
    }
    toast.dismiss(toastId)
  }
}