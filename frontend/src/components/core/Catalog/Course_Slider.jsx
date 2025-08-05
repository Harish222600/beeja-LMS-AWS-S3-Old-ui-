import React from "react"
import Course_Card from "./Course_Card"

function Course_Slider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <div className="flex flex-col items-center xs:items-start">
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
            {Courses?.map((course, i) => (
              <div key={i} className="flex justify-center">
                <Course_Card 
                  course={course} 
                  Height={"h-[200px] sm:h-[220px] lg:h-[250px]"} 
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center xs:items-start">
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
            {/* Enhanced Skeleton Loading */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-richblack-700 rounded-xl overflow-hidden shadow-lg w-[280px] xs:w-[280px] sm:w-[330px] h-[380px] xs:h-[400px] sm:h-[420px]">
                  {/* Thumbnail Skeleton */}
                  <div className="h-36 xs:h-40 sm:h-44 bg-richblack-600"></div>
                  
                  {/* Content Skeleton */}
                  <div className="p-3 xs:p-4 sm:p-5 space-y-2 xs:space-y-3 sm:space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <div className="h-4 xs:h-5 bg-richblack-600 rounded w-3/4"></div>
                      <div className="h-4 xs:h-5 bg-richblack-600 rounded w-1/2"></div>
                    </div>
                    
                    {/* Instructor */}
                    <div className="h-3 xs:h-4 bg-richblack-600 rounded w-2/5"></div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-2 xs:gap-4">
                      <div className="h-2 xs:h-3 bg-richblack-600 rounded w-16 xs:w-20"></div>
                      <div className="h-2 xs:h-3 bg-richblack-600 rounded w-20 xs:w-24"></div>
                    </div>
                    
                    {/* Rating and Price */}
                    <div className="flex justify-between items-center pt-2 border-t border-richblack-700">
                      <div className="h-3 xs:h-4 bg-richblack-600 rounded w-20 xs:w-24"></div>
                      <div className="h-5 xs:h-6 bg-richblack-600 rounded w-12 xs:w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default Course_Slider
