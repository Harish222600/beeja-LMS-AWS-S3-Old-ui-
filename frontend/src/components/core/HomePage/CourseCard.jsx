import React from "react";
import { motion } from "framer-motion";
import { HiUsers } from "react-icons/hi";
import { ImTree } from "react-icons/im";
import { FaRupeeSign } from "react-icons/fa";
import RatingStars from "../../common/RatingStars";
import { toast } from "react-hot-toast";

const CourseCard = ({ cardData, currentCard, setCurrentCard }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`w-full max-w-[330px] mx-auto h-[320px] sm:h-[360px] flex flex-col
        ${currentCard === cardData?.heading
          ? "bg-white shadow-lg shadow-yellow-50/50 border border-yellow-50/20"
          : "bg-richblack-800 hover:shadow-xl hover:shadow-yellow-50/10 border border-transparent hover:border-yellow-50/10"
        } rounded-xl overflow-hidden transition-all duration-300 cursor-pointer
        transform hover:-translate-y-2`}
      onClick={() => {
        if (cardData?.heading) {
          setCurrentCard(cardData.heading);
        } else {
          toast.error("Course information not available");
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (cardData?.heading) {
            setCurrentCard(cardData.heading);
          } else {
            toast.error("Course information not available");
          }
        }
      }}
    >
      {/* Thumbnail Section - Fixed Height */}
      <div className="relative h-32 sm:h-40 overflow-hidden flex-shrink-0 rounded-t-lg group">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300 z-10"></div>
        {cardData?.thumbnail ? (
          <img 
            src={cardData.thumbnail} 
            alt={cardData.heading}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-full h-full bg-gradient-to-br from-richblack-300 to-richblack-200 flex items-center justify-center"
          style={{ display: cardData?.thumbnail ? 'none' : 'flex' }}
        >
          <div className="text-center">
            
            <span className="text-richblack-300 text-sm font-medium">{cardData?.heading}</span>
          </div>
        </div>
        {/* Course Type Badge */}
        
      </div>

      {/* Content Section - Flexible Height */}
      <div className="p-2 sm:p-3 flex flex-col gap-1 flex-grow bg-gradient-to-b from-richblack-800 to-richblack-900">
        <h3 className={`font-semibold text-sm sm:text-base leading-tight mb-1
          ${currentCard === cardData?.heading ? "text-richblack-200" : "text-richblack-25"}`}>
          {cardData?.heading}
        </h3>

        <p className="text-richblack-400 text-xs sm:text-sm line-clamp-2 mb-2">
          {cardData?.description}
        </p>

        {/* Stats Row */}
        <div className={`flex items-center justify-between text-xs sm:text-sm
          ${currentCard === cardData?.heading ? "text-richblack-200" : "text-richblack-400"}`}>
          <div className="flex items-center gap-1">
            <HiUsers className="text-sm sm:text-lg" />
            <span>{cardData?.level || "Beginner"}</span>
          </div>
          
        </div>

        
          
          {/* Price Display */}
          {cardData?.price !== undefined && (
            <div className={`flex items-center font-bold text-base sm:text-lg
              ${currentCard === cardData?.heading ? "text-richblack-800" : "text-yellow-50"}`}>
              {cardData.price === 0 ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-caribbeangreen-300 to-caribbeangreen-200 bg-clip-text text-transparent">FREE</span>
                <span className="text-xs sm:text-sm text-richblack-400 line-through">
                  ₹{cardData?.originalPrice || cardData?.price || 1999}
                </span>
              </div>
              ) : (
                <>
                  <FaRupeeSign className="text-xs sm:text-sm" />
                  <span>{cardData.price.toLocaleString()}</span>
                </>
              )}
            </div>
          )}
        </div>

    </motion.div>
  );
};

export default CourseCard;
