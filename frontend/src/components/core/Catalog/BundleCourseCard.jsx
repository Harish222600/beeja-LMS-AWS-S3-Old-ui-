import React from "react"
import RatingStars from "../../common/RatingStars"
import Img from '../../common/Img'
import { FiCheck } from "react-icons/fi"

function BundleCourseCard({ course, isSelected, onSelect, Height }) {
  const avgRating = course?.averageRating || 0
  const totalRatings = course?.totalRatings || 0

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl bg-richblack-800 border transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-2xl ${
        isSelected 
          ? 'border-yellow-50 shadow-lg shadow-yellow-50/20 ring-2 ring-yellow-50/30' 
          : 'border-richblack-700 hover:border-richblack-600'
      }`}
      onClick={() => onSelect(course)}
    >
      {/* Selection Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isSelected 
            ? 'bg-yellow-50 border-yellow-50 text-richblack-900' 
            : 'bg-richblack-800/80 border-richblack-400 backdrop-blur-sm'
        }`}>
          {isSelected && <FiCheck className="w-5 h-5 font-bold" />}
        </div>
      </div>

      {/* Course Image */}
      <div className="relative overflow-hidden">
        <Img
          src={course?.thumbnail}
          alt="course thumbnail"
          className={`${Height} w-full object-cover transition-transform duration-300 group-hover:scale-105`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-richblack-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Course Content */}
      <div className="p-6 space-y-4">
        {/* Course Title */}
        <h3 className="text-lg font-semibold text-richblack-5 line-clamp-2 group-hover:text-yellow-50 transition-colors duration-200">
          {course?.courseName}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-richblack-300 font-medium">
          By {course?.instructor?.firstName} {course?.instructor?.lastName}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-yellow-100 font-semibold text-sm">{avgRating.toFixed(1)}</span>
            <RatingStars Review_Count={avgRating} Star_Size={16} />
          </div>
          <span className="text-richblack-400 text-xs">
            ({totalRatings} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-richblack-700">
          <div className="flex items-center gap-2">
            {course?.courseType === 'Free' ? (
              <span className="text-lg font-bold text-caribbeangreen-100">Free</span>
            ) : (
              <span className="text-xl font-bold text-richblack-5">₹{course?.price}</span>
            )}
            {course?.courseType === 'Free' && course?.originalPrice && (
              <span className="text-sm text-richblack-400 line-through">
                ₹{course?.originalPrice}
              </span>
            )}
          </div>
          
          {/* Course Type Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            course?.courseType === 'Free' 
              ? 'bg-caribbeangreen-900/30 text-caribbeangreen-100 border border-caribbeangreen-700' 
              : 'bg-yellow-900/30 text-yellow-100 border border-yellow-700'
          }`}>
            {course?.courseType || 'Premium'}
          </span>
        </div>
      </div>

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-yellow-50/5 pointer-events-none" />
      )}
    </div>
  )
}

export default BundleCourseCard
