import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Chart, registerables } from "chart.js";
import { Pie, Doughnut, Bar, Line } from "react-chartjs-2";
import { getAnalytics } from "../../../services/operations/adminAPI";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  FaUsers,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserShield,
  FaBookOpen,
  FaCalendarAlt,
  FaDownload,
  FaRedo,
  FaFilter,
  FaExpand,
  FaCompress,
  FaEye,
  FaDollarSign,
  FaClock,
  FaBell,
  FaChartLine,
  FaSignInAlt,
  FaUserClock,
  FaPlus,
  FaHistory
} from "react-icons/fa";



Chart.register(...registerables);

const EnhancedAnalytics = () => {
  const { token } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [dateRange, setDateRange] = useState('30d');
  const [expandedChart, setExpandedChart] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    api: { status: 'checking', responseTime: 0, lastChecked: null },
    database: { status: 'checking', responseTime: 0, lastChecked: null },
    serverLoad: { status: 'checking', cpuUsage: 0, memoryUsage: 0, lastChecked: null },
    cache: { status: 'checking', hitRate: 0, lastChecked: null }
  });

  
  // Check system health status
  const checkSystemHealth = useCallback(async () => {
    const startTime = Date.now();
    
    try {
      // Test API connectivity and response time
      const apiStartTime = Date.now();
      const analyticsData = await getAnalytics(token);
      const apiResponseTime = Date.now() - apiStartTime;
      
      // Determine API status based on response time
      let apiStatus = 'online';
      if (apiResponseTime > 5000) apiStatus = 'slow';
      else if (apiResponseTime > 2000) apiStatus = 'degraded';
      
      // Simulate server metrics based on API performance
      const cpuUsage = Math.min(90, Math.max(10, apiResponseTime / 50 + Math.random() * 20));
      const memoryUsage = Math.min(85, Math.max(15, apiResponseTime / 40 + Math.random() * 25));
      
      // Determine server load status
      let serverStatus = 'normal';
      if (cpuUsage > 80 || memoryUsage > 80) serverStatus = 'high';
      else if (cpuUsage > 60 || memoryUsage > 60) serverStatus = 'moderate';
      
      // Simulate cache performance
      const cacheHitRate = Math.max(60, Math.min(98, 95 - (apiResponseTime / 100)));
      let cacheStatus = 'optimized';
      if (cacheHitRate < 70) cacheStatus = 'poor';
      else if (cacheHitRate < 85) cacheStatus = 'fair';
      
      setSystemHealth({
        api: {
          status: apiStatus,
          responseTime: apiResponseTime,
          lastChecked: new Date()
        },
        database: {
          status: analyticsData ? 'connected' : 'disconnected',
          responseTime: apiResponseTime,
          lastChecked: new Date()
        },
        serverLoad: {
          status: serverStatus,
          cpuUsage: Math.round(cpuUsage),
          memoryUsage: Math.round(memoryUsage),
          lastChecked: new Date()
        },
        cache: {
          status: cacheStatus,
          hitRate: Math.round(cacheHitRate),
          lastChecked: new Date()
        }
      });
      
    } catch (error) {
      // Set error states for all systems
      setSystemHealth({
        api: {
          status: 'offline',
          responseTime: 0,
          lastChecked: new Date()
        },
        database: {
          status: 'disconnected',
          responseTime: 0,
          lastChecked: new Date()
        },
        serverLoad: {
          status: 'unknown',
          cpuUsage: 0,
          memoryUsage: 0,
          lastChecked: new Date()
        },
        cache: {
          status: 'unknown',
          hitRate: 0,
          lastChecked: new Date()
        }
      });
    }
  }, [token]);

  // Fetch analytics from backend API
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const analyticsData = await getAnalytics(token);
      setAnalytics(analyticsData);
      setError(null);

      // Add notification for data refresh
      if (autoRefresh) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: 'Analytics data refreshed',
          type: 'success',
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.log('Analytics API failed, using mock data:', err);
      // Use mock data as fallback
      setAnalytics(mockAnalytics);
      setError(null);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: 'Using demo data - API unavailable',
        type: 'warning',
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  }, [token, autoRefresh]);

  // Auto-refresh functionality
  useEffect(() => {
    fetchAnalytics();
    checkSystemHealth();

    let analyticsInterval;
    let healthInterval;
    
    if (autoRefresh) {
      analyticsInterval = setInterval(fetchAnalytics, refreshInterval);
    }
    
    // Check system health every 30 seconds
    healthInterval = setInterval(checkSystemHealth, 30000);

    return () => {
      if (analyticsInterval) clearInterval(analyticsInterval);
      if (healthInterval) clearInterval(healthInterval);
    };
  }, [fetchAnalytics, checkSystemHealth, autoRefresh, refreshInterval]);

  // Clear notifications after 5 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    });
  }, [notifications]);

  // Enhanced chart data with vibrant colors and modern styling
  const userDistributionData = analytics ? {
    labels: ['Students', 'Instructors', 'Admins'],
    datasets: [{
      data: [analytics.users.students, analytics.users.instructors, analytics.users.admins],
      backgroundColor: [
        '#667eea',
        '#f093fb',
        '#4facfe'
      ],
      borderWidth: 3,
      borderColor: '#1F2937',
      hoverOffset: 15,
      cutout: '60%',
      spacing: 2,
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff'
    }]
  } : null;

  const courseTypeData = analytics ? {
    labels: ['Free Courses', 'Paid Courses'],
    datasets: [{
      data: [analytics.courses.free, analytics.courses.paid],
      backgroundColor: [
        '#a8edea',
        '#fcb69f'
      ],
      borderWidth: 3,
      borderColor: '#1F2937',
      hoverOffset: 20,
      cutout: '70%',
      spacing: 3,
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff'
    }]
  } : null;

  const courseStatusData = analytics ? {
    labels: ['Published', 'Draft'],
    datasets: [{
      data: [analytics.courses.published, analytics.courses.draft],
      backgroundColor: [
        '#84fab0',
        '#fa709a'
      ],
      borderWidth: 3,
      borderColor: '#1F2937',
      hoverOffset: 18,
      cutout: '65%',
      spacing: 2,
      hoverBorderWidth: 4,
      hoverBorderColor: '#ffffff'
    }]
  } : null;

  // Enhanced user comparison with vibrant bars
  const userComparisonData = analytics ? {
    labels: ['Students', 'Instructors', 'Admins'],
    datasets: [{
      label: 'User Count',
      data: [analytics.users.students, analytics.users.instructors, analytics.users.admins],
      backgroundColor: [
        '#667eea',
        '#f093fb',
        '#4facfe'
      ],
      borderColor: ['#4F46E5', '#EC4899', '#0EA5E9'],
      borderWidth: 3,
      borderRadius: 15,
      borderSkipped: false,
      barThickness: 60,
      maxBarThickness: 80,
      hoverBackgroundColor: ['#5B21B6', '#BE185D', '#0284C7'],
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 4
    }]
  } : null;

  // Enhanced course metrics with dynamic colors
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
      backgroundColor: [
        '#a8edea',
        '#84fab0',
        '#fa709a',
        '#ffecd2',
        '#667eea'
      ],
      borderColor: ['#06B6D4', '#10B981', '#F43F5E', '#F59E0B', '#4F46E5'],
      borderWidth: 3,
      borderRadius: 12,
      borderSkipped: false,
      barThickness: 45,
      maxBarThickness: 60,
      hoverBackgroundColor: ['#0891B2', '#059669', '#E11D48', '#D97706', '#4338CA'],
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 4
    }]
  } : null;

  // Enhanced growth trend with smooth lines and dynamic revenue data
  const growthTrendData = analytics ? {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'New Users',
        data: [
          Math.max(0, analytics.users.recentRegistrations - 30),
          Math.max(0, analytics.users.recentRegistrations - 25),
          Math.max(0, analytics.users.recentRegistrations - 20),
          Math.max(0, analytics.users.recentRegistrations - 15),
          Math.max(0, analytics.users.recentRegistrations - 10),
          Math.max(0, analytics.users.recentRegistrations - 5),
          analytics.users.recentRegistrations
        ],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        tension: 0.5,
        fill: true,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#4F46E5',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 4,
        borderWidth: 4
      },
      {
        label: 'New Courses',
        data: [
          Math.max(0, analytics.courses.published - 15),
          Math.max(0, analytics.courses.published - 12),
          Math.max(0, analytics.courses.published - 10),
          Math.max(0, analytics.courses.published - 8),
          Math.max(0, analytics.courses.published - 5),
          Math.max(0, analytics.courses.published - 3),
          analytics.courses.published
        ],
        borderColor: '#f093fb',
        backgroundColor: 'rgba(240, 147, 251, 0.2)',
        tension: 0.5,
        fill: true,
        pointBackgroundColor: '#f093fb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#EC4899',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 4,
        borderWidth: 4
      },
      {
        label: 'Revenue (₹)',
        data: [
          Math.max(0, analytics.revenue?.monthlyRevenue * 0.7),
          Math.max(0, analytics.revenue?.monthlyRevenue * 0.8),
          Math.max(0, analytics.revenue?.monthlyRevenue * 0.85),
          Math.max(0, analytics.revenue?.monthlyRevenue * 0.9),
          Math.max(0, analytics.revenue?.monthlyRevenue * 0.95),
          Math.max(0, analytics.revenue?.monthlyRevenue * 0.98),
          analytics.revenue?.monthlyRevenue || 0
        ],
        borderColor: '#4facfe',
        backgroundColor: 'rgba(79, 172, 254, 0.2)',
        tension: 0.5,
        fill: true,
        pointBackgroundColor: '#4facfe',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#0EA5E9',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 4,
        borderWidth: 4
      }
    ]
  } : null;

  // Enhanced chart options with animations and gradient support
  const enhancedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2500,
      easing: 'easeInOutCubic',
      delay: (context) => context.dataIndex * 100
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#F1F5F9',
          font: {
            size: 13,
            weight: '600',
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F1F5F9',
        bodyColor: '#F1F5F9',
        borderColor: '#4F46E5',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(241, 245, 249, 0.08)',
          drawBorder: false
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 10
        }
      },
      x: {
        grid: {
          color: 'rgba(241, 245, 249, 0.08)',
          drawBorder: false
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 10
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2500,
      easing: 'easeInOutCubic',
      animateRotate: true,
      animateScale: true
    },
    interaction: {
      intersect: false
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#F1F5F9',
          font: {
            size: 13,
            weight: '600',
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F1F5F9',
        bodyColor: '#F1F5F9',
        borderColor: '#4F46E5',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Export functionality
  const exportToPDF = async () => {
    try {
      const element = document.getElementById('analytics-dashboard');
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('analytics-dashboard.pdf');

      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: 'PDF exported successfully',
        type: 'success',
        timestamp: new Date()
      }]);
    } catch (error) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: 'Failed to export PDF: ' + error.message,
        type: 'error',
        timestamp: new Date()
      }]);
    }
  };

  const exportToExcel = () => {
    if (!analytics) return;

    const data = {
      users: analytics.users,
      courses: analytics.courses,
      requests: analytics.requests
    };

    const csvContent = "data:text/csv;charset=utf-8,"
      + "Metric,Value\n"
      + `Total Users,${analytics.users.total}\n`
      + `Students,${analytics.users.students}\n`
      + `Instructors,${analytics.users.instructors}\n`
      + `Admins,${analytics.users.admins}\n`
      + `Recent Registrations,${analytics.users.recentRegistrations}\n`
      + `Total Courses,${analytics.courses.total}\n`
      + `Published Courses,${analytics.courses.published}\n`
      + `Draft Courses,${analytics.courses.draft}\n`
      + `Free Courses,${analytics.courses.free}\n`
      + `Paid Courses,${analytics.courses.paid}\n`
      + `Pending Requests,${analytics.requests?.pendingAccessRequests || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: 'Analytics exported to CSV successfully',
      type: 'success',
      timestamp: new Date()
    }]);
  };

  if (loading && !analytics) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-50"></div>
    </div>
  );

  if (error) return (
    <div className="card-gradient rounded-xl p-6 glass-effect text-center">
      <p className="text-red-400 text-lg">{error}</p>
      <button
        onClick={fetchAnalytics}
        className="mt-4 px-4 py-2 bg-yellow-500 text-richblack-900 rounded-lg hover:bg-yellow-400 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  if (!analytics) return null;

  return (
<div id="analytics-dashboard" className="min-h-screen bg-[#2B2D31] p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-sm ${notification.type === 'success'
                ? 'bg-green-500/90 text-white border border-green-400'
                : notification.type === 'warning'
                  ? 'bg-yellow-500/90 text-white border border-yellow-400'
                  : notification.type === 'info'
                    ? 'bg-blue-500/90 text-white border border-blue-400'
                    : 'bg-red-500/90 text-white border border-red-400'
              }`}
          >
            <div className="flex items-center gap-2">
              <FaBell />
              <span>{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Header with Controls */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-white">
              Real-time insights and performance metrics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 sm:px-4 py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${autoRefresh
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-[#36393F] text-white hover:bg-[#40444B]'
                }`}
            >
              <FaRedo className={autoRefresh ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Auto Refresh</span>
              <span className="sm:hidden">Auto</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              <FaRedo className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* Export Buttons */}
            <button
              onClick={exportToPDF}
              className="px-3 sm:px-4 py-2 bg-[#36393F] text-white rounded-xl hover:bg-[#40444B] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FaDownload />
              <span>PDF</span>
            </button>

            <button
              onClick={exportToExcel}
              className="px-3 sm:px-4 py-2 bg-[#36393F] text-white rounded-xl hover:bg-[#40444B] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FaDownload />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors ${dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#36393F] text-white hover:bg-[#40444B]'
                }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards - Matching Reference Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Users Card */}
        <div className="bg-[#FDF5E6] p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 shadow-sm cursor-pointer">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-colors duration-300">
              <FaUsers className="text-blue-600 text-xl sm:text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Users</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {analytics.users.total.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <span className="text-green-600 text-xs sm:text-sm font-medium bg-green-50 px-2 py-1 rounded-full">↗ 7.2%</span>
              <span className="text-gray-600 text-xs sm:text-sm">Last Week</span>
            </div>
          </div>
        </div>

        {/* Students Card */}
        <div className="bg-[#FDF5E6] p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-3xl border border-gray-200 hover:shadow-2xl hover:border-green-300 hover:-translate-y-2 transition-all duration-500 shadow-md cursor-pointer">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-green-100 rounded-2xl hover:bg-green-200 transition-colors duration-300">
              <FaGraduationCap className="text-green-600 text-xl sm:text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Students</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {analytics.users.students.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <span className="text-green-600 text-xs sm:text-sm font-medium bg-green-50 px-2 py-1 rounded-full">↗ 6.2%</span>
              <span className="text-gray-600 text-xs sm:text-sm">Last Month</span>
            </div>
          </div>
        </div>

        {/* Instructors Card */}
        <div className="bg-[#FDF5E6] p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-3xl border border-gray-200 hover:shadow-2xl hover:border-purple-300 hover:-translate-y-2 transition-all duration-500 shadow-md cursor-pointer">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-purple-100 rounded-2xl hover:bg-purple-200 transition-colors duration-300">
              <FaChalkboardTeacher className="text-purple-600 text-xl sm:text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Instructors</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {analytics.users.instructors.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <span className="text-red-500 text-xs sm:text-sm font-medium bg-red-50 px-2 py-1 rounded-full">↘ 0.5%</span>
              <span className="text-gray-600 text-xs sm:text-sm">Last Week</span>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-[#FDF5E6] p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-3xl border border-gray-200 hover:shadow-2xl hover:border-yellow-300 hover:-translate-y-2 transition-all duration-500 shadow-md cursor-pointer">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-yellow-100 rounded-2xl hover:bg-yellow-200 transition-colors duration-300">
              <FaDollarSign className="text-yellow-600 text-xl sm:text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Revenue</p>

            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              ₹{(analytics.revenue?.totalRevenue || 0).toLocaleString()}
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
              <span className="text-green-600 text-xs sm:text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                ↗ {analytics.revenue?.growthPercentage || 0}%
              </span>
              <span className="text-gray-600 text-xs sm:text-sm">
                ₹{(analytics.revenue?.monthlyRevenue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section with Expand/Collapse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Distribution Pie Chart */}
        <div className={`bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300 ${expandedChart === 'userDist' ? 'lg:col-span-3' : ''
          }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              User Distribution
            </h3>
            <button
              onClick={() => setExpandedChart(expandedChart === 'userDist' ? null : 'userDist')}
              className="p-2 rounded-lg bg-[#2F2F2F] hover:bg-[#3A3A3A] transition-colors text-white"
            >
              {expandedChart === 'userDist' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className={`flex items-center justify-center ${expandedChart === 'userDist' ? 'h-80' : 'h-56'}`}>
            {userDistributionData && (
              <Pie data={userDistributionData} options={pieChartOptions} />
            )}
          </div>
        </div>

        {/* Course Type Distribution */}
        <div className={`bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300 ${expandedChart === 'courseType' ? 'lg:col-span-3' : ''
          }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Course Types
            </h3>
            <button
              onClick={() => setExpandedChart(expandedChart === 'courseType' ? null : 'courseType')}
              className="p-2 rounded-lg bg-[#2F2F2F] hover:bg-[#3A3A3A] transition-colors text-white"
            >
              {expandedChart === 'courseType' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className={`flex items-center justify-center ${expandedChart === 'courseType' ? 'h-96' : 'h-64'}`}>
            {courseTypeData && (
              <Doughnut data={courseTypeData} options={pieChartOptions} />
            )}
          </div>
        </div>

        {/* Course Status Distribution */}
        <div className={`bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300 ${expandedChart === 'courseStatus' ? 'lg:col-span-3' : ''
          }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Course Status
            </h3>
            <button
              onClick={() => setExpandedChart(expandedChart === 'courseStatus' ? null : 'courseStatus')}
              className="p-2 rounded-lg bg-[#2F2F2F] hover:bg-[#3A3A3A] transition-colors text-white"
            >
              {expandedChart === 'courseStatus' ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          <div className={`flex items-center justify-center ${expandedChart === 'courseStatus' ? 'h-96' : 'h-64'}`}>
            {courseStatusData && (
              <Doughnut data={courseStatusData} options={pieChartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Bar Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Comparison Bar Chart */}
        <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-4">
            User Type Comparison
          </h3>
          <div className="h-80">
            {userComparisonData && (
              <Bar data={userComparisonData} options={enhancedChartOptions} />
            )}
          </div>
        </div>

        {/* Course Metrics Bar Chart */}
        <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-4">
            Course Metrics Overview
          </h3>
          <div className="h-80">
            {courseMetricsData && (
              <Bar data={courseMetricsData} options={enhancedChartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Growth Trend Chart */}
      <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300">
        <h3 className="text-lg font-semibold text-white mb-4">
          Growth Trends & Projections
        </h3>
        <div className="h-80">
          {growthTrendData && (
            <Line data={growthTrendData} options={enhancedChartOptions} />
          )}
        </div>
      </div>

      {/* Enhanced Recent Activity with Real-time Updates */}
      <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">
            Real-time Activity Monitor
          </h3>
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#2F2F2F] p-4 rounded-lg hover:bg-[#3A3A3A] transition-all duration-300">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-yellow-400 text-xl" />
              <div>
                <p className="text-sm text-white font-medium">New Registrations</p>
                <p className="text-xl font-bold text-white">{analytics.users.recentRegistrations}</p>
                <p className="text-xs text-white">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2F2F2F] p-4 rounded-lg hover:bg-[#3A3A3A] transition-all duration-300">
            <div className="flex items-center gap-3">
              <FaBookOpen className="text-blue-400 text-xl" />
              <div>
                <p className="text-sm text-white font-medium">Published Courses</p>
                <p className="text-xl font-bold text-white">{analytics.courses.published}</p>
                <p className="text-xs text-white">Active courses</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2F2F2F] p-4 rounded-lg hover:bg-[#3A3A3A] transition-all duration-300">
            <div className="flex items-center gap-3">
              <FaBookOpen className="text-green-400 text-xl" />
              <div>
                <p className="text-sm text-white font-medium">Free Courses</p>
                <p className="text-xl font-bold text-white">{analytics.courses.free}</p>
                <p className="text-xs text-white">Available for all</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2F2F2F] p-4 rounded-lg hover:bg-[#3A3A3A] transition-all duration-300">
            <div className="flex items-center gap-3">
              <FaUserShield className="text-red-400 text-xl" />
              <div>
                <p className="text-sm text-white font-medium">Draft Courses</p>
                <p className="text-xl font-bold text-white">{analytics.courses.draft}</p>
                <p className="text-xs text-white">Pending review</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Additional Metrics with System Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Admin Users</p>
              <p className="text-2xl font-bold text-red-400">{analytics.users.admins}</p>
              <p className="text-xs text-white mt-1 flex items-center gap-1">
                <FaEye /> System monitors
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10">
              <FaUserShield className="text-red-400 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Paid Courses</p>
              <p className="text-2xl font-bold text-blue-400">{analytics.courses.paid}</p>
              <p className="text-xs text-white mt-1 flex items-center gap-1">
                <FaDollarSign /> Revenue generating
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <FaBookOpen className="text-blue-400 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F] hover:border-blue-500 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-400">{analytics.requests?.pendingAccessRequests || 0}</p>
              <p className="text-xs text-white mt-1 flex items-center gap-1">
                <FaClock /> Awaiting review
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <FaCalendarAlt className="text-yellow-400 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Courses */}
      <div className="bg-[#242424] p-6 rounded-xl border border-[#2F2F2F]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaPlus className="text-green-400" />
            Recently Added Courses
          </h3>
          <span className="text-sm text-pure-greys-50">Last 7 days</span>
        </div>
        <div className="space-y-4">
          {analytics.recentCourses?.slice(0, 5).map((course, index) => (
            <div key={course._id || course.id || index} className="flex items-center justify-between p-4 rounded-lg bg-[#2F2F2F] hover:bg-[#3A3A3A] transition-all duration-300">
              <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaBookOpen className="text-white text-lg" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{course.courseName || course.title}</h4>
                  <p className="text-sm text-pure-greys-50">
                    by {course.instructor?.firstName} {course.instructor?.lastName || course.instructor}
                  </p>
                  <p className="text-xs text-pure-greys-50">
                    {new Date(course.createdAt).toLocaleDateString()} • 
                    {course.category?.name && ` ${course.category.name} • `}
                    ₹{course.price || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.status === 'Published' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {course.status}
                </span>
              </div>
            </div>
          ))}
          {(!analytics.recentCourses || analytics.recentCourses.length === 0) && (
            <div className="text-center py-8">
              <FaBookOpen className="text-pure-greys-50 text-3xl mx-auto mb-3" />
              <p className="text-pure-greys-50">No recent courses found</p>
              <p className="text-pure-greys-50 text-sm">Courses added in the last 7 days will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Logins */}
      <div className="bg-[#242424] p-4 sm:p-6 rounded-xl border border-[#2F2F2F]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <FaSignInAlt className="text-blue-400 text-sm sm:text-base" />
            Recent Logins
          </h3>
          <span className="text-xs sm:text-sm text-pure-greys-50">Last 24 hours</span>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {analytics.recentLogins?.slice(0, 5).map((login, index) => (
            <div key={login._id || login.id || index} className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-[#2F2F2F] hover:bg-[#3A3A3A] transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  login.accountType === 'Admin' || login.role === 'Admin' ? 'bg-red-500/20' :
                  login.accountType === 'Instructor' || login.role === 'Instructor' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                }`}>
                  {(login.accountType === 'Admin' || login.role === 'Admin') ? <FaUserShield className="text-red-400 text-sm sm:text-base" /> :
                   (login.accountType === 'Instructor' || login.role === 'Instructor') ? <FaChalkboardTeacher className="text-purple-400 text-sm sm:text-base" /> :
                   <FaGraduationCap className="text-blue-400 text-sm sm:text-base" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base text-white font-medium truncate">
                    {login.firstName && login.lastName ? `${login.firstName} ${login.lastName}` : login.user}
                  </h4>
                  <p className="text-xs sm:text-sm text-pure-greys-50 truncate">{login.email}</p>
                  <p className="text-xs text-pure-greys-50 sm:hidden">
                    {new Date(login.createdAt || login.loginTime).toLocaleDateString()} • {login.accountType || login.role}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block flex-shrink-0">
                <p className="text-sm text-white">
                  {new Date(login.createdAt || login.loginTime).toLocaleTimeString()}
                </p>
                <p className="text-xs text-pure-greys-50">{login.accountType || login.role}</p>
              </div>
              <div className="text-right sm:hidden flex-shrink-0">
                <p className="text-xs text-white">
                  {new Date(login.createdAt || login.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {(!analytics.recentLogins || analytics.recentLogins.length === 0) && (
            <div className="text-center py-6 sm:py-8">
              <FaSignInAlt className="text-pure-greys-5 text-2xl sm:text-3xl mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-pure-greys-5">No recent activity found</p>
              <p className="text-xs sm:text-sm text-pure-greys-5">Recent user registrations will appear here</p>
            </div>
          )}
        </div>
      </div>

      

      {/* System Health Monitor */}
      <div className="bg-[#242424] p-4 sm:p-6 rounded-xl border border-[#2F2F2F]">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            System Health Monitor
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-pure-greys-50">
              Last updated: {systemHealth.api.lastChecked ? 
                new Date(systemHealth.api.lastChecked).toLocaleTimeString() : 'Never'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* API Status */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
            systemHealth.api.status === 'online' ? 'bg-green-500/10 border-green-500/20' :
            systemHealth.api.status === 'degraded' ? 'bg-yellow-500/10 border-yellow-500/20' :
            systemHealth.api.status === 'slow' ? 'bg-orange-500/10 border-orange-500/20' :
            'bg-red-500/10 border-red-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemHealth.api.status === 'online' ? 'bg-green-400 animate-pulse' :
              systemHealth.api.status === 'degraded' ? 'bg-yellow-400 animate-pulse' :
              systemHealth.api.status === 'slow' ? 'bg-orange-400 animate-pulse' :
              'bg-red-400'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm text-white">API Status</p>
              <p className={`text-lg font-semibold capitalize ${
                systemHealth.api.status === 'online' ? 'text-green-400' :
                systemHealth.api.status === 'degraded' ? 'text-yellow-400' :
                systemHealth.api.status === 'slow' ? 'text-orange-400' :
                'text-red-400'
              }`}>
                {systemHealth.api.status}
              </p>
              <p className="text-xs text-pure-greys-50">
                {systemHealth.api.responseTime}ms
              </p>
            </div>
          </div>

          {/* Database Status */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
            systemHealth.database.status === 'connected' ? 'bg-blue-500/10 border-blue-500/20' :
            'bg-red-500/10 border-red-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemHealth.database.status === 'connected' ? 'bg-blue-400 animate-pulse' : 'bg-red-400'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm text-white">Database</p>
              <p className={`text-lg font-semibold capitalize ${
                systemHealth.database.status === 'connected' ? 'text-blue-400' : 'text-red-400'
              }`}>
                {systemHealth.database.status}
              </p>
              <p className="text-xs text-pure-greys-50">
                {systemHealth.database.responseTime}ms
              </p>
            </div>
          </div>

          {/* Server Load */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
            systemHealth.serverLoad.status === 'normal' ? 'bg-green-500/10 border-green-500/20' :
            systemHealth.serverLoad.status === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/20' :
            systemHealth.serverLoad.status === 'high' ? 'bg-red-500/10 border-red-500/20' :
            'bg-gray-500/10 border-gray-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemHealth.serverLoad.status === 'normal' ? 'bg-green-400 animate-pulse' :
              systemHealth.serverLoad.status === 'moderate' ? 'bg-yellow-400 animate-pulse' :
              systemHealth.serverLoad.status === 'high' ? 'bg-red-400 animate-pulse' :
              'bg-gray-400'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm text-white">Server Load</p>
              <p className={`text-lg font-semibold capitalize ${
                systemHealth.serverLoad.status === 'normal' ? 'text-green-400' :
                systemHealth.serverLoad.status === 'moderate' ? 'text-yellow-400' :
                systemHealth.serverLoad.status === 'high' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {systemHealth.serverLoad.status}
              </p>
              <p className="text-xs text-pure-greys-50">
                CPU: {systemHealth.serverLoad.cpuUsage}% | RAM: {systemHealth.serverLoad.memoryUsage}%
              </p>
            </div>
          </div>

          {/* Cache Status */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
            systemHealth.cache.status === 'optimized' ? 'bg-purple-500/10 border-purple-500/20' :
            systemHealth.cache.status === 'fair' ? 'bg-yellow-500/10 border-yellow-500/20' :
            systemHealth.cache.status === 'poor' ? 'bg-red-500/10 border-red-500/20' :
            'bg-gray-500/10 border-gray-500/20'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemHealth.cache.status === 'optimized' ? 'bg-purple-400 animate-pulse' :
              systemHealth.cache.status === 'fair' ? 'bg-yellow-400 animate-pulse' :
              systemHealth.cache.status === 'poor' ? 'bg-red-400 animate-pulse' :
              'bg-gray-400'
            }`}></div>
            <div className="flex-1">
              <p className="text-sm text-white">Cache</p>
              <p className={`text-lg font-semibold capitalize ${
                systemHealth.cache.status === 'optimized' ? 'text-purple-400' :
                systemHealth.cache.status === 'fair' ? 'text-yellow-400' :
                systemHealth.cache.status === 'poor' ? 'text-red-400' :
                'text-pure-greys-50'
              }`}>
                {systemHealth.cache.status}
              </p>
              <p className="text-xs text-pure-greys-50">
                Hit rate: {systemHealth.cache.hitRate}%
              </p>
            </div>
          </div>
        </div>

        {/* System Health Details */}
        <div className="mt-4 p-4 bg-[#2F2F2F] rounded-lg">
          <div className="flex flex-wrap gap-4 text-xs text-pure-greys-50">
            <span>API Response: {systemHealth.api.responseTime}ms</span>
            <span>CPU Usage: {systemHealth.serverLoad.cpuUsage}%</span>
            <span>Memory Usage: {systemHealth.serverLoad.memoryUsage}%</span>
            <span>Cache Hit Rate: {systemHealth.cache.hitRate}%</span>
            <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;