import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { buyCourse } from "../services/operations/studentFeaturesAPI"
import CouponInput from "../components/core/Dashboard/Cart/CouponInput"
import { useDispatch } from "react-redux"
import { FiArrowLeft, FiShoppingCart, FiCheck, FiStar, FiUsers } from "react-icons/fi"
import RatingStars from "../components/common/RatingStars"
import toast from "react-hot-toast"

function CourseCheckout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const handleCouponApply = (discountDetails) => {
    const discountAmount = discountDetails.discountAmount;
    setCouponDiscount(discountAmount);
    setAppliedCoupon(discountDetails);
  }

  const course = state?.course

  if (!course) {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center">
        <div className="text-center">
          <FiShoppingCart className="text-6xl text-richblack-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-richblack-5 mb-2">No Course Selected</h2>
          <p className="text-richblack-300 mb-6">Please select a course to checkout</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-25 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const getOriginalPrice = () => {
    return course.courseType === 'Free' ? 0 : course.price
  }

  const getFinalPrice = () => {
    return Math.max(0, getOriginalPrice() - couponDiscount)
  }

  const handleBuyCourse = () => {
    const finalPrice = getFinalPrice()
    
    // Check if total amount is not zero - prevent purchase and show message
    if (finalPrice !== 0 && finalPrice !== null) {
      toast.error("You have to pay first")
      return
    }
    
    const coursesId = [course._id]
    
    // Only proceed if total amount is 0 or null
    buyCourse(token, coursesId, user, navigate, dispatch, appliedCoupon)
  }

  return (
    <div className="min-h-screen bg-richblack-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-richblack-300 hover:text-richblack-100 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Course Details
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <FiShoppingCart className="text-yellow-50 text-3xl" />
            <h1 className="text-4xl font-bold text-richblack-5">Course Checkout</h1>
          </div>
          <p className="text-richblack-300 text-lg">
            Complete your purchase and start your learning journey
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-richblack-800 to-richblack-900 rounded-2xl p-8 border border-richblack-700"
            >
              <h2 className="text-2xl font-bold text-richblack-5 mb-6 flex items-center gap-3">
                <FiCheck className="text-green-400" />
                Course Details
              </h2>
              
              <div className="flex gap-6 bg-richblack-700/50 p-6 rounded-xl border border-richblack-600">
                <img 
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-40 h-28 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-richblack-5 mb-2 line-clamp-2">
                    {course.courseName}
                  </h3>
                  <p className="text-richblack-300 mb-3">
                    By {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                  
                  {/* Course Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-richblack-400">
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-400" />
                      <span>{course.averageRating?.toFixed(1) || '0.0'}</span>
                      <RatingStars Review_Count={course.averageRating || 0} Star_Size={14} />
                    </div>
                    <div className="flex items-center gap-1">
                      <FiUsers className="w-4 h-4" />
                      <span>{course.studentsEnrolled?.length || 0} students</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {course.courseType === 'Free' ? (
                        <span className="text-2xl font-bold text-caribbeangreen-100">Free</span>
                      ) : (
                        <span className="text-2xl font-bold text-richblack-5">₹{course.price}</span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.courseType === 'Free' 
                          ? 'bg-caribbeangreen-900/30 text-caribbeangreen-100 border border-caribbeangreen-700' 
                          : 'bg-yellow-900/30 text-yellow-100 border border-yellow-700'
                      }`}>
                        {course.courseType || 'Premium'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Summary */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-richblack-800 to-richblack-900 rounded-2xl p-8 border border-richblack-700 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-richblack-5 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {/* Coupon Input - Only show for paid courses */}
                {course.courseType !== 'Free' && (
                  <CouponInput 
                    totalAmount={getOriginalPrice()} 
                    onCouponApply={handleCouponApply}
                    checkoutType="course"
                  />
                )}

                <div className="flex justify-between text-richblack-300">
                  <span>Course:</span>
                  <span className="font-semibold">{course.courseName}</span>
                </div>
                
                <div className="flex justify-between text-richblack-300">
                  <span>Original Price:</span>
                  <span className="font-semibold">₹{getOriginalPrice()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount:</span>
                    <span className="font-bold text-green-400">-₹{couponDiscount}</span>
                  </div>
                )}
                
                <hr className="border-richblack-600" />
                
                <div className="flex justify-between text-xl font-bold text-richblack-5">
                  <span>Total Amount:</span>
                  <span className="text-yellow-50">₹{getFinalPrice()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleBuyCourse}
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-50 to-yellow-25 hover:from-yellow-25 hover:to-yellow-50 text-richblack-900"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {getFinalPrice() === 0 ? 'Enroll for Free' : 'Complete Purchase'}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-richblack-700 text-richblack-50 py-3 rounded-xl font-semibold hover:bg-richblack-600 transition-colors border border-richblack-600"
                >
                  Back to Course
                </button>
              </div>

              {/* Security/Info Badge */}
              <div className="mt-6 p-4 bg-richblack-700/30 rounded-lg border border-richblack-600">
                <div className="flex items-center gap-2 text-richblack-300 text-sm">
                  <FiCheck className="text-green-400 w-4 h-4" />
                  <span>Secure payment powered by Razorpay</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseCheckout
