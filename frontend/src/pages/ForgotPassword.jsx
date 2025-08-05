import React, { useState, useEffect } from "react"
import { BiArrowBack } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { getPasswordResetToken } from "../services/operations/authAPI"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)

  useEffect(() => {
    let timer
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendTimer])

  const handleOnSubmit = (e) => {
    e.preventDefault()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    dispatch(getPasswordResetToken(email, setEmailSent))
    setResendTimer(60) // Set 60 seconds cooldown for resend
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-richblack-900">
      <div className="max-w-[500px] p-4 lg:p-8">
        <div className="flex flex-col items-center">
          <h1 className="text-[2rem] font-bold leading-[2.375rem] text-richblack-5 text-center">
            {!emailSent ? "Reset your password" : "Check your email"}
          </h1>
          
          <div className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100 text-center">
            {!emailSent ? (
              <p>
                Enter your email address and we'll send you instructions to reset your password.
                <br />
                <span className="text-sm text-richblack-200">
                  Make sure to check your spam folder if you don't see the email.
                </span>
              </p>
            ) : (
              <div>
                <p className="mb-2">
                  Password reset instructions have been sent to:
                  <br />
                  <span className="text-yellow-50 font-semibold">{email}</span>
                </p>
                <p className="text-sm text-richblack-200">
                  Please check both your inbox and spam folder.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleOnSubmit} className="w-full">
            {!emailSent && (
              <label className="w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                  Email Address <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 border border-richblack-700 focus:border-yellow-50 focus:outline-none"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading || (emailSent && resendTimer > 0)}
              className={`mt-6 w-full rounded-[8px] py-[12px] px-[12px] font-medium 
                ${loading || (emailSent && resendTimer > 0)
                  ? 'bg-richblack-500 text-richblack-300 cursor-not-allowed'
                  : 'bg-yellow-50 text-richblack-900 hover:bg-yellow-100 transition-all duration-200'
                }`}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : emailSent ? (
                resendTimer > 0 ? (
                  `Resend available in ${resendTimer}s`
                ) : (
                  "Resend Email"
                )
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <Link 
              to="/login"
              className="flex items-center gap-x-2 text-richblack-5 hover:text-yellow-50 transition-all duration-200"
            >
              <BiArrowBack /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
