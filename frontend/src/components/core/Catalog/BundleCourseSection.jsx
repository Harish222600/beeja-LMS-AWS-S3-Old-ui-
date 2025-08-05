import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import Course_Card from "./Course_Card"
import { FiShoppingCart, FiArrowRight, FiX, FiPackage } from "react-icons/fi"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"

function BundleCourseSection({ courses }) {
  const [selectedCourses, setSelectedCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)

  // Fetch enrolled courses and filter available courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (token) {
        try {
          const enrolled = await getUserEnrolledCourses(token)
          setEnrolledCourses(enrolled)
          
          // Filter out enrolled courses from available courses
          if (courses && courses.length > 0) {
            const enrolledCourseIds = enrolled.map(course => course._id)
            const filtered = courses.filter(course => !enrolledCourseIds.includes(course._id))
            setAvailableCourses(filtered)
          }
        } catch (error) {
          console.error("Error fetching enrolled courses:", error)
          // If error, show all courses
          setAvailableCourses(courses || [])
        }
      } else {
        // If no token (not logged in), show all courses
        setAvailableCourses(courses || [])
      }
    }

    fetchEnrolledCourses()
  }, [courses, token])

  const handleCourseSelect = (course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.some(c => c._id === course._id)
      if (isSelected) {
        return prev.filter(c => c._id !== course._id)
      } else {
        return [...prev, course]
      }
    })
  }

  const handleProceedToBundle = () => {
    if (selectedCourses.length === 0) {
      return
    }
    navigate('/bundle-checkout', { 
      state: { 
        selectedCourses,
        bundleDiscount: getBundleDiscount(),
        originalPrice: getOriginalPrice(),
        finalPrice: getFinalPrice()
      } 
    })
  }

  const getTotalPrice = () => {
    return selectedCourses.reduce((total, course) => {
      return total + (course.courseType === 'Free' ? 0 : course.price)
    }, 0)
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

  return (
    <div className="mx-auto box-content w-full max-w-maxContentTab px-4 sm:px-8 py-12 sm:py-16 lg:max-w-maxContent">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12">
        <div 
          className="flex flex-col items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 w-full"
          style={{ opacity: 1, visibility: 'visible', transform: 'none', transition: 'none' }}
          data-course-component="true"
        >
          <FiPackage className="text-yellow-50 text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3" />
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-richblack-5 leading-tight sm:leading-snug text-center w-full">
            Bundle Course
          </h2>
        </div>
        <p 
          className="text-sm sm:text-base md:text-lg lg:text-xl text-richblack-200 w-full max-w-2xl lg:max-w-3xl mx-auto leading-relaxed sm:leading-relaxed md:leading-loose text-center"
          style={{ opacity: 1, visibility: 'visible', transform: 'none', transition: 'none' }}
          data-course-component="true"
        >
          Create your perfect learning path! Select multiple courses and save with our bundle pricing. 
          The more you learn, the more you save.
        </p>
        
        {/* Discount Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8 w-full">
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700 rounded-full px-3 sm:px-4 py-2">
            <span className="text-yellow-100 text-xs sm:text-sm md:text-base font-medium">2+ Courses: 10% OFF</span>
          </div>
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700 rounded-full px-3 sm:px-4 py-2">
            <span className="text-green-100 text-xs sm:text-sm md:text-base font-medium">3+ Courses: 15% OFF</span>
          </div>
        </div>
      </div>
      
      {/* Course Grid */}
      <div className="w-full max-w-maxContent mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {availableCourses.length === 0 ? (
            <div className="col-span-full text-center text-richblack-300 py-8">
              {token ? 
                "You are already enrolled in all available courses in this category." :
                "Please log in to view available courses for bundle purchase."
              }
            </div>
          ) : (
            availableCourses.map((course, index) => (
              <div
                key={course._id || index}
                className="w-full"
              >
                <Course_Card 
                  course={course} 
                  Height={"h-[420px]"} 
                  bundleMode={true}
                  isSelected={selectedCourses.some(c => c._id === course._id)}
                  onSelect={() => handleCourseSelect(course)}
                  selectionText="Click to Select"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Courses Summary */}
      <AnimatePresence>
        {selectedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-richblack-900/95 backdrop-blur-lg border-t border-richblack-700"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Selected Count & Price */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-yellow-50 text-richblack-900 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base">
                      {selectedCourses.length}
                    </div>
                    <div>
                      <p className="text-richblack-5 font-semibold text-sm sm:text-base">
                        {selectedCourses.length} Course{selectedCourses.length > 1 ? 's' : ''} Selected
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {getBundleDiscount() > 0 && (
                          <>
                            <span className="text-richblack-400 line-through text-xs sm:text-sm">
                              ₹{getOriginalPrice()}
                            </span>
                            <span className="bg-green-900/30 text-green-100 px-2 py-1 rounded text-xs font-medium">
                              {Math.round(getBundleDiscount() * 100)}% OFF
                            </span>
                          </>
                        )}
                        <span className="text-yellow-50 font-bold text-base sm:text-lg md:text-xl">
                          ₹{getFinalPrice()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setSelectedCourses([])}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-richblack-300 hover:text-richblack-100 transition-colors text-sm sm:text-base"
                  >
                    <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                  
                  <button
                    onClick={handleProceedToBundle}
                    className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-50 to-yellow-25 text-richblack-900 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-yellow-25 hover:to-yellow-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Proceed to Checkout</span>
                    <span className="sm:hidden">Checkout</span>
                    <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Courses Preview (Desktop) */}
      {selectedCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-br from-richblack-800 to-richblack-900 rounded-2xl p-8 border border-richblack-700 hidden lg:block"
        >
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-richblack-5 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <FiShoppingCart className="text-yellow-50 text-lg sm:text-xl lg:text-2xl" />
            Your Bundle Preview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {selectedCourses.map((course) => (
              <div key={course._id} className="flex items-center gap-4 bg-richblack-700/50 p-4 rounded-xl border border-richblack-600">
                <img 
                  src={course.thumbnail} 
                  alt={course.courseName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-richblack-5 font-medium text-xs sm:text-sm truncate">{course.courseName}</p>
                  <p className="text-richblack-300 text-xs">
                    {course.courseType === 'Free' ? 'Free' : `₹${course.price}`}
                  </p>
                </div>
                <button
                  onClick={() => handleCourseSelect(course)}
                  className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default BundleCourseSection
