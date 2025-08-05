import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import { createSection, updateSection, createSubSection, updateSubSection, deleteSubSection, deleteSection, getFullDetailsOfCourse } from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse, setStep, } from "../../../../../slices/courseSlice"

import IconBtn from "../../../../common/IconBtn"
import AdminCourseBuilder from "../../../../../pages/Admin/components/AdminCourseBuilder"




export default function CourseBuilderForm() {
  const { course } = useSelector((state) => state.course)
  const dispatch = useDispatch()

  // Handle course update from AdminCourseBuilder
  const handleCourseUpdate = (updatedCourse) => {
    dispatch(setCourse(updatedCourse))
  }

  // go To Next
  const goToNext = () => {
    if (course.courseContent.length === 0) {
      toast.error("Please add atleast one section")
      return;
    }
    if (course.courseContent.some((section) => section.subSection.length === 0)) {
      toast.error("Please add atleast one lecture in each section")
      return;
    }

    // all set go ahead
    dispatch(setStep(3))
  }

  // go Back
  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }

  return (
    <div className="space-y-8">
      {/* Use AdminCourseBuilder for all users */}
      <AdminCourseBuilder course={course} onCourseUpdate={handleCourseUpdate} />

      {/* Next Prev Button */}
      <div className="flex justify-end gap-x-3">
        <button
          onClick={goBack}
          className={`rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
        >
          Back
        </button>

        {/* Next button */}
        <IconBtn text="Next" onClick={goToNext}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </div>
  )
}
