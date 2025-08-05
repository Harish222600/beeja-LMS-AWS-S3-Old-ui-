import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BackgroundEffect from '../../../pages/BackgroundEffect'
import { getFreeCourses, requestCourseAccess, getUserAccessRequests } from '../../../services/operations/courseAccessAPI'
import { ACCOUNT_TYPE } from '../../../utils/constants'
import CourseCard from './CourseCard'
import { toast } from 'react-hot-toast'

export default function FreeCourses() {
  const { token, user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [freeCourses, setFreeCourses] = useState([])
  const [userRequests, setUserRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchFreeCourses()
    if (token) {
      fetchUserRequests()
    }
  }, [currentPage])

  const fetchFreeCourses = async () => {
    setLoading(true)
    const result = await getFreeCourses(currentPage)
    if (result?.data) {
      setFreeCourses(result.data)
      setTotalPages(result.pagination?.totalPages || 1)
    } else {
      setFreeCourses([])
      setTotalPages(1)
    }
    setLoading(false)
  }

  const fetchUserRequests = async () => {
    const result = await getUserAccessRequests(token)
    if (result) {
      setUserRequests(result)
    }
  }

  const handleRequestAccess = async (courseId, courseName) => {
    if (!courseId) {
      toast.error('Course information not available')
      return
    }

    if (!token) {
      toast.error('Please login to request access')
      return
    }

    const requestMessage = `I would like to request access to the course "${courseName}".`
    
    const result = await requestCourseAccess(
      { 
        courseId, 
        requestMessage 
      }, 
      `Bearer ${token}`
    )
    if (result) {
      fetchUserRequests() // Refresh user requests
    }
  }

  const getRequestStatus = (courseId) => {
    const request = userRequests.find(req => req?.course?._id === courseId)
    return request ? request.status : null
  }

  const isEnrolled = (courseId) => {
    return user?.courses?.includes(courseId)
  }

  return (
    <>
      {/* Background with Gradient and Particles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-0"
      >
        <BackgroundEffect />
      </motion.div>

      <div className="relative mx-auto w-11/12 max-w-maxContent py-8 sm:py-12 z-10">
      <div className="section_heading px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-richblack-5">Free Courses</h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg lg:text-xl text-richblack-200">
          Explore our collection of free courses. Request access to start learning!
        </p>
      </div>

      {loading ? (
        <div className="flex h-[calc(100vh-20rem)] items-center justify-center">
          <div className="spinner"></div>
        </div>
      ) : freeCourses.length === 0 ? (
        <p className="flex h-[calc(100vh-20rem)] items-center justify-center text-richblack-5 text-center px-4">
          No free courses available at the moment
        </p>
      ) : (
        <>
          <div className="my-6 sm:my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-0 place-items-center">
            {freeCourses.map((course) => {
              // Skip rendering if course doesn't have required data
              if (!course || !course._id) {
                return null;
              }

              const requestStatus = getRequestStatus(course._id)
              const enrolled = isEnrolled(course._id)
              
              return (
                <div key={course._id} className="relative">
                  <CourseCard course={course} />
                  
                  {/* Access Status Overlay - positioned at bottom of card */}
                  <div className="overlay-content absolute bottom-0 left-0 right-0 bg-richblack-900/90 backdrop-blur-sm p-3 rounded-b-xl">
                    <div className="flex items-center justify-between gap-2">
                      {/* Admin Role - Can manage all courses */}
                      {user?.accountType === ACCOUNT_TYPE.ADMIN ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/admin');
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-md"
                          disabled={!course._id}
                        >
                          Manage Course
                        </button>
                      ) : 
                      /* Instructor Role - Can manage only their own courses */
                      user?.accountType === ACCOUNT_TYPE.INSTRUCTOR ? (
                        course?.instructor?._id === user?._id ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            navigate('/dashboard/my-courses');
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-bold transition-colors shadow-md"
                            disabled={!course._id}
                          >
                            Manage Course
                          </button>
                        ) : (
                          <div className="w-full bg-richblack-700 text-richblack-200 px-4 py-2 rounded-md text-center">
                            <p className="text-xs">Course by {course?.instructor?.firstName} {course?.instructor?.lastName}</p>
                          </div>
                        )
                      ) : 
                      /* Student Role - Normal access flow */
                      enrolled ? (
                        <div className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md">
                          <span className="text-xs font-semibold">Enrolled</span>
                        </div>
                      ) : requestStatus ? (
                        <div className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
                          requestStatus === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : requestStatus === 'Approved'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            requestStatus === 'Pending'
                              ? 'bg-yellow-500'
                              : requestStatus === 'Approved'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs font-medium">{requestStatus}</span>
                        </div>
                      ) : (
                        <div className="w-full bg-richblack-700 text-richblack-200 px-4 py-2 rounded-md text-center">
                          <p className="text-xs">Request for access</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 px-4 sm:px-0">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md bg-richblack-700 px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-richblack-50 disabled:opacity-50 hover:bg-richblack-600 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm sm:text-base text-richblack-50">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md bg-richblack-700 px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-richblack-50 disabled:opacity-50 hover:bg-richblack-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </>
  )
}
