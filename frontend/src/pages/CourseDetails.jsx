import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { FiClock, FiUsers, FiStar, FiPlay, FiBookOpen } from "react-icons/fi"
import { BsCheckCircle } from "react-icons/bs"
import { motion } from "framer-motion"
// import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import ConfirmationModal from "../components/common/ConfirmationModal"
import ImprovedFooter from "../components/common/ImprovedFooter"
import RatingStars from "../components/common/RatingStars"
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard"
import { formatDate } from "../services/formatDate"
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI"
import { buyCourse } from "../services/operations/studentFeaturesAPI"
import { requestCourseAccess } from "../services/operations/courseAccessAPI"

import GetAvgRating from "../utils/avgRating"
import { ACCOUNT_TYPE } from './../utils/constants';
import { addToCart } from "../slices/cartSlice"

import { GiReturnArrow } from 'react-icons/gi'
import { MdOutlineVerified } from 'react-icons/md'
import Img from './../components/common/Img';
import toast from "react-hot-toast"
import copy from "copy-to-clipboard"
import BackgroundEffect from './BackgroundEffect'




function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()


  // Getting courseId from url parameter
  const { courseId } = useParams()
  // console.log(`course id: ${courseId}`)

  // Declear a state to save the course details
  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)

  useEffect(() => {
    // Calling fetchCourseDetails fucntion to fetch the details
    const fectchCourseDetailsData = async () => {
      try {
        const res = await fetchCourseDetails(courseId)
        // console.log("course details res: ", res)
        setResponse(res)
      } catch (error) {
        console.log("Could not fetch Course Details")
      }
    }
    fectchCourseDetailsData();
  }, [courseId])

  // console.log("response: ", response)

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const count = GetAvgRating(response?.data?.courseDetails.ratingAndReviews)
    setAvgReviewCount(count)
  }, [response])
  // console.log("avgReviewCount: ", avgReviewCount)

  // Collapse all
  // const [collapse, setCollapse] = useState("")
  const [isActive, setIsActive] = useState(Array(0))
  const handleActive = (id) => {
    // console.log("called", id)
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e != id)
    )
  }

  // Total number of lectures
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])


  // Loading skeleton
  if (paymentLoading || loading || !response) {
    return (
      <div className={`mt-24 p-5 flex flex-col justify-center gap-4  `}>
        <div className="flex flex-col sm:flex-col-reverse  gap-4 ">
          <p className="h-44 sm:h-24 sm:w-[60%] rounded-xl skeleton"></p>
          <p className="h-9 sm:w-[39%] rounded-xl skeleton"></p>
        </div>

        <p className="h-4 w-[55%] lg:w-[25%] rounded-xl skeleton"></p>
        <p className="h-4 w-[75%] lg:w-[30%] rounded-xl skeleton"></p>
        <p className="h-4 w-[35%] lg:w-[10%] rounded-xl skeleton"></p>

        {/* Floating Courses Card */}
        <div className="right-[1.5rem] top-[20%] hidden lg:block lg:absolute min-h-[450px] w-1/3 max-w-[410px] 
            translate-y-24 md:translate-y-0 rounded-xl skeleton">
        </div>

        <p className="mt-24 h-60 lg:w-[60%] rounded-xl skeleton"></p>
      </div>
    )
  }


  // extract course data
  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
    tag
  } = response?.data?.courseDetails

  // Buy Course handler
  const handleBuyCourse = () => {
    if (!courseId) {
      toast.error("Course information not available")
      return
    }
    
    if (token) {
      navigate("/course-checkout", { state: { course: response?.data?.courseDetails } })
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  // Add to cart Course handler
  const handleAddToCart = () => {
    if (!response?.data?.courseDetails) {
      toast.error("Course information not available")
      return
    }

    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    
    if (token) {
      dispatch(addToCart(response.data.courseDetails))
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

  // Request Access handler for free courses
  const handleRequestAccess = async () => {
    if (!courseId) {
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



  return (
    <>
      {/* Background with Gradient and Particles */}

        <BackgroundEffect />
      

      {/* Enhanced Professional Hero Section */}
      <div className="relative w-full bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-700 z-10">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-50/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto box-content px-4 lg:w-[1260px] 2xl:relative">
          <div className="mx-auto grid min-h-[500px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">

            {/* Professional Go back button */}
            <motion.div 
              className="mb-5 lg:mt-10 lg:mb-0 z-[100]" 
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2 bg-richblack-700/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-richblack-600 hover:border-yellow-50 transition-all duration-300 cursor-pointer group shadow-lg">
                <GiReturnArrow className="w-4 h-4 text-yellow-50 group-hover:text-yellow-25 transition-colors duration-300" />
                <span className="text-yellow-50 group-hover:text-yellow-25 font-medium transition-colors duration-300">Back</span>
              </div>
            </motion.div>

            {/* Enhanced mobile thumbnail */}
            <motion.div 
              className="relative block max-h-[30rem] lg:hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative overflow-hidden rounded-xl border border-richblack-600 shadow-xl">
                <Img
                  src={thumbnail}
                  alt="course thumbnail"
                  className="aspect-video w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-richblack-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 bg-richblack-800/90 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-richblack-600">
                    <FiPlay className="w-4 h-4 text-yellow-50" />
                    <span className="text-sm font-medium">Preview Course</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Course data */}
            <motion.div 
              className="mb-5 flex flex-col justify-center gap-6 py-5 text-lg text-richblack-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-richblack-5 mb-4 leading-tight">
                  {courseName}
                </h1>
                <p className="text-xl text-richblack-200 leading-relaxed max-w-3xl">
                  {courseDescription}
                </p>
              </div>

              {/* Professional Rating and Stats */}
              <div className="flex flex-wrap items-center gap-6 text-base">
                <div className="flex items-center gap-2 bg-yellow-50/10 px-4 py-2 rounded-lg border border-yellow-50/20">
                  <FiStar className="w-4 h-4 text-yellow-50" />
                  <span className="text-yellow-25 font-semibold">{avgReviewCount}</span>
                  <RatingStars Review_Count={avgReviewCount} Star_Size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-richblack-700 text-richblack-25 px-4 py-2 rounded-lg text-sm font-medium border border-richblack-600">
                    {ratingAndReviews.length} reviews
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-richblack-700/50 px-4 py-2 rounded-lg border border-richblack-600 text-richblack-200">
                  <FiUsers className="w-4 h-4" />
                  <span>{studentsEnrolled.length} students</span>
                </div>
              </div>

              {/* Professional Instructor Info */}
              <div className="flex items-center gap-4 bg-richblack-800/60 backdrop-blur-sm p-4 rounded-xl border border-richblack-600 shadow-lg">
                <Img
                  src={instructor?.image ?? ''}
                  alt="Instructor"
                  className="h-12 w-12 rounded-full object-cover border-2 border-yellow-50 shadow-md"
                />
                <div>
                  <p className="text-richblack-300 text-sm">Created by</p>
                  <p className="font-semibold text-richblack-25 flex items-center gap-2">
                    {instructor?.firstName ?? ''} {instructor?.lastName ?? ''}
                    <MdOutlineVerified className="w-4 h-4 text-blue-200" />
                  </p>
                </div>
              </div>

              {/* Professional Meta Info */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 bg-richblack-700/40 px-3 py-2 rounded-lg border border-richblack-600 text-richblack-200">
                  <BiInfoCircle className="w-4 h-4" />
                  <span className="text-sm">Created {formatDate(createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 bg-richblack-700/40 px-3 py-2 rounded-lg border border-richblack-600 text-richblack-200">
                  <HiOutlineGlobeAlt className="w-4 h-4" />
                  <span className="text-sm">English</span>
                </div>
              </div>
            </motion.div>

            {/* Professional mobile purchase section */}
            <motion.div 
              className="flex w-full flex-col gap-4 border border-richblack-600 bg-richblack-800/60 backdrop-blur-sm rounded-xl p-6 lg:hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                {response?.data?.courseDetails?.courseType === 'Free' ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-caribbeangreen-200 text-caribbeangreen-800 px-3 py-1 rounded-full text-sm font-bold">
                      100% OFF
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-richblack-5">₹{price}</p>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      Best Seller
                    </div>
                  </>
                )}
              </div>
              
              {/* Course Type Badge */}
              <div className={`inline-flex px-4 py-2 rounded-full font-bold text-sm mb-4
                ${response?.data?.courseDetails?.courseType === 'Free' 
                  ? "bg-caribbeangreen-200 text-caribbeangreen-800 border border-caribbeangreen-300" 
                  : "bg-blue-600/90 text-white"} 
                backdrop-blur-sm shadow-lg`}>
                {response?.data?.courseDetails?.courseType === 'Free' ? "FREE COURSE" : "PREMIUM COURSE"}
              </div>

              {/* Admin Role - Can manage all courses */}
              {user?.accountType === ACCOUNT_TYPE.ADMIN ? (
                <motion.button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                  onClick={() => navigate('/admin')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!courseId}
                >
                  Manage Course
                </motion.button>
              ) : 
              /* Instructor Role - Can manage only their own courses */
              user?.accountType === ACCOUNT_TYPE.INSTRUCTOR ? (
                instructor?._id === user?._id ? (
                  <motion.button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                    onClick={() => navigate('/dashboard/my-courses')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!courseId}
                  >
                    Manage Course
                  </motion.button>
                ) : (
                  <div className="bg-richblack-700 text-richblack-200 font-medium py-3 px-6 rounded-lg text-center border border-richblack-600">
                    <p className="text-sm">You can only manage courses you've created</p>
                    <p className="text-xs mt-1">This course is managed by {instructor?.firstName} {instructor?.lastName}</p>
                  </div>
                )
              ) :
              /* Student Role - Check course type for proper flow */
              response?.data?.courseDetails?.courseType === 'Free' ? (
                <motion.button 
                  className="bg-caribbeangreen-300 hover:bg-caribbeangreen-400 text-richblack-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                  onClick={
                    user && response?.data?.courseDetails?.studentsEnrolled?.includes(user?._id)
                      ? () => navigate("/dashboard/enrolled-courses")
                      : handleRequestAccess
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {user && response?.data?.courseDetails?.studentsEnrolled?.includes(user?._id)
                    ? "Go To Course"
                    : "Get Free Access"}
                </motion.button>
              ) : (
                /* Paid Course - Normal buy/cart flow */
                <>
                  <motion.button 
                    className="bg-yellow-50 text-richblack-900 font-semibold py-3 px-6 rounded-lg hover:bg-yellow-25 transition-all duration-300 shadow-lg"
                    onClick={handleBuyCourse}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Buy Now
                  </motion.button>
                  <motion.button 
                    onClick={handleAddToCart} 
                    className="bg-richblack-700 text-richblack-25 font-semibold py-3 px-6 rounded-lg border border-richblack-600 hover:bg-richblack-600 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add to Cart
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>

          {/* Enhanced Floating Course Card */}
          <motion.div 
            className="right-[1.5rem] top-[60px] mx-auto hidden lg:block lg:absolute min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 z-20"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </motion.div>
        </div>
      </div>

      {/* Professional Content Section */}
      <div className="bg-richblack-900 min-h-screen">
        <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
          <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px] lg:pr-8">
            
            {/* Professional What you'll learn section */}
            <motion.div 
              data-course-component
              className="my-12 bg-richblack-800 border border-richblack-700 rounded-xl p-8 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ opacity: 1, transform: 'translateY(0px)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-50/10 p-3 rounded-lg border border-yellow-50/20">
                  <FiBookOpen className="w-6 h-6 text-yellow-50" />
                </div>
                <h2 className="text-3xl font-bold text-richblack-5">What you'll learn</h2>
              </div>
              <div className="grid gap-3">
                {whatYouWillLearn && whatYouWillLearn.trim() ? (
                  whatYouWillLearn.split('\n').filter(line => line.trim()).map((line, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-richblack-700/50 rounded-lg border border-richblack-600 hover:bg-richblack-700/70 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      style={{ opacity: 1, transform: 'translateX(0px)' }}
                    >
                      <BsCheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-richblack-200 leading-relaxed">{line.trim()}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-richblack-700/50 rounded-lg border border-richblack-600">
                    <BsCheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-richblack-300 leading-relaxed italic">
                      Course learning objectives will be updated soon.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Professional Certificates Section */}
            <motion.div 
              data-course-component
              className="my-12 bg-richblack-800 border border-richblack-700 rounded-xl p-8 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ opacity: 1, transform: 'translateY(0px)' }}
            >
              <h2 className="text-3xl font-bold text-richblack-5 mb-8">
                Gain a Competitive Edge With Our <span className="text-yellow-50">Professional Certificates</span>
              </h2>
              
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="lg:w-1/2">
                  <div className="relative bg-richblack-700 p-6 rounded-xl border border-richblack-600 shadow-lg">
                    <img 
                      src="/certificate.png"
                      alt="Sample Certificate"
                      className="w-full rounded-lg shadow-md"
                    />
                    <div className="absolute top-4 right-4 bg-yellow-50 text-richblack-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Sample
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/2 space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-richblack-700/50 rounded-lg border border-richblack-600 hover:bg-richblack-700/70 transition-all duration-300">
                    <div className="bg-yellow-50/10 p-2 rounded-lg border border-yellow-50/20 flex-shrink-0">
                      <BsCheckCircle className="w-4 h-4 text-yellow-50" />
                    </div>
                    <p className="text-richblack-200 leading-relaxed">
                      Master the latest programming languages and enhance your skill set with a recognized certificate.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-richblack-700/50 rounded-lg border border-richblack-600 hover:bg-richblack-700/70 transition-all duration-300">
                    <div className="bg-yellow-50/10 p-2 rounded-lg border border-yellow-50/20 flex-shrink-0">
                      <BsCheckCircle className="w-4 h-4 text-yellow-50" />
                    </div>
                    <p className="text-richblack-200 leading-relaxed">
                      Unlock new career opportunities with a programming certificate.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* This is one For You Section */}
            <motion.div 
              data-course-component
              className="my-12 bg-richblack-800 border border-richblack-700 rounded-xl p-8 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ opacity: 1, transform: 'translateY(0px)' }}
            >
              <h2 className="text-3xl font-bold text-richblack-5 mb-8">
                This is one <span className="text-yellow-50">For You</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hands on training */}
                <motion.div 
                  className="bg-richblack-700/50 border border-richblack-600 rounded-xl p-6 hover:bg-richblack-700/70 transition-all duration-300 hover:border-yellow-50/30"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-50/10 p-3 rounded-lg border border-yellow-50/20 flex-shrink-0">
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-richblack-5 mb-2">Hands on training</h3>
                      <p className="text-richblack-200 leading-relaxed">
                        Looking to enhance your Coding skills
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Innovation Ideas */}
                <motion.div 
                  className="bg-richblack-700/50 border border-richblack-600 rounded-xl p-6 hover:bg-richblack-700/70 transition-all duration-300 hover:border-yellow-50/30"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-50/10 p-3 rounded-lg border border-yellow-50/20 flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-richblack-900 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-richblack-5 mb-2">Innovation Ideas</h3>
                      <p className="text-richblack-200 leading-relaxed">
                        lets you create innovative solutions, explore technologies
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Newbie Programmer */}
                <motion.div 
                  className="bg-richblack-700/50 border border-richblack-600 rounded-xl p-6 hover:bg-richblack-700/70 transition-all duration-300 hover:border-yellow-50/30"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-50/10 p-3 rounded-lg border border-yellow-50/20 flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-50 to-yellow-25 rounded flex items-center justify-center">
                        <span className="text-richblack-900 font-bold text-lg">🚀</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-richblack-5 mb-2">Newbie Programmer</h3>
                      <p className="text-richblack-200 leading-relaxed">
                        Budding Programmer, Wants to learn some tricks and tips
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Upskilling your skills */}
                <motion.div 
                  className="bg-richblack-700/50 border border-richblack-600 rounded-xl p-6 hover:bg-richblack-700/70 transition-all duration-300 hover:border-yellow-50/30"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-50/10 p-3 rounded-lg border border-yellow-50/20 flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center">
                        <span className="text-richblack-900 font-bold text-sm">▲</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-richblack-5 mb-2">Upskilling your skills</h3>
                      <p className="text-richblack-200 leading-relaxed">
                        A professional wanting to Update their skills
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Professional Tags Section */}
            <motion.div 
              data-course-component
              className="my-8 bg-richblack-800/60 backdrop-blur-sm rounded-xl p-6 border border-richblack-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ opacity: 1, transform: 'translateY(0px)' }}
            >
              <h3 className="text-xl font-bold text-richblack-5 mb-4">Course Tags</h3>
              <div className="flex flex-wrap gap-3">
                {tag && tag.length > 0 ? (
                  tag.map((item, ind) => (
                    <motion.span 
                      key={ind} 
                      className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-25 transition-colors duration-300 shadow-md"
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: ind * 0.1 }}
                      style={{ opacity: 1, transform: 'scale(1)' }}
                    >
                      {item}
                    </motion.span>
                  ))
                ) : (
                  <span className="bg-richblack-700 text-richblack-300 px-4 py-2 rounded-lg text-sm italic">
                    No tags available for this course
                  </span>
                )}
              </div>
            </motion.div>

            {/* Professional Course Content Section */}
            <motion.div 
              data-course-component
              className="max-w-[830px] my-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ opacity: 1, transform: 'translateY(0px)' }}
            >
              <div className="bg-richblack-800 rounded-xl p-6 border border-richblack-700 mb-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-200/10 p-3 rounded-lg border border-blue-200/20">
                    <FiPlay className="w-6 h-6 text-blue-200" />
                  </div>
                  <h2 className="text-3xl font-bold text-richblack-5">Course Content</h2>
                </div>
                
                <div className="flex flex-wrap justify-between gap-4 mb-6">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 bg-richblack-700/50 px-3 py-2 rounded-lg border border-richblack-600 text-richblack-200">
                      <FiBookOpen className="w-4 h-4" />
                      <span className="text-sm">{courseContent.length} sections</span>
                    </div>
                    <div className="flex items-center gap-2 bg-richblack-700/50 px-3 py-2 rounded-lg border border-richblack-600 text-richblack-200">
                      <FiPlay className="w-4 h-4" />
                      <span className="text-sm">{totalNoOfLectures} lectures</span>
                    </div>
                    <div className="flex items-center gap-2 bg-richblack-700/50 px-3 py-2 rounded-lg border border-richblack-600 text-richblack-200">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm">{response.data?.totalDuration} total</span>
                    </div>
                  </div>
                  <motion.button
                    className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-25 transition-all duration-200 shadow-md"
                    onClick={() => setIsActive([])}
                    whileHover={{ scale: 1.05 }}
                  >
                    Collapse All Sections
                  </motion.button>
                </div>
              </div>

              {/* Course Details Accordion */}
              <div className="space-y-4">
                {courseContent?.map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    style={{ opacity: 1, transform: 'translateY(0px)' }}
                  >
                    <CourseAccordionBar
                      course={course}
                      isActive={isActive}
                      handleActive={handleActive}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Professional Author Section */}
            <motion.div 
              data-course-component
              className="mb-12 bg-richblack-800 rounded-xl p-8 border border-richblack-700 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ opacity: 1, transform: 'translateY(0px)' }}
            >
              <h2 className="text-3xl font-bold text-richblack-5 mb-6">Meet Your Instructor</h2>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Img
                    src={instructor?.image ?? ''}
                    alt="Author"
                    className="h-20 w-20 rounded-xl object-cover border-2 border-yellow-50 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1 border-2 border-richblack-800">
                    <MdOutlineVerified className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-richblack-5 mb-2">
                    {`${instructor?.firstName ?? ''} ${instructor?.lastName ?? ''}`}
                  </h3>
                  <p className="text-richblack-200 leading-relaxed">
                    {instructor?.additionalDetails?.about || "Experienced instructor passionate about teaching and helping students achieve their goals."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ImprovedFooter />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails
