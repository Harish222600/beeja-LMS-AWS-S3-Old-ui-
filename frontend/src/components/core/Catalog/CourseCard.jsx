import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUsers } from 'react-icons/hi';
import { FaRupeeSign, FaClock } from 'react-icons/fa';
import RatingStars from '../../common/RatingStars';
import { toast } from 'react-hot-toast';

export default function CourseCard({ course, Height = "h-auto" }) {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (course?._id) {
      navigate(`/courses/${course._id}`);
    } else {
      toast.error("Course information not available");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`bg-richblack-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl 
        hover:shadow-yellow-50/10 transition-all duration-300 cursor-pointer 
        transform hover:-translate-y-2 w-[330px] h-[420px] flex flex-col mx-auto
        border border-transparent hover:border-yellow-50/10`}
      onClick={(e) => {
        // Prevent navigation if clicking on the overlay or request button
        if (e.target.closest('.overlay-content')) {
          e.stopPropagation();
          return;
        }
        handleCardClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
    >
      {/* Thumbnail Section - Fixed Height */}
      <div className="relative h-44 overflow-hidden flex-shrink-0 group">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300 z-10"></div>
        {course?.thumbnail ? (
          <img
            src={course?.thumbnail}
            alt={course?.courseName}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-richblack-700 flex items-center justify-center">
            <span className="text-richblack-400 text-sm">No Image</span>
          </div>
        )}
        {/* Course Type Badge */}
        <div className={`absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full font-bold text-xs
          ${course?.courseType === 'Free' || course?.adminSetFree
            ? "bg-gradient-to-r from-caribbeangreen-300 to-caribbeangreen-200 text-caribbeangreen-800" 
            : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"} 
          backdrop-blur-sm shadow-md`}>
          {course?.courseType === 'Free' || course?.adminSetFree ? "FREE" : "PREMIUM"}
        </div>

      </div>
      
      {/* Content Section - Flexible Height */}
      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-richblack-800 to-richblack-900">
        <h3 className="text-lg font-semibold text-richblack-5 mb-2 line-clamp-2 leading-tight group-hover:text-yellow-50 transition-colors duration-300">
          {course?.courseName}
        </h3>
        
        <p className="text-sm text-richblack-300 mb-3 line-clamp-2">
          {course?.courseDescription}
        </p>

        {/* Instructor */}
        <p className="text-sm text-richblack-200 mb-3">
          By <span className="text-yellow-50 font-medium">
            {course?.instructor?.firstName} {course?.instructor?.lastName}
          </span>
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-richblack-300 mb-3">
          <div className="flex items-center gap-1">
            <HiUsers className="text-sm" />
            <span>{course?.studentsEnrolled?.length || 0} students</span>
          </div>
          <div className="flex items-center gap-1">
            <FaClock className="text-sm" />
            <span>{course?.totalDuration || "0m"}</span>
          </div>
        </div>

        {/* Rating and Price Row */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-richblack-700/50">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <RatingStars rating={course?.averageRating || 0} />
            <span className="text-yellow-50 text-sm">
              ({course?.totalRatings || 0})
            </span>
          </div>

          {/* Price */}
          <div className="text-right">
            {course?.courseType === 'Free' || course?.adminSetFree ? (
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold bg-gradient-to-r from-caribbeangreen-300 to-caribbeangreen-200 bg-clip-text text-transparent">FREE</span>
                <span className="text-sm text-richblack-300 line-through">
                  ₹{course?.price || course?.originalPrice}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {course?.originalPrice && course?.originalPrice !== course?.price && (
                  <span className="text-sm text-richblack-400 line-through">
                    ₹{course.originalPrice}
                  </span>
                )}
                <div className="flex items-center text-yellow-50 font-bold">
                  <FaRupeeSign className="text-sm" />
                  <span className="text-lg">{course?.price}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
