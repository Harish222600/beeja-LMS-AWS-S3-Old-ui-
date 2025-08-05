import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import RenderCartCourses from "./RenderCartCourses"
import RenderTotalAmount from "./RenderTotalAmount"
import { FiShoppingCart, FiShield, FiZap, FiDollarSign } from "react-icons/fi"

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart)
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in-up space-y-8 p-6">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-slate-400">
              Review and manage your selected courses
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-4 py-2 rounded-xl border border-purple-500/20 backdrop-blur-sm">
              <span className="text-sm font-semibold text-purple-400">
                {totalItems} {totalItems === 1 ? 'Course' : 'Courses'}
              </span>
            </div>
            <div className="animate-pulse-glow">
              <FiShoppingCart className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {total > 0 ? (
        <div className="flex flex-col-reverse items-start gap-8 lg:flex-row">
          {/* Course List */}
          <div className="flex-1 w-full space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                Course Details
              </h2>
              <RenderCartCourses />
            </div>
          </div>
          
          {/* Total Amount Card */}
          <div className="w-full lg:w-96 lg:sticky lg:top-6">
            <RenderTotalAmount />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
          <div className="relative">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
              <div className="relative w-full h-full text-slate-400 flex items-center justify-center">
                <FiShoppingCart className="w-16 h-16" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-3 text-center">
              Your cart is empty
            </h2>
            <p className="text-slate-400 mb-10 text-center max-w-md leading-relaxed">
              Discover amazing courses and start your learning journey today. Add courses to your cart and unlock your potential.
            </p>
            <button 
              onClick={() => navigate('/catalog')}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 text-white rounded-xl transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 hover:scale-105 transform"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-semibold">
                  Browse Courses
                </span>
                <svg className="w-5 h-5 text-blue-400 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Security Feature */}
        <div className="group bg-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-700/30 hover:bg-slate-800/50 hover:border-green-500/30 transition-all duration-300 hover:scale-105 transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
              <FiShield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Secure Payments</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your transactions are protected with industry-standard encryption and secure payment gateways
          </p>
        </div>

        {/* Money-back Guarantee */}
        <div className="group bg-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-700/30 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-105 transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <FiDollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Money-back Guarantee</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            30-day money-back guarantee if you're not completely satisfied with your purchase
          </p>
        </div>

        {/* Instant Access */}
        <div className="group bg-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-700/30 hover:bg-slate-800/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 transform">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <FiZap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Instant Access</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Get immediate access to your courses and start learning right after purchase
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      {total > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-md rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Checkout Progress</h3>
            <span className="text-sm text-slate-400">Step 1 of 3</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-1/3 transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Review Cart</span>
            <span>Payment</span>
            <span>Confirmation</span>
          </div>
        </div>
      )}
    </div>
  )
}
