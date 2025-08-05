import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { useSelector } from "react-redux"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { RxDropdownMenu } from "react-icons/rx"

import { createSection, updateSection, deleteSection, createSubSection, updateSubSection, deleteSubSection, getFullDetailsOfCourse } from "../../../services/operations/courseDetailsAPI"
import ConfirmationModal from "../../../components/common/ConfirmationModal"
import AdminSubSectionModal from "./AdminSubSectionModal"

export default function AdminCourseBuilder({ course, onCourseUpdate }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const { token } = useSelector((state) => state.auth)
  
  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState(null)
  const [courseData, setCourseData] = useState(course)
  const [originalCourseData, setOriginalCourseData] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSavingAll, setIsSavingAll] = useState(false)
  
  // States for SubSection Modal
  const [addSubSection, setAddSubsection] = useState(null)
  const [viewSubSection, setViewSubSection] = useState(null)
  const [editSubSection, setEditSubSection] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)

  // Fetch full course details with sections and subsections
  useEffect(() => {
    const fetchFullCourseDetails = async () => {
      if (course?._id && token) {
        try {
          setLoading(true)
          console.log("Fetching course details for course ID:", course._id)
          const fullCourseDetails = await getFullDetailsOfCourse(course._id, token)
          console.log("API Response:", fullCourseDetails)
          
          if (fullCourseDetails) {
            // Handle different response structures
            let courseData;
            if (fullCourseDetails.data && fullCourseDetails.data.courseDetails) {
              courseData = fullCourseDetails.data.courseDetails;
            } else if (fullCourseDetails.courseDetails) {
              courseData = fullCourseDetails.courseDetails;
            } else if (fullCourseDetails.data) {
              courseData = fullCourseDetails.data;
            } else {
              courseData = fullCourseDetails;
            }
            
            console.log("Processed course data:", courseData)
            console.log("Course content:", courseData.courseContent)
            
            setCourseData(courseData)
            setOriginalCourseData(JSON.parse(JSON.stringify(courseData))) // Deep copy for comparison
            setHasUnsavedChanges(false)
          } else {
            console.log("No course details returned, using original course data")
            setCourseData(course)
            setOriginalCourseData(JSON.parse(JSON.stringify(course)))
          }
        } catch (error) {
          console.error("Error fetching full course details:", error)
          console.error("Error details:", error.response?.data || error.message)
          setCourseData(course)
          setOriginalCourseData(JSON.parse(JSON.stringify(course)))
        } finally {
          setLoading(false)
        }
      } else {
        console.log("No course ID or token, using original course data")
        setCourseData(course)
        setOriginalCourseData(JSON.parse(JSON.stringify(course)))
        setLoading(false)
      }
    }

    fetchFullCourseDetails()
  }, [course, token])

  // Check for unsaved changes whenever courseData changes
  useEffect(() => {
    if (originalCourseData && courseData) {
      const hasChanges = JSON.stringify(originalCourseData.courseContent) !== JSON.stringify(courseData.courseContent)
      setHasUnsavedChanges(hasChanges)
    }
  }, [courseData, originalCourseData])

  // Handle form submission for section creation/update (local state only)
  const onSubmit = async (data) => {
    setLoading(true)

    try {
      if (editSectionName) {
        // Update section name locally
        const updatedCourseContent = courseData.courseContent.map((section) =>
          section._id === editSectionName 
            ? { ...section, sectionName: data.sectionName }
            : section
        )
        const updatedCourse = { ...courseData, courseContent: updatedCourseContent }
        setCourseData(updatedCourse)
        setEditSectionName(null)
        setValue("sectionName", "")
        // Remove toast - section name change is visible in UI
      } else {
        // Create new section locally
        const newSection = {
          _id: `temp_${Date.now()}`, // Temporary ID
          sectionName: data.sectionName,
          subSection: [],
          isNew: true // Flag to identify new sections
        }
        const updatedCourse = { 
          ...courseData, 
          courseContent: [...courseData.courseContent, newSection] 
        }
        setCourseData(updatedCourse)
        setValue("sectionName", "")
        // Remove toast - section addition is visible in UI
      }
    } catch (error) {
      console.error("Error with section operation:", error)
      toast.error("Failed to update section")
    } finally {
      setLoading(false)
    }
  }

  // Cancel edit mode
  const cancelEdit = () => {
    setEditSectionName(null)
    setValue("sectionName", "")
  }

  // Handle edit section name
  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit()
      return
    }
    setEditSectionName(sectionId)
    setValue("sectionName", sectionName)
  }

  // Delete Section (local state only)
  const handleDeleteSection = (sectionId) => {
    try {
      const updatedCourseContent = courseData.courseContent.filter(
        section => section._id !== sectionId
      )
      const updatedCourse = { ...courseData, courseContent: updatedCourseContent }
      setCourseData(updatedCourse)
      // Remove toast - section removal is visible in UI
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error("Failed to remove section")
    }
    setConfirmationModal(null)
  }

  // Delete SubSection (local state only)
  const handleDeleteSubSection = (subSectionId, sectionId) => {
    try {
      const updatedCourseContent = courseData.courseContent.map((section) =>
        section._id === sectionId 
          ? { 
              ...section, 
              subSection: section.subSection.filter(sub => sub._id !== subSectionId)
            }
          : section
      )
      const updatedCourse = { ...courseData, courseContent: updatedCourseContent }
      setCourseData(updatedCourse)
      // Remove toast - lecture removal is visible in UI
    } catch (error) {
      console.error("Error deleting subsection:", error)
      toast.error("Failed to remove lecture")
    }
    setConfirmationModal(null)
  }

  // Handle SubSection Modal Close and Update (local state only)
  const handleSubSectionUpdate = (updatedSubSection, sectionId, isNew = false) => {
    console.log("🔄 Handling subsection update:", {
      sectionId,
      isNew,
      title: updatedSubSection.title,
      hasVideoFile: !!updatedSubSection.videoFile,
      hasVideoUrlDirect: !!updatedSubSection.videoUrlDirect,
      videoFile: updatedSubSection.videoFile ? {
        name: updatedSubSection.videoFile.name,
        size: updatedSubSection.videoFile.size,
        type: updatedSubSection.videoFile.type
      } : null,
      videoUrlDirect: updatedSubSection.videoUrlDirect
    })
    
    const updatedCourseContent = courseData.courseContent.map((section) => {
      if (section._id === sectionId) {
        if (isNew) {
          // Add new subsection
          const newSubSection = {
            ...updatedSubSection,
            _id: `temp_sub_${Date.now()}`,
            isNew: true
          }
          console.log("📝 Adding new subsection to local state:", newSubSection)
          return {
            ...section,
            subSection: [...section.subSection, newSubSection]
          }
        } else {
          // Update existing subsection
          console.log("📝 Updating existing subsection in local state")
          return {
            ...section,
            subSection: section.subSection.map(sub => 
              sub._id === updatedSubSection._id ? { ...updatedSubSection, isModified: true } : sub
            )
          }
        }
      }
      return section
    })
    
    const updatedCourse = { ...courseData, courseContent: updatedCourseContent }
    setCourseData(updatedCourse)
    setHasUnsavedChanges(true) // Explicitly set unsaved changes
    
    console.log("✅ Local state updated successfully")
  }

  // Save all changes to database
  const saveAllChanges = async () => {
    setIsSavingAll(true)
    
    try {
      console.log("🔄 Starting save all changes process...")
      let hasErrors = false
      let errorMessages = []

      // 1. Handle new sections
      for (const section of courseData.courseContent) {
        if (section.isNew) {
          try {
            console.log("Creating new section:", section.sectionName)
            const result = await createSection({
              sectionName: section.sectionName,
              courseId: courseData._id,
            }, token)
            
            console.log("Section creation result:", result)
            console.log("🔍 Section creation result structure:", {
              hasResult: !!result,
              hasUpdatedCourseDetails: !!(result && result.updatedCourseDetails),
              resultKeys: result ? Object.keys(result) : [],
              resultType: typeof result
            })
            
            // The result might be the updated course directly, not wrapped in updatedCourseDetails
            let updatedCourse = null;
            if (result && result.updatedCourseDetails) {
              updatedCourse = result.updatedCourseDetails;
            } else if (result && result.courseContent) {
              updatedCourse = result;
            } else if (result && result._id) {
              updatedCourse = result;
            }
            
            console.log("🔍 Updated course structure:", {
              hasUpdatedCourse: !!updatedCourse,
              courseId: updatedCourse?._id,
              courseName: updatedCourse?.courseName,
              courseContentLength: updatedCourse?.courseContent?.length || 0
            })
            
            if (updatedCourse && updatedCourse.courseContent) {
              // Find the newly created section from the updated course content
              const newSection = updatedCourse.courseContent.find(s => s.sectionName === section.sectionName)
              console.log("🔍 Found newly created section:", {
                sectionId: newSection?._id,
                sectionName: newSection?.sectionName,
                hasNewSection: !!newSection
              })
              
              console.log("🔍 Original section subsections:", {
                sectionName: section.sectionName,
                subSectionCount: section.subSection?.length || 0,
                subSections: section.subSection?.map(sub => ({
                  title: sub.title,
                  isNew: sub.isNew,
                  hasVideoFile: !!sub.videoFile
                })) || []
              })
              
              if (newSection) {
                // Handle new subsections in this new section
                console.log("🔄 Processing subsections for new section...")
                for (const subSection of section.subSection) {
                  if (subSection.isNew) {
                    try {
                      console.log("🔄 Creating new subsection in new section:", {
                        sectionId: newSection._id,
                        title: subSection.title,
                        description: subSection.description,
                        hasVideoFile: !!subSection.videoFile,
                        hasVideoUrlDirect: !!subSection.videoUrlDirect,
                        videoFileName: subSection.videoFile ? subSection.videoFile.name : 'No file',
                        videoFileSize: subSection.videoFile ? (subSection.videoFile.size / (1024 * 1024)).toFixed(2) + 'MB' : 'No file'
                      })
                      
                      // Prepare FormData for createSubSection to handle file uploads
                      const subSectionFormData = new FormData()
                      subSectionFormData.append('sectionId', newSection._id)
                      subSectionFormData.append('title', subSection.title)
                      subSectionFormData.append('description', subSection.description)
                      
                      // Handle video - either file or direct URL
                      if (subSection.videoFile) {
                        console.log("🚀 Adding video file for upload:", subSection.videoFile.name)
                        subSectionFormData.append('video', subSection.videoFile)
                      } else if (subSection.videoUrlDirect) {
                        console.log("Using existing video URL:", subSection.videoUrlDirect)
                        subSectionFormData.append('videoUrl', subSection.videoUrlDirect)
                      }
                      
                      if (subSection.quiz) {
                        subSectionFormData.append('quiz', subSection.quiz._id || subSection.quiz)
                      }
                      
                      console.log("🚀 About to call createSubSection API...")
                      const subSectionResult = await createSubSection(subSectionFormData, token)
                      console.log("✅ Subsection creation result:", subSectionResult)
                    } catch (subError) {
                      console.error("❌ Error creating subsection in new section:", subError)
                      hasErrors = true
                      errorMessages.push(`Failed to create lecture "${subSection.title}": ${subError.message}`)
                    }
                  }
                }
              }
            }
          } catch (sectionError) {
            console.error("Error creating section:", sectionError)
            hasErrors = true
            errorMessages.push(`Failed to create section "${section.sectionName}": ${sectionError.message}`)
          }
        }
      }

      // 2. Handle section updates
      for (const section of courseData.courseContent) {
        if (!section.isNew) {
          const originalSection = originalCourseData.courseContent.find(s => s._id === section._id)
          if (originalSection && originalSection.sectionName !== section.sectionName) {
            try {
              console.log("Updating section name:", section.sectionName)
              await updateSection({
                sectionName: section.sectionName,
                sectionId: section._id,
                courseId: courseData._id,
              }, token)
            } catch (updateError) {
              console.error("Error updating section:", updateError)
              hasErrors = true
              errorMessages.push(`Failed to update section "${section.sectionName}": ${updateError.message}`)
            }
          }
          
          // Handle subsection changes in existing sections
          for (const subSection of section.subSection) {
            if (subSection.isNew) {
              try {
                console.log("Creating new subsection in existing section:", {
                  sectionId: section._id,
                  title: subSection.title,
                  description: subSection.description,
                  hasVideoFile: !!subSection.videoFile,
                  hasVideoUrlDirect: !!subSection.videoUrlDirect
                })
                
                // Prepare FormData for createSubSection to handle file uploads
                const subSectionFormData = new FormData()
                subSectionFormData.append('sectionId', section._id)
                subSectionFormData.append('title', subSection.title)
                subSectionFormData.append('description', subSection.description)
                
                // Handle video - either file or direct URL
                if (subSection.videoFile) {
                  console.log("🚀 Adding video file for upload:", subSection.videoFile.name)
                  subSectionFormData.append('video', subSection.videoFile)
                } else if (subSection.videoUrlDirect) {
                  console.log("Using existing video URL:", subSection.videoUrlDirect)
                  subSectionFormData.append('videoUrl', subSection.videoUrlDirect)
                }
                
                if (subSection.quiz) {
                  subSectionFormData.append('quiz', subSection.quiz._id || subSection.quiz)
                }
                
                const subSectionResult = await createSubSection(subSectionFormData, token)
                console.log("Subsection creation result:", subSectionResult)
              } catch (subError) {
                console.error("Error creating subsection:", subError)
                hasErrors = true
                errorMessages.push(`Failed to create lecture "${subSection.title}": ${subError.message}`)
              }
            } else if (subSection.isModified) {
              try {
                console.log("Updating subsection:", {
                  sectionId: section._id,
                  subSectionId: subSection._id,
                  title: subSection.title,
                  description: subSection.description,
                  hasVideoFile: !!subSection.videoFile,
                  hasVideoUrlDirect: !!subSection.videoUrlDirect
                })
                
                // Prepare FormData for updateSubSection to handle file uploads
                const updateFormData = new FormData()
                updateFormData.append('sectionId', section._id)
                updateFormData.append('subSectionId', subSection._id)
                updateFormData.append('title', subSection.title)
                updateFormData.append('description', subSection.description)
                
                // Handle video - either file or direct URL
                if (subSection.videoFile) {
                  console.log("🚀 Adding video file for update:", subSection.videoFile.name)
                  updateFormData.append('videoFile', subSection.videoFile)
                } else if (subSection.videoUrlDirect) {
                  console.log("Using existing video URL:", subSection.videoUrlDirect)
                  updateFormData.append('videoUrl', subSection.videoUrlDirect)
                }
                
                if (subSection.quiz) {
                  updateFormData.append('quiz', subSection.quiz._id || subSection.quiz)
                }
                
                const updateResult = await updateSubSection(updateFormData, token)
                console.log("Subsection update result:", updateResult)
              } catch (updateError) {
                console.error("Error updating subsection:", updateError)
                hasErrors = true
                errorMessages.push(`Failed to update lecture "${subSection.title}": ${updateError.message}`)
              }
            }
          }
        }
      }

      // 3. Handle deleted sections
      for (const originalSection of originalCourseData.courseContent) {
        const stillExists = courseData.courseContent.find(s => s._id === originalSection._id)
        if (!stillExists) {
          try {
            console.log("Deleting section:", originalSection.sectionName)
            await deleteSection({
              sectionId: originalSection._id,
              courseId: courseData._id,
            }, token)
          } catch (deleteError) {
            console.error("Error deleting section:", deleteError)
            hasErrors = true
            errorMessages.push(`Failed to delete section "${originalSection.sectionName}": ${deleteError.message}`)
          }
        }
      }

      // 4. Handle deleted subsections
      for (const originalSection of originalCourseData.courseContent) {
        const currentSection = courseData.courseContent.find(s => s._id === originalSection._id)
        if (currentSection) {
          for (const originalSubSection of originalSection.subSection || []) {
            const stillExists = currentSection.subSection.find(s => s._id === originalSubSection._id)
            if (!stillExists) {
              try {
                console.log("Deleting subsection:", originalSubSection.title)
                await deleteSubSection({
                  subSectionId: originalSubSection._id,
                  sectionId: originalSection._id,
                }, token)
              } catch (deleteError) {
                console.error("Error deleting subsection:", deleteError)
                hasErrors = true
                errorMessages.push(`Failed to delete lecture "${originalSubSection.title}": ${deleteError.message}`)
              }
            }
          }
        }
      }

      // Refresh course data
      console.log("🔄 Refreshing course data...")
      try {
        const result = await getFullDetailsOfCourse(courseData._id, token)
        console.log("Full course details result:", result)
        
        if (result) {
          // Handle different response structures
          let refreshedCourseData;
          if (result.data && result.data.courseDetails) {
            refreshedCourseData = result.data.courseDetails;
          } else if (result.courseDetails) {
            refreshedCourseData = result.courseDetails;
          } else if (result.data) {
            refreshedCourseData = result.data;
          } else {
            refreshedCourseData = result;
          }
          
          console.log("Processed refreshed course data:", refreshedCourseData)
          
          if (refreshedCourseData && refreshedCourseData._id) {
            setCourseData(refreshedCourseData)
            setOriginalCourseData(JSON.parse(JSON.stringify(refreshedCourseData)))
            onCourseUpdate(refreshedCourseData)
            setHasUnsavedChanges(false)
            
            if (hasErrors) {
              toast.error(`Some changes failed to save:\n${errorMessages.join('\n')}`)
            } else {
              toast.success("All changes saved successfully!")
            }
          } else {
            console.error("Invalid course data structure after refresh:", refreshedCourseData)
            toast.error("Changes saved but failed to refresh course data. Please reload the page.")
          }
        } else {
          console.error("No result from getFullDetailsOfCourse")
          toast.error("Changes may have been saved but failed to refresh course data. Please reload the page.")
        }
      } catch (refreshError) {
        console.error("Error refreshing course data:", refreshError)
        toast.error("Changes may have been saved but failed to refresh course data. Please reload the page.")
      }

    } catch (error) {
      console.error("Critical error in saveAllChanges:", error)
      toast.error("Failed to save changes. Please try again.")
    } finally {
      setIsSavingAll(false)
    }
  }

  // Discard all changes
  const discardChanges = () => {
    setConfirmationModal({
      text1: "Discard Changes?",
      text2: "All unsaved changes will be lost. This action cannot be undone.",
      btn1Text: "Discard",
      btn2Text: "Cancel",
      btn1Handler: () => {
        setCourseData(JSON.parse(JSON.stringify(originalCourseData)))
        setHasUnsavedChanges(false)
        // Remove toast - changes being discarded is obvious from UI reset
        setConfirmationModal(null)
      },
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  return (
    <div className="space-y-8 rounded-2xl border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Section Name */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">
            Section Name <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })}
            className="form-style w-full"
          />
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>

        {/* Create/Edit Section Button */}
        <div className="flex items-end gap-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md border border-yellow-50 bg-transparent py-2 px-4 text-yellow-50 hover:bg-yellow-50 hover:text-richblack-900 transition-all duration-200"
          >
            <IoAddCircleOutline size={20} />
            {editSectionName ? "Edit Section Name" : "Create Section"}
          </button>
          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline hover:text-richblack-5"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-50"></div>
          <span className="ml-2 text-richblack-5">Loading course content...</span>
        </div>
      )}

      {/* Nested View of Sections and SubSections */}
      {!loading && courseData?.courseContent?.length > 0 && (
        <div className="rounded-2xl bg-richblack-700 p-6 px-8">
          {courseData.courseContent.map((section) => (
            <details key={section._id} open>
              <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
                <div className="flex items-center gap-x-3">
                  <RxDropdownMenu className="text-2xl text-richblack-50" />
                  <p className="font-semibold text-richblack-50">
                    {section.sectionName}
                    {section.isNew && <span className="ml-2 text-xs text-yellow-400">(Unsaved)</span>}
                  </p>
                </div>

                <div className="flex items-center gap-x-3">
                  <button
                    onClick={() =>
                      handleChangeEditSectionName(section._id, section.sectionName)
                    }
                    className="text-richblack-300 hover:text-richblack-5"
                  >
                    <MdEdit className="text-xl" />
                  </button>

                  <button
                    onClick={() =>
                      setConfirmationModal({
                        text1: "Delete this Section?",
                        text2: "All the lectures in this section will be deleted",
                        btn1Text: "Delete",
                        btn2Text: "Cancel",
                        btn1Handler: () => handleDeleteSection(section._id),
                        btn2Handler: () => setConfirmationModal(null),
                      })
                    }
                    className="text-richblack-300 hover:text-red-400"
                  >
                    <RiDeleteBin6Line className="text-xl" />
                  </button>

                  <span className="font-medium text-richblack-300">|</span>
                  <AiFillCaretDown className="text-xl text-richblack-300" />
                </div>
              </summary>

              <div className="px-6 pb-4">
                {/* Render All Sub Sections Within a Section */}
                {section.subSection?.map((data) => (
                  <div
                    key={data?._id}
                    onClick={() => setViewSubSection(data)}
                    className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2 hover:bg-richblack-600 rounded px-2"
                  >
                    <div className="flex items-center gap-x-3 py-2">
                      <RxDropdownMenu className="text-2xl text-richblack-50" />
                      <p className="font-semibold text-richblack-50">
                        {data.title}
                        {data.isNew && <span className="ml-2 text-xs text-yellow-400">(Unsaved)</span>}
                      </p>
                    </div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3"
                    >
                      <button
                        onClick={() =>
                          setEditSubSection({ ...data, sectionId: section._id })
                        }
                        className="text-richblack-300 hover:text-richblack-5"
                      >
                        <MdEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmationModal({
                            text1: "Delete this Lecture?",
                            text2: "This lecture will be deleted permanently",
                            btn1Text: "Delete",
                            btn2Text: "Cancel",
                            btn1Handler: () =>
                              handleDeleteSubSection(data._id, section._id),
                            btn2Handler: () => setConfirmationModal(null),
                          })
                        }
                        className="text-richblack-300 hover:text-red-400"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Lecture to Section */}
                <button
                  onClick={() => setAddSubsection(section._id)}
                  className="mt-3 flex items-center gap-x-1 text-yellow-50 hover:text-yellow-25 transition-colors"
                >
                  <FaPlus className="text-lg" />
                  <p>Add Lecture</p>
                </button>
              </div>
            </details>
          ))}
        </div>
      )}

      {/* No Content Message */}
      {!loading && (!courseData?.courseContent || courseData.courseContent.length === 0) && (
        <div className="text-center py-8 text-richblack-300">
          <p>No sections found. Create your first section to get started.</p>
        </div>
      )}

      {/* Save/Discard Changes Buttons */}
      {hasUnsavedChanges && (
        <div className="flex justify-end gap-x-4 mt-6 border-t border-richblack-700 pt-4">
          <button
            onClick={discardChanges}
            className="rounded-md bg-richblack-700 px-4 py-2 text-richblack-50 hover:bg-richblack-600"
          >
            Discard Changes
          </button>
          <button
            onClick={saveAllChanges}
            disabled={isSavingAll}
            className={`rounded-md px-4 py-2 text-richblack-900 ${
              isSavingAll 
                ? 'bg-yellow-100 cursor-not-allowed'
                : 'bg-yellow-50 hover:bg-yellow-100'
            }`}
          >
            {isSavingAll ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      )}

      {/* SubSection Modals */}
      {addSubSection && (
        <AdminSubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubsection}
          add={true}
          onUpdate={(updatedSubSection) => {
            handleSubSectionUpdate(updatedSubSection, addSubSection, true)
          }}
        />
      )}
      {viewSubSection && (
        <AdminSubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
          onUpdate={() => {}} // View mode doesn't need updates
        />
      )}
      {editSubSection && (
        <AdminSubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
          onUpdate={(updatedSubSection) => {
            handleSubSectionUpdate(updatedSubSection, editSubSection.sectionId, false)
          }}
        />
      )}

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          modalData={confirmationModal}
          closeModal={() => setConfirmationModal(null)}
        />
      )}
    </div>
  )
}
