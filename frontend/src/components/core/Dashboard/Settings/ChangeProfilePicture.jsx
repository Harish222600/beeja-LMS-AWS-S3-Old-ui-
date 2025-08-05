import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"

import { updateUserProfileImage } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"
import Img from './../../../common/Img';



export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    // console.log(file)
    if (file) {
      // Validate file size (5MB limit)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_SIZE) {
        toast.error(`Profile image must be 5MB or less. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file type - Allow any image type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type. Please upload an image file.');
        e.target.value = ''; // Clear the input
        return;
      }

      setProfileImage(file)
      previewFile(file)
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const handleFileUpload = () => {
    try {
      // console.log("uploading...")
      setLoading(true)
      const formData = new FormData()
      formData.append("profileImage", profileImage)

      dispatch(updateUserProfileImage(token, formData)).then(() => {
        setLoading(false)
        // Clear the preview and selected file after successful upload
        setProfileImage(null)
        setPreviewSource(null)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Additional logging to debug the issue
        console.log("Profile image upload completed successfully");
        console.log("Current user from Redux after upload:", user);
        
        // Force a small delay to ensure Redux state has updated
        setTimeout(() => {
          console.log("User state after timeout:", user);
        }, 100);
      }).catch((error) => {
        console.error("Profile image upload failed:", error);
        setLoading(false)
      })
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profileImage) {
      previewFile(profileImage)
    }
  }, [profileImage])

  // Monitor user changes to debug the issue
  useEffect(() => {
    console.log("👤 User state changed in ChangeProfilePicture:", user);
    console.log("👤 User image URL:", user?.image);
  }, [user])


  return (
    <>
      <div className="flex items-center justify-between rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-3 sm:px-12 text-richblack-5">
        <div className="flex items-center gap-x-4">
          <Img
            src={previewSource || user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />

          <div className="space-y-2">
            <p className="font-medium">Change Profile Picture</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              <button
                onClick={handleClick}
                disabled={loading}
                className="cursor-pointer rounded-md py-2 px-5 font-semibold bg-richblack-200 text-richblack-900 hover:bg-richblack-900 hover:text-richblack-200 duration-300"
              >
                Select
              </button>

              <IconBtn
                text={loading ? "Uploading..." : "Upload"}
                onClick={handleFileUpload}
              >
                {!loading && (
                  <FiUpload className="text-lg" />
                )}
              </IconBtn>
              
            </div>
          </div>
        </div>
      </div>
    </>
  )
}