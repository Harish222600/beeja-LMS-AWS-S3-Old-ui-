import { FaStar } from "react-icons/fa"
import { RiDeleteBin6Line } from "react-icons/ri"
import { FiClock, FiUsers, FiBookOpen } from "react-icons/fi"
import ReactStars from "react-rating-stars-component"
import { useDispatch, useSelector } from "react-redux"
import { removeFromCart } from "../../../../slices/cartSlice"
import Img from './../../../common/Img';

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart)
  const dispatch = useDispatch()

  return (
    <div className="space-y-4">
      {cart.map((course, indx) => (
        <div
          key={course._id}
          className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300"
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Course thumbnail */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative">
                  <Img
                    src={course?.thumbnail}
                    alt={course?.courseName}
                    className="h-32 w-full lg:w-48 rounded-xl object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-white line-clamp-2">
                    {course?.courseName}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                      {course?.category?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 font-semibold">4.5</span>
                      <ReactStars
                        count={5}
                        value={4.5}
                        size={16}
                        edit={false}
                        activeColor="#fbbf24"
                        emptyIcon={<FaStar />}
                        fullIcon={<FaStar />}
                      />
                    </div>
                    <span className="text-slate-400 text-sm">
                      ({course?.ratingAndReviews?.length || 0} reviews)
                    </span>
                  </div>

                  {/* Course Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
 
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-green-400" />
                      <span>2.5k students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiBookOpen className="w-4 h-4 text-purple-400" />
                      <span>24 lessons</span>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                    {course?.courseDescription || "Comprehensive course designed to help you master the fundamentals and advanced concepts."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-700/50">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      ₹ {course?.price}
                    </div>
                    <div className="text-sm text-slate-400 line-through">
                      ₹ {Math.round(course?.price * 1.5)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dispatch(removeFromCart(course._id))}
                      className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 hover:scale-105 transform"
                    >
                      <RiDeleteBin6Line className="text-lg group-hover/btn:animate-bounce" />
                      <span className="font-medium">Remove</span>
                    </button>
                    
                    <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                      In Cart
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 pt-4 border-t border-slate-700/30">
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                    <span>Course Progress</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-0 transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
