import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { HiUsers } from "react-icons/hi"
import { FaRupeeSign, FaClock } from "react-icons/fa"

import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';

function Course_Card({ course, Height, bundleMode = false, isSelected = false, onSelect = null, selectionText = "Click to Select" }) {
  // Return null if no course data is provided
  if (!course) {
    return null;
  }

  // Use the averageRating from backend instead of calculating it on frontend
  const avgRating = course?.averageRating || 0
  const totalRatings = course?.totalRatings || 0

  const handleClick = (e) => {
    if (bundleMode && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect();
    }
  };

  const cardContent = (
    <div className={`bg-richblack-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-yellow-50/10 
      transition-all duration-300 h-full flex flex-col border border-transparent hover:border-yellow-50/10 relative ${
      bundleMode ? 'cursor-pointer' : ''
    } ${isSelected ? 'ring-2 ring-yellow-50 ring-offset-2 ring-offset-richblack-900' : ''}`}>
      {/* Thumbnail Section - Fixed Height */}
      <div className="relative overflow-hidden h-36 xs:h-40 sm:h-44 flex-shrink-0 group">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300 z-10"></div>
        {course?.thumbnail ? (
          <Img
            src={course?.thumbnail}
            alt="course thumbnail"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
            <span className="text-richblack-400 text-sm">No Image</span>
          </div>
        )}
        {/* Course Type Badge */}
        <div className={`absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 z-20 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full font-bold text-[10px] xs:text-xs
          ${course?.courseType === 'Free' || course?.adminSetFree
            ? "bg-gradient-to-r from-caribbeangreen-300 to-caribbeangreen-200 text-caribbeangreen-800" 
            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"} 
          backdrop-blur-sm shadow-md`}>
          {course?.courseType === 'Free' || course?.adminSetFree ? "FREE" : "PREMIUM"}
        </div>
      </div>
      
      {/* Content Section - Flexible Height */}
      <div className="flex flex-col gap-1.5 xs:gap-2 sm:gap-3 p-3 xs:p-4 sm:p-5 flex-grow bg-gradient-to-b from-richblack-800 to-richblack-900">
        <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-richblack-5 line-clamp-2 group-hover:text-yellow-50 transition-colors duration-200 leading-tight">
          {course?.courseName}
        </h3>
        
        <p className="text-[10px] xs:text-xs sm:text-sm text-richblack-200">
          By <span className="text-yellow-50 font-medium">
            {course?.instructor?.firstName} {course?.instructor?.lastName}
          </span>
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 text-[10px] xs:text-xs text-richblack-400">
          <div className="flex items-center gap-1">
            <HiUsers className="text-sm" />
            <span>{course?.studentsEnrolled?.length || 0} students</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="text-sm" />
            <span>{course?.totalDuration || '0 hours'}</span>
          </div>
        </div>
        
        {/* Rating Row */}
        <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
          <span className="text-yellow-50 text-xs xs:text-sm font-medium">{avgRating.toFixed(1)}</span>
          <RatingStars Review_Count={avgRating} />
          <span className="text-richblack-400 text-[10px] xs:text-xs sm:text-sm">
            ({totalRatings} {totalRatings === 1 ? 'Rating' : 'Ratings'})
          </span>
        </div>
        
        {/* Price Row */}
        <div className="flex items-center gap-1.5 xs:gap-2 pt-2 xs:pt-3 mt-auto border-t border-richblack-700/50">
            {course?.courseType === 'Free' || course?.adminSetFree ? (
              <div className="flex items-center gap-3">
                <span className="text-base xs:text-lg font-bold bg-gradient-to-r from-caribbeangreen-300 to-caribbeangreen-200 bg-clip-text text-transparent">FREE</span>
                <span className="text-xs xs:text-sm text-richblack-400 line-through">
                  ₹{course?.price || course?.originalPrice }
                </span>
              </div>
            ) : (
              <>
                {course?.originalPrice && course?.originalPrice !== course?.price && (
                  <span className="text-xs xs:text-sm text-richblack-400 line-through">
                    ₹{course.originalPrice}
                  </span>
                )}
                <div className="flex items-center text-yellow-50 font-bold">
                  <FaRupeeSign className="text-sm" />
                  <span className="text-base xs:text-lg">{course?.price}</span>
                </div>
              </>
            )}
        </div>
      </div>
      
      {/* Bundle Mode Selection Overlay */}
      {bundleMode && (
        <>
          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute top-3 right-3 bg-yellow-50 text-richblack-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm z-[60] shadow-lg">
              ✓
            </div>
          )}
          {/* Selection Overlay */}
          <div className="absolute inset-0 bg-yellow-50/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-[55] pointer-events-none">
            <div className="bg-richblack-900/90 text-white px-4 py-2 rounded-lg font-medium shadow-lg backdrop-blur-sm">
              {isSelected ? 'Selected' : selectionText}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={bundleMode ? {} : { 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`z-50 group transition-all duration-300 w-full xs:w-[280px] sm:w-[330px] h-[380px] xs:h-[400px] sm:h-[420px] ${
        bundleMode ? '' : 'transform hover:-translate-y-2'
      }`}
      onClick={handleClick}
    >
      {bundleMode ? (
        cardContent
      ) : (
        <Link to={course._id ? `/courses/${course._id}` : "#"}>
          {cardContent}
        </Link>
      )}
    </motion.div>
  )
}

export default Course_Card
