import React, { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { buyCourse } from "../services/operations/studentFeaturesAPI"
import CouponInput from "../components/core/Dashboard/Cart/CouponInput"
import { useDispatch } from "react-redux"
import { FiArrowLeft, FiShoppingCart, FiCheck, FiStar, FiClock, FiUsers } from "react-icons/fi"
import RatingStars from "../components/common/RatingStars"
import { apiConnector } from "../services/apiConnector"
import { courseAccessEndpoints } from "../services/apis"
import toast from "react-hot-toast"

function BundleCheckout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [couponDiscount, setCouponDiscount] = useState(0)

  const handleCouponApply = (discountDetails) => {
    const discountAmount = discountDetails.discountAmount;
    setCouponDiscount(discountAmount);
  }

  const selectedCourses = state?.selectedCourses || []

  if (!selectedCourses.length) {
    return (
      <div className="min-h-screen bg-richblack-900 flex items-center justify-center">
        <div className="text-center">
          <FiShoppingCart className="text-6xl text-richblack-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-richblack-5 mb-2">No Courses Selected</h2>
          <p className="text-richblack-300 mb-6">Please select courses to create a bundle</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-25 transition-colors"
          >
            Go Back to Catalog
          </button>
        </div>
      </div>
    )
  }

  const getOriginalPrice = () => {
    return selectedCourses.reduce((total, course) => {
      return total + (course.courseType === 'Free' ? 0 : course.price)
    }, 0)
  }

  const getBundleDiscount = () => {
    if (selectedCourses.length >= 3) return 0.15 // 15% discount for 3+ courses
    if (selectedCourses.length >= 2) return 0.10 // 10% discount for 2+ courses
    return 0
  }

  const getFinalPrice = () => {
    const originalPrice = getOriginalPrice()
    const discount = getBundleDiscount()
    return Math.round(originalPrice * (1 - discount))
  }

  const getSavings = () => {
    return getOriginalPrice() - getFinalPrice()
  }

  const isAllFree = selectedCourses.every(course => course.courseType === 'Free')
  const freeCourses = selectedCourses.filter(course => course.courseType === 'Free')
  const paidCourses = selectedCourses.filter(course => course.courseType !== 'Free')

  const handleBuyBundle = async () => {
    const finalPrice = Math.max(0, getFinalPrice() - couponDiscount)
    const courseIds = selectedCourses.map(course => course._id)
    const paidCourseIds = paidCourses.map(course => course._id)
    const freeCourseIds = freeCourses.map(course => course._id)
    
    if (isAllFree) {
      // Scenario 1: All courses are free - request access from admin
      try {
        const response = await apiConnector("POST", 
          courseAccessEndpoints.REQUEST_BUNDLE_ACCESS_API,
          { 
            courseIds: freeCourseIds
          },
          { Authorization: `Bearer ${token}` }
        )
        if (response.data.success) {
          toast.success("Bundle access request sent successfully!")
          navigate('/dashboard/enrolled-courses')
        }
      } catch (error) {
        console.error("Error requesting bundle access:", error)
        toast.error("Failed to send bundle access request")
      }
    } else if (paidCourses.length > 0 && freeCourses.length === 0) {
      // Scenario 2: All courses are paid - check payment requirement
      if (finalPrice !== 0 && finalPrice !== null) {
        toast.error("You have to pay first")
        return
      }
      // Proceed with payment for all paid courses
      buyCourse(token, paidCourseIds, user, navigate, dispatch)
    } else if (paidCourses.length > 0 && freeCourses.length > 0) {
      // Scenario 3: Mixed bundle (paid + free courses)
      if (finalPrice !== 0 && finalPrice !== null) {
        toast.error("You have to pay first")
        return
      }
      
      // First, process payment for paid courses
      try {
        const paymentResult = await buyCourse(token, paidCourseIds, user, navigate, dispatch)
        
        // After successful payment, request access for free courses
        if (paymentResult !== false) { // Assuming buyCourse returns false on failure
          try {
            const response = await apiConnector("POST", 
              courseAccessEndpoints.REQUEST_BUNDLE_ACCESS_API,
              { 
                courseIds: freeCourseIds
              },
              { Authorization: `Bearer ${token}` }
            )
            if (response.data.success) {
              toast.success("Payment completed! Free course access request sent to admin.")
            }
          } catch (error) {
            console.error("Error requesting free course access:", error)
            toast.error("Payment successful, but failed to request free course access")
          }
        }
      } catch (error) {
        console.error("Error processing payment:", error)
        toast.error("Failed to process payment")
      }
    }
  }

  return (
    <div className="min-h-screen bg-richblack-900 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-richblack-300 hover:text-richblack-100 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Course Selection</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-4 mb-2">
            <FiShoppingCart className="text-yellow-50 text-2xl sm:text-3xl" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-richblack-5">Bundle Checkout</h1>
          </div>
          <p className="text-richblack-300 text-sm sm:text-base lg:text-lg">
            Complete your purchase and start your learning journey with {selectedCourses.length} courses
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Course List */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-richblack-800 to-richblack-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-richblack-700"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-richblack-5 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <FiCheck className="text-green-400 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Selected Courses ({selectedCourses.length})</span>
                <span className="sm:hidden">Courses ({selectedCourses.length})</span>
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                {selectedCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-richblack-700/50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-richblack-600 hover:border-richblack-500 transition-colors"
                  >
                    <img 
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="w-full sm:w-32 md:w-40 h-32 sm:h-24 md:h-28 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-richblack-5 mb-2 line-clamp-2">
                        {course.courseName}
                      </h3>
                      <p className="text-richblack-300 mb-3 text-sm sm:text-base">
                        By {course.instructor?.firstName} {course.instructor?.lastName}
                      </p>
                      
                      {/* Course Stats */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-richblack-400">
                        <div className="flex items-center gap-1">
                          <FiStar className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{course.averageRating?.toFixed(1) || '0.0'}</span>
                          <div className="hidden sm:block">
                            <RatingStars Review_Count={course.averageRating || 0} Star_Size={14} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{course.studentsEnrolled?.length || 0} students</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {course.courseType === 'Free' ? (
                            <span className="text-xl sm:text-2xl font-bold text-caribbeangreen-100">Free</span>
                          ) : (
                            <span className="text-xl sm:text-2xl font-bold text-richblack-5">₹{course.price}</span>
                          )}
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            course.courseType === 'Free' 
                              ? 'bg-caribbeangreen-900/30 text-caribbeangreen-100 border border-caribbeangreen-700' 
                              : 'bg-yellow-900/30 text-yellow-100 border border-yellow-700'
                          }`}>
                            {course.courseType || 'Premium'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-richblack-800 to-richblack-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-richblack-700 lg:sticky lg:top-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-richblack-5 mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {/* Coupon Input */}
                <CouponInput 
                  totalAmount={getOriginalPrice()} 
                  onCouponApply={handleCouponApply}
                  checkoutType="bundle"
                />

                <div className="flex justify-between text-richblack-300 text-sm sm:text-base">
                  <span>Total Courses:</span>
                  <span className="font-semibold">{selectedCourses.length}</span>
                </div>
                
                <div className="flex justify-between text-richblack-300 text-sm sm:text-base">
                  <span>Original Price:</span>
                  <span className="font-semibold">₹{getOriginalPrice()}</span>
                </div>

                {getBundleDiscount() > 0 && (
                  <>
                    <div className="flex justify-between text-green-400 text-sm sm:text-base">
                      <span className="text-richblack-100">Bundle Discount ({Math.round(getBundleDiscount() * 100)}%):</span>
                      <span className="font-bold text-green-400">-₹{getSavings()}</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-semibold">
                        <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                        <span>🎉 You're saving ₹{getSavings()} with this bundle!</span>
                      </div>
                    </div>
                  </>
                )}
                
                <hr className="border-richblack-600" />
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400 text-sm sm:text-base">
                    <span>Coupon Discount:</span>
                    <span className="font-bold text-green-400">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg sm:text-xl font-bold text-richblack-5">
                  <span>Total Amount:</span>
                  <span className="text-yellow-50">₹{Math.max(0, getFinalPrice() - couponDiscount)}</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleBuyBundle}
                  className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3
                    ${isAllFree 
                      ? 'bg-caribbeangreen-200 hover:bg-caribbeangreen-100 text-richblack-900' 
                      : 'bg-gradient-to-r from-yellow-50 to-yellow-25 hover:from-yellow-25 hover:to-yellow-50 text-richblack-900'
                    }`}
                >
                  {isAllFree ? (
                    <>
                      <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Request Access</span>
                      <span className="sm:hidden">Request</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Complete Purchase</span>
                      <span className="sm:hidden">Purchase</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-richblack-700 text-richblack-50 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-richblack-600 transition-colors border border-richblack-600 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Continue Shopping</span>
                  <span className="sm:hidden">Continue</span>
                </button>
              </div>

              {/* Security/Info Badge */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-richblack-700/30 rounded-lg border border-richblack-600">
                <div className="flex items-start gap-2 text-richblack-300 text-xs sm:text-sm">
                  <FiCheck className="text-green-400 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    {isAllFree ? (
                      <span>Your request will be reviewed by admin</span>
                    ) : (
                      <>
                        <span>Secure payment powered by Razorpay</span>
                        {freeCourses.length > 0 && (
                          <div className="mt-2 text-xs text-yellow-100">
                            Note: Free course access will be requested after payment completion
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BundleCheckout
