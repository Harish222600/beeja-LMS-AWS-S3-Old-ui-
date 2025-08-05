import { useDispatch, useSelector } from "react-redux"
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import { useState } from "react"
import { FaCheck, FaStar } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../../../../services/formatDate"
import { deleteCourse, fetchInstructorCourses, } from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import Img from './../../../common/Img';
import toast from 'react-hot-toast'





export default function CoursesTable({ courses, setCourses, loading, setLoading }) {

  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  const TRUNCATE_LENGTH = 25

  // Get course duration from the API response
  const getCourseDuration = (course) => {
    return course.totalDuration || "0s"
  }

  // delete course
  const handleCourseDelete = async (courseId) => {
    try {
      setLoading(true)
      const toastId = toast.loading('Deleting course...');
      
      await deleteCourse({ courseId: courseId }, token)
      const result = await fetchInstructorCourses(token)
      
      if (result) {
        setCourses(result)
        toast.success("Course deleted successfully")
      }
      
      toast.dismiss(toastId)
    } catch (error) {
      console.log("Course deletion error:", error)
      toast.error("Failed to delete course")
    } finally {
      setLoading(false)
    }
  }


  // Loading Skeleton
  const skItem = () => {
    return (
      <div className="flex flex-col md:flex-row border-b border-richblack-800 px-4 md:px-6 py-4 md:py-8 w-full">
        <div className="flex flex-col md:flex-row flex-1 gap-4 md:gap-x-4">
          <div className='h-[148px] w-full md:min-w-[270px] md:max-w-[270px] rounded-xl skeleton'></div>

          <div className="flex flex-col w-full md:w-[40%]">
            <p className="h-5 w-[70%] md:w-[50%] rounded-xl skeleton"></p>
            <p className="h-20 w-[90%] md:w-[60%] rounded-xl mt-3 skeleton"></p>

            <p className="h-2 w-[40%] md:w-[20%] rounded-xl skeleton mt-3"></p>
            <p className="h-2 w-[40%] md:w-[20%] rounded-xl skeleton mt-2"></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Table className="rounded-2xl border border-richblack-800 w-full">
        {/* heading */}
        <Thead>
          <Tr className="flex flex-wrap md:flex-nowrap gap-4 md:gap-x-10 rounded-t-3xl border-b border-b-richblack-800 px-4 md:px-6 py-2">
            <Th className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">
              Courses
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Duration
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Price
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Rating
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100">
              Actions
            </Th>
          </Tr>
        </Thead>


        {/* loading Skeleton */}
        {loading && <div >
          {skItem()}
          {skItem()}
          {skItem()}
        </div>
        }

        <Tbody>
          {!loading && courses?.length === 0 ? (
            <Tr>
              <Td className="py-10 text-center text-2xl font-medium text-richblack-100">
                No courses found
              </Td>
            </Tr>
          )
            : (
              courses?.map((course) => (
                <Tr
                  key={course._id}
                  className="flex flex-col md:flex-row gap-4 md:gap-x-10 border-b border-richblack-800 px-4 md:px-6 py-4 md:py-8"
                >
                  <Td className="flex flex-col md:flex-row flex-1 gap-4 md:gap-x-4 relative">
                    {/* course Thumbnail */}
                    <Img
                      src={course?.thumbnail}
                      alt={course?.courseName}
                      className="h-[148px] w-full md:min-w-[270px] md:max-w-[270px] rounded-lg object-cover"
                    />

                    <div className="flex flex-col">
                      <p className="text-lg font-semibold text-richblack-5 capitalize">{course.courseName}</p>
                      <p className="text-xs text-richblack-300 ">
                        {course.courseDescription.split(" ").length > TRUNCATE_LENGTH
                          ? course.courseDescription
                            .split(" ")
                            .slice(0, TRUNCATE_LENGTH)
                            .join(" ") + "..."
                          : course.courseDescription}
                      </p>

                      {/* created At */}
                      <p className="text-[12px] text-richblack-100 mt-4">
                        Created: {formatDate(course?.createdAt)}
                      </p>

                      {/* updated At */}
                      <p className="text-[12px] text-richblack-100 ">
                        updated: {formatDate(course?.updatedAt)}
                      </p>

                      {/* course status */}
                      {course.status === COURSE_STATUS.DRAFT ? (
                        <p className="mt-2 flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
                          <HiClock size={14} />
                          Drafted
                        </p>)
                        :
                        (<div className="mt-2 flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
                          <p className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
                            <FaCheck size={8} />
                          </p>
                          Published
                        </div>
                        )}
                    </div>
                  </Td>

                  {/* Metadata section for mobile */}
                  <div className="flex flex-wrap md:hidden gap-4 items-center justify-between mt-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-richblack-100">Duration:</span>
                      <span>{getCourseDuration(course)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-richblack-100">Price:</span>
                      <span>{course.courseType === 'Free' ? 'Free' : `₹${course.price}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-50">{course?.averageRating?.toFixed(1) || 0}</span>
                      <FaStar className="text-yellow-50" />
                      <span className="text-richblack-300">({course?.totalRatings || 0})</span>
                    </div>
                  </div>

                  {/* Desktop view metadata */}
                  <Td className="hidden md:table-cell text-sm font-medium text-richblack-100">{getCourseDuration(course)}</Td>
                  <Td className="hidden md:table-cell text-sm font-medium text-richblack-100">
                    {course.courseType === 'Free' ? 'Free' : `₹${course.price}`}
                  </Td>
                  <Td className="hidden md:table-cell text-sm font-medium text-richblack-100">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-50">{course?.averageRating?.toFixed(1) || 0}</span>
                      <FaStar className="text-yellow-50" />
                      <span className="text-richblack-300">({course?.totalRatings || 0})</span>
                    </div>
                  </Td>

                  <Td className="flex justify-center md:justify-start text-sm font-medium text-richblack-100">
                    {/* Edit button */}
                    <button
                      disabled={loading}
                      onClick={() => { navigate(`/dashboard/edit-course/${course._id}`) }}
                      title="Edit"
                      className="px-2 transition-all duration-200 hover:scale-110 hover:text-caribbeangreen-300"
                    >
                      <FiEdit2 size={20} />
                    </button>

                    {/* Delete button */}
                    <button
                      disabled={loading}
                      onClick={() => handleCourseDelete(course._id)}
                      title="Delete"
                      className="px-1 transition-all duration-200 hover:scale-110 hover:text-[#ff0000]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-red-500"/>
                      ) : (
                        <RiDeleteBin6Line size={20} />
                      )}
                    </button>
                  </Td>
                </Tr>
              ))
            )}
        </Tbody>
      </Table>
    </>
  )
}
