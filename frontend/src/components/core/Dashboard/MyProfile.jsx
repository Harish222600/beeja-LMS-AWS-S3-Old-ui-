import { useEffect } from "react"
import { useSelector } from "react-redux"
import { formatDate, formatDateShort } from "../../../utils/dateFormatter"
import Img from './../../common/Img';

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-slate-400 mt-2">
          Manage your personal information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
            <div className="relative">
              <Img
                src={user?.image}
                alt={`profile-${user?.firstName}`}
                className="w-28 h-28 rounded-2xl object-cover ring-2 ring-purple-500/20"
              />
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-white capitalize">
              {user?.firstName + " " + user?.lastName}
            </h2>
            <p className="text-slate-400 mt-2 break-all sm:break-words text-sm sm:text-base">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          <h3 className="text-xl font-semibold text-white">About</h3>
        </div>
        <p className={`${user?.additionalDetails?.about ? "text-slate-300" : "text-slate-500"} text-sm leading-relaxed`}>
          {user?.additionalDetails?.about ?? "Write Something About Yourself"}
        </p>
      </div>

      {/* Personal Details */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          <h3 className="text-xl font-semibold text-white">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <DetailCard 
              label="First Name"
              value={user?.firstName}
              icon="👤"
            />
            <DetailCard 
              label="Account Type"
              value={user?.accountType}
              icon="🎓"
            />
            <DetailCard 
              label="Email"
              value={user?.email}
              icon="📧"
            />
            <DetailCard 
              label="Gender"
              value={user?.additionalDetails?.gender ?? "Add Gender"}
              icon="⚥"
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <DetailCard 
              label="Last Name"
              value={user?.lastName}
              icon="👤"
            />
            <DetailCard 
              label="Phone Number"
              value={user?.additionalDetails?.contactNumber ?? "Add Contact Number"}
              icon="📱"
            />
            <DetailCard 
              label="Date Of Birth"
              value={formatDateShort(user?.additionalDetails?.dateOfBirth) ?? "Add Date Of Birth"}
              icon="🎂"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Component for Detail Cards
function DetailCard({ label, value, icon }) {
  // Check if this is an email field to apply different styling
  const isEmail = label === "Email";
  
  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50 hover:border-slate-700/50 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
      </div>
      <div className="pl-0">
        <p className={`text-sm sm:text-base font-medium text-white ${
          isEmail 
            ? "break-all sm:break-words lowercase" 
            : "capitalize break-words"
        }`}>
          {value}
        </p>
      </div>
    </div>
  )
}
