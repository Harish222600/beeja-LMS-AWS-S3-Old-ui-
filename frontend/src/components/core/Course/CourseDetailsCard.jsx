import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import { requestCourseAccess } from "../../../services/operations/courseAccessAPI"
import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';


function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const handleShare = async () => {
    if (!course?._id) {
      toast.error("Course information not available")
      return
    }

    const shareData = {
      title: course.courseName,
      text: course.courseDescription,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        // Use native sharing on mobile devices
        await navigator.share(shareData)
      } else {
        // Fallback for desktop - copy to clipboard
        copy(window.location.href)
        toast.success("Link copied to clipboard")
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the share
        return
      }
      // Fallback if sharing fails
      copy(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  const handleAddToCart = () => {
    if (!course) {
      toast.error("Course information not available")
      return
    }

    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    
    if (token) {
      dispatch(addToCart(course))
      return
    }
    
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const handleRequestAccess = async () => {
    if (!course?._id) {
      toast.error("Course information not available")
      return
    }

    if (!user) {
      toast.error("Please login to request access");
      navigate("/login");
      return;
    }

    try {
      const response = await requestCourseAccess({ courseId, requestMessage: "" }, token);
      if (response) {
        toast.success("Access request submitted successfully");
      }
    } catch (error) {
      console.error("Error requesting access:", error);
      toast.error("Failed to submit access request");
    }
  };

  // console.log("Student already enrolled ", course?.studentsEnroled, user?._id)

  return (
    <>
<div data-course-component className="flex flex-col gap-4 rounded-2xl bg-richblack-700 p-4 text-richblack-5 shadow-lg border border-richblack-600">
        {/* Course Image */}
        <Img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />

        <div className="px-4">
          <div className="pb-4">
            {course?.courseType === 'Free' ? (
              <div className="flex items-center gap-3">

                <div className="bg-caribbeangreen-200 text-caribbeangreen-800 px-3 py-1 rounded-full text-sm font-bold">
                  100% OFF
                </div>
              </div>
            ) : (
              <span className="text-3xl font-semibold text-yellow-50">Rs. {CurrentPrice}</span>
            )}
          </div>
          
          {/* Rating Display */}
          {(course?.averageRating > 0 || course?.totalRatings > 0) && (
            <div className="flex items-center gap-2 pb-4">
              <span className="text-yellow-5 text-lg font-medium">
                {course?.averageRating || 0}
              </span>
              <RatingStars Review_Count={course?.averageRating || 0} />
              <span className="text-richblack-300 text-sm">
                ({course?.totalRatings || 0} ratings)
              </span>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {/* Course Type Badge */}
            <div className={`inline-flex px-4 py-2 rounded-full font-bold text-sm mb-4
              ${course?.courseType === 'Free' 
                ? "bg-caribbeangreen-200 text-caribbeangreen-800 border border-caribbeangreen-300" 
                : "bg-blue-600/90 text-white"} 
              backdrop-blur-sm shadow-lg`}>
              {course?.courseType === 'Free' ? "FREE COURSE" : "PREMIUM COURSE"}
            </div>

            {/* Admin Role - Can manage all courses */}
            {user?.accountType === ACCOUNT_TYPE.ADMIN ? (
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg outline-none"
                onClick={() => navigate('/admin')}
                disabled={!course?._id}
              >
                Manage Course
              </button>
            ) : 
            /* Instructor Role - Can manage only their own courses */
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR ? (
              course?.instructor?._id === user?._id ? (
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg outline-none"
                onClick={() => navigate('/dashboard/my-courses')}
                  disabled={!course?._id}
                >
                  Manage Course
                </button>
              ) : (
                <div className="w-full bg-richblack-600 text-richblack-200 font-medium py-3 px-6 rounded-lg text-center">
                  <p className="text-sm">You can only manage courses you've created</p>
                  <p className="text-xs mt-1">This course is managed by {course?.instructor?.firstName} {course?.instructor?.lastName}</p>
                </div>
              )
            ) :
            /* Student Role - Normal buy/request access flow */
            course?.courseType === 'Free' ? (
              <button
                className="w-full bg-caribbeangreen-300 hover:bg-caribbeangreen-400 text-richblack-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg outline-none"
                onClick={
                  user && course?.studentsEnrolled?.includes(user?._id)
                    ? () => navigate("/dashboard/enrolled-courses")
                    : handleRequestAccess
                }
              >
                {user && course?.studentsEnrolled?.includes(user?._id)
                  ? "Go To Course"
                  : "Get Free Access"}
              </button>
            ) : (
              <>
                <button
                  className="yellowButton outline-none"
                  onClick={
                    user && course?.studentsEnrolled?.includes(user?._id)
                      ? () => navigate("/dashboard/enrolled-courses")
                      : () => navigate("/course-checkout", { state: { course } })
                  }
                  disabled={!course?._id}
                >
                  {user && course?.studentsEnrolled?.includes(user?._id)
                    ? "Go To Course"
                    : "Buy Now"}
                </button>
                {/* Removed Add to Cart button as per user request */}
              </>
            )}
          </div>

          {/* Course Requirements Section with Fallback */}
          <div className="mt-6 border-t border-richblack-600 pt-6">
            <p className="mb-4 text-xl font-semibold text-richblack-5">
              Course Requirements:
            </p>
            <div className="flex flex-col gap-3 text-sm text-richblack-300">
              {course?.instructions && course.instructions.length > 0 ? (
                course.instructions.map((item, i) => (
                  <p className="flex items-start gap-2" key={i}>
                    <BsFillCaretRightFill className="mt-1 text-caribbeangreen-100 flex-shrink-0" />
                    <span className="text-richblack-50">{item}</span>
                  </p>
                ))
              ) : (
                <p className="text-richblack-300 italic">
                  No specific requirements listed for this course.
                </p>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-100 hover:text-yellow-50 transition-colors duration-200"
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> 
              <span>Share Course</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetailsCard
