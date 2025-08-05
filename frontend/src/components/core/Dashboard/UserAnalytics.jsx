import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAnalytics, getUserActivity } from "../../../services/operations/userAnalyticsAPI";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { FaGraduationCap, FaClock, FaTrophy, FaChartLine, FaFire, FaStar, FaRocket } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

export default function UserAnalytics() {
  const { token } = useSelector((state) => state.auth);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const analytics = await getUserAnalytics(token);
        const activity = await getUserActivity(token, selectedPeriod);
        console.log('Received analytics data:', analytics);
        console.log('Received activity data:', activity);
        
        if (!analytics?.courseProgress) {
          console.warn('No course progress data in analytics');
        }
        if (!analytics?.weeklyActivity) {
          console.warn('No weekly activity data in analytics');
        }
        
        setAnalyticsData(analytics);
        setActivityData(activity);
        setError(null);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError("Failed to load analytics data");
      }
      setLoading(false);
    };

    fetchData();
  }, [token, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-yellow-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-yellow-500 border-r-pink-500 border-b-purple-500 border-l-blue-500 rounded-full animate-spin animate-reverse"></div>
          <div className="absolute inset-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaChartLine className="text-white text-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900">
        <div className="text-center p-8 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl border border-red-500/20">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <p className="text-red-400 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  // Chart Data with vibrant colors and fallback for empty data
  const courseProgressData = {
    labels: analyticsData?.courseProgress?.length > 0 
      ? analyticsData.courseProgress.map(course => course.courseName)
      : ['No courses enrolled'],
    datasets: [{
      data: analyticsData?.courseProgress?.length > 0 
        ? analyticsData.courseProgress.map(course => course.progressPercentage)
        : [100],
      backgroundColor: analyticsData?.courseProgress?.length > 0 
        ? analyticsData.courseProgress.map((_, index) => [
            '#667eea',
            '#f093fb', 
            '#4facfe',
            '#43e97b',
            '#fa709a',
            '#a8edea',
            '#ff9a9e',
            '#ffecd2'
          ][index % 8])
        : ['#6B7280'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const weeklyActivityData = {
    labels: analyticsData?.weeklyActivity?.length > 0
      ? analyticsData.weeklyActivity.map(day => day.day)
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Hours Spent Learning',
      data: analyticsData?.weeklyActivity?.length > 0
        ? analyticsData.weeklyActivity.map(day => day.hours)
        : [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  // Log chart data for debugging
  console.log('Chart Data:', {
    courseProgress: courseProgressData,
    weeklyActivity: weeklyActivityData,
    rawAnalytics: analyticsData
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900 py-8 px-4 sm:px-6">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Enhanced Hero Header */}
      <div className="relative text-center mb-12 bg-gradient-to-r from-richblack-800/50 to-richblack-700/50 backdrop-blur-sm rounded-3xl p-8 border border-richblack-600/30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl"></div>
        <div className="relative">
          <div className="flex flex-col items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center animate-pulse shadow-2xl">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                <FaStar className="text-white text-sm" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
                📊 Learning Analytics 📈
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm text-richblack-100 bg-richblack-700/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <FaRocket className="text-yellow-400 animate-bounce text-sm" />
                <span className="font-medium">Track your learning journey and celebrate milestones!</span>
                <FaFire className="text-orange-400 animate-pulse text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stunning Overview Cards - Fixed Heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Enrolled Courses Card */}
        <div className="group relative h-48">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative h-full bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-3xl shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaGraduationCap className="text-white text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">📚 Enrolled Courses</p>
              <h3 className="text-3xl font-bold text-white">{analyticsData.overview.enrolledCourses}</h3>
              <p className="text-blue-200 text-xs">
                Knowledge Gaining
              </p>
            </div>
            
          </div>
        </div>

        {/* Learning Time Card */}
        <div className="group relative h-48">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative h-full bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-3xl shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaClock className="text-white text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">⏰ Learning Time</p>
              <h3 className="text-3xl font-bold text-white">
                {Math.floor(analyticsData.overview.totalLearningTime / 60)}h {Math.round(analyticsData.overview.totalLearningTime % 60)}m
              </h3>
              <p className="text-purple-200 text-xs">
                🔥 {analyticsData.learningStreak} day streak
              </p>
            </div>
            
          </div>
        </div>

        {/* Investment Card */}
        <div className="group relative h-48">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative h-full bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-3xl shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaTrophy className="text-white text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-green-200 text-xs font-semibold uppercase tracking-wider mb-1">💰 Investment</p>
              <h3 className="text-3xl font-bold text-white">
                ₹{analyticsData.overview.totalSpent.toLocaleString()}
              </h3>
              <p className="text-green-200 text-xs">
                💎 Smart investment in knowledge
              </p>
            </div>
            
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="group relative h-48">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative h-full bg-gradient-to-br from-orange-600 to-red-600 p-4 rounded-3xl shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="text-white text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-semibold uppercase tracking-wider mb-1">🎯 Success Rate</p>
              <h3 className="text-3xl font-bold text-white mb-2">
                {analyticsData.overview.completionRate}%
              </h3>
              <p className="text-white text-sm">
                🌟 Overall completion rate
              </p>
            </div>
            {/* <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${analyticsData.overview.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-white text-xs font-medium">
                  {analyticsData.overview.completionRate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>{analyticsData.overview.completedVideos} completed</span>
                <span>{analyticsData.overview.totalVideos} total</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Login History */}
        <div className="relative bg-gradient-to-br from-richblack-800/80 to-richblack-700/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-richblack-600/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl">🔐</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Recent Activity History
                </h3>
                <p className="text-richblack-300 text-sm">Your latest learning activities</p>
              </div>
            </div>
            <div className="h-80 overflow-y-auto scrollbar-thin scrollbar-track-richblack-700 scrollbar-thumb-richblack-600">
              {analyticsData?.loginHistory?.length > 0 ? (
                analyticsData.loginHistory.map((activity, index) => (
                  <div 
                    key={index}
                    className="mb-4 p-4 bg-richblack-700/30 rounded-xl border border-richblack-600/30 hover:border-richblack-500/50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            activity.type === 'progress' ? 'bg-blue-400' : 
                            activity.type === 'enrollment' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></span>
                          <p className="text-sm font-medium text-richblack-25">{activity.action}</p>
                        </div>
                        <p className="text-xs text-richblack-300 ml-4">{activity.details}</p>
                        {activity.amount && (
                          <p className="text-xs text-green-400 ml-4 mt-1">Amount: ₹{activity.amount}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-richblack-400">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-richblack-500">
                          {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-richblack-400">
                  <div className="w-16 h-16 bg-richblack-700 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-lg mb-2">No Recent Activity</p>
                  <p className="text-sm text-center">Start learning or enroll in courses to see your activity here!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="relative bg-gradient-to-br from-richblack-800/80 to-richblack-700/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-richblack-600/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl">📈</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Weekly Learning Activity
                </h3>
                <p className="text-richblack-300 text-sm">Your daily learning patterns</p>
              </div>
            </div>
            <div className="h-80">
              <Line 
                data={weeklyActivityData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(241, 245, 249, 0.1)', drawBorder: false },
                      ticks: { color: '#94A3B8', font: { size: 12, weight: '500' } }
                    },
                    x: {
                      grid: { color: 'rgba(241, 245, 249, 0.1)', drawBorder: false },
                      ticks: { color: '#94A3B8', font: { size: 12, weight: '500' } }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#F1F5F9', font: { size: 13, weight: '600' } }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      titleColor: '#F1F5F9',
                      bodyColor: '#F1F5F9',
                      borderColor: '#4F46E5',
                      borderWidth: 2,
                      cornerRadius: 12,
                      padding: 12
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
