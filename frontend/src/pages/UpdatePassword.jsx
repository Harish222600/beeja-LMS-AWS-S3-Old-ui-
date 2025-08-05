import { useState, useEffect } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { BiArrowBack } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { resetPassword } from "../services/operations/authAPI"

function UpdatePassword() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const { loading } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState("")
  const [tokenValid, setTokenValid] = useState(null)

  const { password, confirmPassword } = formData

  // Check password strength
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength("")
    } else {
      const hasLower = /[a-z]/.test(password)
      const hasUpper = /[A-Z]/.test(password)
      const hasNumber = /\d/.test(password)
      const hasSpecial = /[@$!%*?&]/.test(password)
      const isLongEnough = password.length >= 8

      if (!isLongEnough) {
        setPasswordStrength("weak")
      } else if (hasLower && hasUpper && hasNumber && hasSpecial) {
        setPasswordStrength("strong")
      } else if ((hasLower || hasUpper) && hasNumber) {
        setPasswordStrength("medium")
      } else {
        setPasswordStrength("weak")
      }
    }
  }, [password])

  // Verify token on component mount
  useEffect(() => {
    const token = location.pathname.split("/").at(-1)
    if (!token || token === "update-password") {
      setTokenValid(false)
      toast.error("Invalid reset link. Please request a new password reset.")
      setTimeout(() => navigate("/forgot-password"), 2000)
    } else {
      setTokenValid(true)
    }
  }, [location, navigate])

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    
    // Validate password length
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    // Check password strength
    if (passwordStrength === "weak") {
      toast.error("Please choose a stronger password")
      return
    }

    const token = location.pathname.split("/").at(-1)
    dispatch(resetPassword(password, confirmPassword, token, navigate))
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak": return "text-red-500"
      case "medium": return "text-yellow-500"
      case "strong": return "text-green-500"
      default: return ""
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case "weak": return "Weak - Add more characters and complexity"
      case "medium": return "Medium - Add special characters for better security"
      case "strong": return "Strong password ✓"
      default: return ""
    }
  }

  const getPasswordRequirements = () => {
    const requirements = [
      { text: "At least 8 characters", met: password.length >= 8 },
      { text: "One lowercase letter", met: /[a-z]/.test(password) },
      { text: "One uppercase letter", met: /[A-Z]/.test(password) },
      { text: "One number", met: /\d/.test(password) },
      { text: "One special character (@$!%*?&)", met: /[@$!%*?&]/.test(password) },
    ]
    return requirements
  }

  if (tokenValid === false) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-richblack-900">
        <div className="max-w-[500px] p-4 lg:p-8 text-center">
          <h1 className="text-[2rem] font-bold text-red-500 mb-4">Invalid Reset Link</h1>
          <p className="text-richblack-100 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link 
            to="/forgot-password"
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-100 transition-all duration-200"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-richblack-900">
      <div className="max-w-[500px] p-4 lg:p-8">
        <div className="flex flex-col items-center">
          <h1 className="text-[2rem] font-bold leading-[2.375rem] text-richblack-5 text-center mb-2">
            Choose new password
          </h1>

          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100 text-center">
            Almost done. Enter your new password and you're all set.
          </p>

          <form onSubmit={handleOnSubmit} className="w-full">
            <label className="relative block mb-4">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                New Password <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleOnChange}
                placeholder="Enter new password"
                style={{
                  boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
                className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 border border-richblack-700 focus:border-yellow-50 focus:outline-none pr-12"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                ) : (
                  <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                )}
              </span>
            </label>

            {password && (
              <div className="mb-4">
                <p className={`text-sm mb-2 ${getPasswordStrengthColor()}`}>
                  {getPasswordStrengthText()}
                </p>
                <div className="space-y-1">
                  {getPasswordRequirements().map((req, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <span className={`mr-2 ${req.met ? 'text-green-500' : 'text-richblack-400'}`}>
                        {req.met ? '✓' : '○'}
                      </span>
                      <span className={req.met ? 'text-green-500' : 'text-richblack-400'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="relative block mb-6">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Confirm New Password <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                placeholder="Confirm new password"
                style={{
                  boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
                className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 border border-richblack-700 focus:border-yellow-50 focus:outline-none pr-12"
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                ) : (
                  <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                )}
              </span>
            </label>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mb-4">Passwords do not match</p>
            )}

            <button
              type="submit"
              disabled={loading || passwordStrength === "weak" || password !== confirmPassword}
              className={`w-full rounded-[8px] py-[12px] px-[12px] font-medium transition-all duration-200
                ${loading || passwordStrength === "weak" || password !== confirmPassword
                  ? 'bg-richblack-500 text-richblack-300 cursor-not-allowed'
                  : 'bg-yellow-50 text-richblack-900 hover:bg-yellow-100'
                }`}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                "Reset Password"
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

export default UpdatePassword
