import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sendOtp } from "../../../services/operations/authAPI"
import { setSignupData } from "../../../slices/authSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import Tab from "../../common/Tab"



function SignupForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // student or instructor
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const { firstName, lastName, email, password, confirmPassword } = formData;

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

  // Handle input fields, when some value changes
  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));

    // console.log('signup form data - ', formData);
  };

  // Handle Form Submission
  const handleOnSubmit = (e) => {
    e.preventDefault();

    // Validate password length
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return;
    }

    // Check password strength
    if (passwordStrength === "weak") {
      toast.error("Please choose a stronger password")
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match")
      return;
    }
    
    // Prepare data to send for signup
    // This data will be used to create user account after OTP verification
    const signupData = {
      ...formData,
      accountType,
    };

    // Setting signup data to state
    // To be used after otp verification
    dispatch(setSignupData(signupData));
    // Send OTP to user for verification
    dispatch(sendOtp(formData.email, navigate));

    // Reset form data
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setAccountType(ACCOUNT_TYPE.STUDENT);
  };

  // data to pass to Tab component
  const tabData = [
    {
      id: 1,
      tabName: "Student",
      type: ACCOUNT_TYPE.STUDENT,
    },
    {
      id: 2,
      tabName: "Instructor",
      type: ACCOUNT_TYPE.INSTRUCTOR,
    },
  ];

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

  return (
    <div>
      {/* Tab */}
      <Tab tabData={tabData} field={accountType} setField={setAccountType} />

      {/* Form */}
      <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4">
        <div className="flex gap-x-4">
          {/* First Name */}
          <label>
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              First Name <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleOnChange}
              placeholder="Enter first name"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 outline-none"
            />
          </label>

          {/* Last Name */}
          <label>
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Last Name <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleOnChange}
              placeholder="Enter last name"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 outline-none"
            />
          </label>
        </div>

        {/* Email Address */}
        <label className="w-full">
          <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
            Email Address <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            type="text"
            name="email"
            value={email}
            onChange={handleOnChange}
            placeholder="Enter email address"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
            className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5 outline-none"
          />
        </label>


        <div className="flex gap-x-4">
          {/* Create Password */}
          <label className="relative">
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Create Password <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleOnChange}
              placeholder="Enter Password"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5 outline-none"
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

          {/* Confirm Password  */}
          <label className="relative">
            <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
              Confirm Password <sup className="text-pink-200">*</sup>
            </p>
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleOnChange}
              placeholder="Confirm Password"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] pr-10 text-richblack-5 outline-none"
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
        </div>

        {confirmPassword && password !== confirmPassword && (
          <p className="text-red-500 text-sm">Passwords do not match</p>
        )}

        {password && (
          <div className="mt-2">
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


        <button
          type="submit"
          disabled={passwordStrength === "weak" || password !== confirmPassword || password.length < 8}
          className={`mt-6 rounded-[8px] py-[8px] px-[12px] font-medium transition-all duration-200
            ${passwordStrength === "weak" || password !== confirmPassword || password.length < 8
              ? 'bg-richblack-500 text-richblack-300 cursor-not-allowed'
              : 'bg-yellow-50 text-richblack-900 hover:bg-yellow-100'
            }`}
        >
          Create Account
        </button>
      </form>
    </div>
  )
}

export default SignupForm