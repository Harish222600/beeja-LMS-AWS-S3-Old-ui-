import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Chart, registerables } from "chart.js";
import { Pie, Doughnut, Bar, Line } from "react-chartjs-2";
import { getAnalytics } from "../../../services/operations/adminAPI";
import { 
  FaUsers, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUserShield,
  FaBookOpen,
  FaCalendarAlt
} from "react-icons/fa";

Chart.register(...registerables);

const Analytics = () => {
  const { token } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch analytics from backend API
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await getAnalytics(token);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Chart configurations
  const userDistributionData = analytics ? {
    labels: ['Students', 'Instructors', 'Admins'],
    datasets: [{
      data: [analytics.users.students, analytics.users.instructors, analytics.users.admins],
      backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  } : null;

  const courseTypeData = analytics ? {
    labels: ['Free Courses', 'Paid Courses'],
    datasets: [{
      data: [analytics.courses.free, analytics.courses.paid],
      backgroundColor: ['#10B981', '#3B82F6'],
      borderWidth: 0
    }]
  } : null;

  const courseStatusData = analytics ? {
    labels: ['Published', 'Draft'],
    datasets: [{
      data: [analytics.courses.published, analytics.courses.draft],
      backgroundColor: ['#10B981', '#F59E0B'],
      borderWidth: 0
    }]
  } : null;

  // User comparison bar chart
  const userComparisonData = analytics ? {
    labels: ['Students', 'Instructors', 'Admins'],
    datasets: [{
      label: 'User Count',
      data: [analytics.users.students, analytics.users.instructors, analytics.users.admins],
      backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
      borderColor: ['#2563EB', '#059669', '#DC2626'],
      borderWidth: 1
    }]
  } : null;

  // Course metrics bar chart
  const courseMetricsData = analytics ? {
    labels: ['Total', 'Published', 'Draft', 'Free', 'Paid'],
    datasets: [{
      label: 'Course Count',
      data: [
        analytics.courses.total,
        analytics.courses.published,
        analytics.courses.draft,
        analytics.courses.free,
        analytics.courses.paid
      ],
      backgroundColor: ['#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#3B82F6'],
      borderColor: ['#7C3AED', '#059669', '#D97706', '#0891B2', '#2563EB'],
      borderWidth: 1
    }]
  } : null;

  // Growth trend line chart (simulated based on current data)
  const growthTrendData = analytics ? {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Users',
        data: [
          Math.max(0, analytics.users.recentRegistrations - 15),
          Math.max(0, analytics.users.recentRegistrations - 10),
          Math.max(0, analytics.users.recentRegistrations - 5),
          analytics.users.recentRegistrations
        ],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'New Courses',
        data: [
          Math.max(0, analytics.courses.published - 8),
          Math.max(0, analytics.courses.published - 6),
          Math.max(0, analytics.courses.published - 3),
          analytics.courses.published
        ],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#F1F5F9'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(241, 245, 249, 0.1)'
        },
        ticks: {
          color: '#94A3B8'
        }
      },
      x: {
        grid: {
          color: 'rgba(241, 245, 249, 0.1)'
        },
        ticks: {
          color: '#94A3B8'
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#F1F5F9'
        }
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-50"></div>
    </div>
  );
  
  if (error) return (
    <div className="card-gradient rounded-xl p-6 glass-effect text-center">
      <p className="text-red-400 text-lg">{error}</p>
    </div>
  );
  
  if (!analytics) return null;

  return (
    <div className="fade-in-up space-y-8">
      {/* Header */}
      <div className="glass-effect p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
          Analytics Dashboard
        </h1>
        <p className="text-richblack-200 mt-2 opacity-75">
          Real-time insights into your platform performance
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
                {analytics.users.total}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <FaUsers className="text-yellow-50 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="metric-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300 mb-1">Students</p>
              <p className="text-3xl font-bold text-blue-400">{analytics.users.students}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <FaGraduationCap className="text-blue-400 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="metric-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300 mb-1">Instructors</p>
              <p className="text-3xl font-bold text-green-400">{analytics.users.instructors}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10">
              <FaChalkboardTeacher className="text-green-400 text-2xl" />
            </div>
          </div>
        </div>
        
        <div className="metric-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-purple-400">{analytics.courses.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10">
              <FaBookOpen className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Distribution Pie Chart */}
        <div className="card-gradient rounded-xl p-6 glass-effect">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 mb-4">
            User Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {userDistributionData && (
              <Pie data={userDistributionData} options={pieChartOptions} />
            )}
          </div>
        </div>

        {/* Course Type Distribution */}
        <div className="card-gradient rounded-xl p-6 glass-effect">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 mb-4">
            Course Types
          </h3>
          <div className="h-64 flex items-center justify-center">
            {courseTypeData && (
              <Doughnut data={courseTypeData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Course Status Distribution */}
        <div className="card-gradient rounded-xl p-6 glass-effect">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 mb-4">
            Course Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            {courseStatusData && (
              <Doughnut data={courseStatusData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-gradient rounded-xl p-6 glass-effect">
        <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 mb-6">
          Recent Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-yellow-50" />
              <div>
                <p className="text-sm text-richblack-300">New Registrations</p>
                <p className="text-lg font-semibold text-richblack-5">{analytics.users.recentRegistrations}</p>
                <p className="text-xs text-richblack-400">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="metric-card p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FaBookOpen className="text-blue-400" />
              <div>
                <p className="text-sm text-richblack-300">Published Courses</p>
                <p className="text-lg font-semibold text-richblack-5">{analytics.courses.published}</p>
                <p className="text-xs text-richblack-400">Active courses</p>
              </div>
            </div>
          </div>

          <div className="metric-card p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FaBookOpen className="text-green-400" />
              <div>
                <p className="text-sm text-richblack-300">Free Courses</p>
                <p className="text-lg font-semibold text-richblack-5">{analytics.courses.free}</p>
                <p className="text-xs text-richblack-400">Available for all</p>
              </div>
            </div>
          </div>

          <div className="metric-card p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FaUserShield className="text-red-400" />
              <div>
                <p className="text-sm text-richblack-300">Draft Courses</p>
                <p className="text-lg font-semibold text-richblack-5">{analytics.courses.draft}</p>
                <p className="text-xs text-richblack-400">Pending review</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Comparison Bar Chart */}
        <div className="card-gradient rounded-xl p-6 glass-effect">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 mb-4">
            User Type Comparison
          </h3>
          <div className="h-80">
            {userComparisonData && (
              <Bar data={userComparisonData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Course Metrics Bar Chart */}
        <div className="card-gradient rounded-xl p-6 glass-effect">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 mb-4">
            Course Metrics Overview
          </h3>
          <div className="h-80">
            {courseMetricsData && (
              <Bar data={courseMetricsData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Growth Trend Chart */}
      <div className="card-gradient rounded-xl p-6 glass-effect">
        <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 mb-4">
          Growth Trends
        </h3>
        <div className="h-80">
          {growthTrendData && (
            <Line data={growthTrendData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300 mb-1">Admin Users</p>
              <p className="text-3xl font-bold text-red-400">{analytics.users.admins}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10">
              <FaUserShield className="text-red-400 text-2xl" />
            </div>
          </div>
        </div>

        <div className="metric-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300 mb-1">Paid Courses</p>
              <p className="text-3xl font-bold text-blue-400">{analytics.courses.paid}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <FaBookOpen className="text-blue-400 text-2xl" />
            </div>
          </div>
        </div>

        <div className="metric-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-richblack-300 mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-400">{analytics.requests?.pendingAccessRequests || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <FaCalendarAlt className="text-yellow-400 text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
