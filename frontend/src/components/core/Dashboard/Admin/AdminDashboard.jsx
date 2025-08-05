import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getAnalytics } from '../../../../services/operations/adminAPI'
import CourseAccessRequests from './CourseAccessRequests'
import IconBtn from '../../../common/IconBtn'

export default function AdminDashboard() {
  const { token } = useSelector((state) => state.auth)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('analytics') // ['analytics', 'accessRequests']

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    const result = await getAnalytics(token)
    if (result) {
      setAnalytics(result)
    }
    setLoading(false)
  }

  const tabData = [
    {
      id: 'analytics',
      label: 'Analytics',
    },
    {
      id: 'accessRequests',
      label: 'Access Requests',
      badge: analytics?.requests?.pendingAccessRequests || 0,
    },
  ]

  return (
    <div className="text-white">
      <div className="flex flex-col gap-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-x-4 border-b border-richblack-700 py-4">
          {tabData.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-x-2 px-4 py-2 rounded-t-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-richblack-700 text-yellow-50'
                  : 'text-richblack-300 hover:bg-richblack-700 hover:text-richblack-50'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-caribbeangreen-200 text-xs font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Analytics Section */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Stats */}
            <div className="bg-richblack-800 p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
              <div className="space-y-2">
                <p>Total Users: {analytics?.users?.total || 0}</p>
                <p>Students: {analytics?.users?.students || 0}</p>
                <p>Instructors: {analytics?.users?.instructors || 0}</p>
                <p>Admins: {analytics?.users?.admins || 0}</p>
                <p>New Users (30d): {analytics?.users?.recentRegistrations || 0}</p>
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-richblack-800 p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
              <div className="space-y-2">
                <p>Total Courses: {analytics?.courses?.total || 0}</p>
                <p>Published: {analytics?.courses?.published || 0}</p>
                <p>Draft: {analytics?.courses?.draft || 0}</p>
                <p>Free Courses: {analytics?.courses?.free || 0}</p>
                <p>Paid Courses: {analytics?.courses?.paid || 0}</p>
              </div>
            </div>

            {/* Access Request Stats */}
            <div className="bg-richblack-800 p-6 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Access Requests</h3>
              <div className="space-y-2">
                <p>Pending Requests: {analytics?.requests?.pendingAccessRequests || 0}</p>
                {analytics?.requests?.pendingAccessRequests > 0 && (
                  <IconBtn
                    text="View Requests"
                    onClick={() => setActiveTab('accessRequests')}
                    customClasses="mt-4"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Access Requests Section */}
        {activeTab === 'accessRequests' && <CourseAccessRequests />}
      </div>
    </div>
  )
}
