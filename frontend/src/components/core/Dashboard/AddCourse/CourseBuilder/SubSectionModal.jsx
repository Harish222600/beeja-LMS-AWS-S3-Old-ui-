import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"

export default function SubSectionModal({ modalData, setModalData, add = false, view = false, edit = false, }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)

  useEffect(() => {
    if (view || edit) {
      console.log("🎬 SubSectionModal Debug:", {
        mode: view ? 'view' : 'edit',
        modalData: modalData,
        subSectionId: modalData?._id,
        videoUrl: modalData?.videoUrl,
        title: modalData?.title
      })
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoUrl)
    }
  }, [])

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues()
    
    // Check if title or description changed
    const titleChanged = currentValues.lectureTitle !== modalData.title
    const descChanged = currentValues.lectureDesc !== modalData.description
    
    // Check if video changed - compare File object vs URL string
    const videoChanged = currentValues.lectureVideo instanceof File || 
                        (currentValues.lectureVideo && currentValues.lectureVideo !== modalData.videoUrl)
    
    console.log("Form update check:", {
      titleChanged,
      descChanged,
      videoChanged,
      currentVideo: currentValues.lectureVideo,
      originalVideo: modalData.videoUrl,
      videoType: typeof currentValues.lectureVideo
    })
    
    return titleChanged || descChanged || videoChanged
  }

  // handle the editing of subsection
  const handleEditSubsection = async () => {
    setLoading(true)
    
    try {
      const currentValues = getValues()
      const formData = new FormData()
      
      // Always append required fields
      formData.append("sectionId", modalData.sectionId)
      formData.append("subSectionId", modalData._id)
      
      // Check and append changed fields
      if (currentValues.lectureTitle !== modalData.title) {
        formData.append("title", currentValues.lectureTitle)
        console.log("Title updated:", currentValues.lectureTitle)
      }
      
      if (currentValues.lectureDesc !== modalData.description) {
        formData.append("description", currentValues.lectureDesc)
        console.log("Description updated:", currentValues.lectureDesc)
      }
      
      // Handle video update - support both File objects and direct upload URLs
      if (currentValues.lectureVideo instanceof File) {
        // Traditional file upload
        formData.append("videoFile", currentValues.lectureVideo)
        console.log("New video file uploaded:", {
          name: currentValues.lectureVideo.name,
          size: currentValues.lectureVideo.size,
          type: currentValues.lectureVideo.type
        })
      } else if (currentValues.lectureVideo && 
                 typeof currentValues.lectureVideo === 'string' && 
                 currentValues.lectureVideo !== modalData.videoUrl) {
        // Direct upload URL or changed URL
        formData.append("videoUrl", currentValues.lectureVideo)
        console.log("Video URL updated:", currentValues.lectureVideo)
      }
      
      // Log FormData contents for debugging
      console.log("FormData being sent:")
      for (let [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value)
      }
      
      const result = await updateSubSection(formData, token)
      if (result) {
        // update the structure of course
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData.sectionId ? result : section
        )
        const updatedCourse = { ...course, courseContent: updatedCourseContent }
        dispatch(setCourse(updatedCourse))
        toast.success("Lecture updated successfully!")
        setModalData(null)
      } else {
        toast.error("Failed to update lecture. Please try again.")
      }
    } catch (error) {
      console.error("Error updating subsection:", error)
      toast.error("Failed to update lecture. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    if (view) return

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        handleEditSubsection()
      }
      return
    }

    // Debug logging to see what data we're receiving
    console.log("🔍 SubSectionModal onSubmit - Raw form data:", {
      lectureTitle: data.lectureTitle,
      lectureDesc: data.lectureDesc,
      lectureVideo: data.lectureVideo,
      lectureVideoType: typeof data.lectureVideo,
      lectureVideoIsFile: data.lectureVideo instanceof File,
      modalData: modalData
    })

    // Validation check
    if (!data.lectureTitle || !data.lectureDesc) {
      toast.error("Title and description are required")
      return
    }

    if (!modalData) {
      toast.error("Section ID is missing")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Creating lecture...")
    
    try {
      const formData = new FormData()
      formData.append("sectionId", modalData)
      formData.append("title", data.lectureTitle)
      formData.append("description", data.lectureDesc)
      
      // Handle video - support both File objects (traditional upload) and URLs (direct upload)
      if (data.lectureVideo instanceof File) {
        // File object - add to FormData for server-side upload
        formData.append("video", data.lectureVideo)
        console.log("Creating subsection with video file:", {
          name: data.lectureVideo.name,
          size: data.lectureVideo.size,
          type: data.lectureVideo.type
        })
      } else if (data.lectureVideo && typeof data.lectureVideo === 'string' && data.lectureVideo.startsWith('http')) {
        // Direct upload URL - already uploaded
        formData.append("videoUrl", data.lectureVideo)
        console.log("Creating subsection with direct upload URL:", data.lectureVideo)
      } else if (data.lectureVideo) {
        // Handle other video data types
        console.log("Video data type:", typeof data.lectureVideo, data.lectureVideo)
        if (data.lectureVideo.startsWith && data.lectureVideo.startsWith('blob:')) {
          // This is a blob URL, we need the actual file
          console.warn("Received blob URL instead of File object or HTTP URL")
        }
      } else {
        console.log("Creating subsection without video")
      }

      // Log FormData contents for debugging
      console.log("FormData being sent for creation:")
      for (let [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value)
      }

      // Additional validation before API call
      if (!formData.get('sectionId') || !formData.get('title') || !formData.get('description')) {
        console.error('❌ FormData validation failed:', {
          sectionId: formData.get('sectionId'),
          title: formData.get('title'),
          description: formData.get('description')
        })
        toast.error('Form data is incomplete. Please check all fields.')
        return
      }

      console.log('🚀 About to call createSubSection API...')

      // Create subsection with timeout
      const timeoutDuration = 300000 // 5 minutes
      
      const subsectionResult = await Promise.race([
        createSubSection(formData, token),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), timeoutDuration)
        )
      ])

      console.log('✅ createSubSection API call completed:', subsectionResult)

      if (subsectionResult) {
        // Update course structure
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData ? subsectionResult : section
        )
        const updatedCourse = { ...course, courseContent: updatedCourseContent }
        dispatch(setCourse(updatedCourse))
        
        toast.success("Lecture created successfully!")
        setModalData(null)
      }
    } catch (error) {
      console.error("Error creating subsection:", error)
      if (error?.response?.status === 401) {
        toast.error("Session expired. Please login again.")
      } else if (error.message === 'Upload timeout') {
        toast.error("Upload timed out. Please try again with a smaller video file.")
      } else {
        toast.error(error?.response?.data?.message || "Failed to add lecture. Please try again.")
      }
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-4 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg bg-richblack-700 p-4 md:p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        
        {/* Modal Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-8 py-10"
        >
          {/* Lecture Video Upload */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
            subSectionId={(edit || view) && modalData?._id ? modalData._id : null}
          />
          
          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>
          
          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description{" "}
              {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              className="form-style resize-x-none min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Description is required
              </span>
            )}
          </div>

          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
                type="submit"
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
