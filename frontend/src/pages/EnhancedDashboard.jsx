import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from "react-router-dom"
import Sidebar from '../components/core/Dashboard/Sidebar'
import Loading from '../components/common/Loading'
import { 
  FaBell, 
  FaSearch, 
  FaUser, 
  FaCog, 
  FaMoon, 
  FaSun,
  FaExpand,
  FaCompress,
  FaWifi,
  FaWifiSlash
} from 'react-icons/fa'

const EnhancedDashboard = () => {
    const { loading: authLoading } = useSelector((state) => state.auth);
    const { loading: profileLoading } = useSelector((state) => state.profile);
    const { user } = useSelector((state) => state.profile);
    
    // Enhanced state management
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: 'Connection restored',
                type: 'success',
                timestamp: new Date()
            }]);
        };
        
        const handleOffline = () => {
            setIsOnline(false);
            setNotifications(prev => [...prev, {
                id: Date.now(),
                message: 'Connection lost - Working offline',
                type: 'warning',
                timestamp: new Date()
            }]);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Theme management
    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Auto-clear notifications
    useEffect(() => {
        notifications.forEach(notification => {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, 5000);
        });
    }, [notifications]);

    // Fullscreen functionality
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Welcome message based on time
    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (profileLoading || authLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen dashboard-gradient'>
                <div className="text-center">
                    <Loading />
                    <p className="text-richblack-200 mt-4 animate-pulse">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    // Scroll to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    return (
        <div className={`relative flex min-h-[calc(100vh-3.5rem)] dashboard-gradient ${theme === 'dark' ? 'dark' : ''}`}>
            {/* Enhanced Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
                            notification.type === 'success' 
                                ? 'bg-green-500 text-white' 
                                : notification.type === 'warning'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaBell />
                            <span>{notification.message}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enhanced Header Bar */}
            <div className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-richblack-700">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 rounded-lg bg-richblack-800 hover:bg-richblack-700 transition-colors"
                        >
                            ☰
                        </button>
                        
                        <div className="hidden md:block">
                            <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
                                {getWelcomeMessage()}, {user?.firstName}!
                            </h1>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
                            <input
                                type="text"
                                placeholder="Search courses, users, analytics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-richblack-800 border border-richblack-700 rounded-lg focus:outline-none focus:border-yellow-500 text-richblack-25"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Network Status */}
                        <div className={`p-2 rounded-lg ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                            {isOnline ? <FaWifi /> : <FaWifiSlash />}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-lg bg-richblack-800 hover:bg-richblack-700 transition-colors text-yellow-400"
                        >
                            {theme === 'dark' ? <FaSun /> : <FaMoon />}
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg bg-richblack-800 hover:bg-richblack-700 transition-colors text-richblack-25"
                        >
                            {isFullscreen ? <FaCompress /> : <FaExpand />}
                        </button>

                        {/* Notifications */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-lg bg-richblack-800 hover:bg-richblack-700 transition-colors text-richblack-25"
                        >
                            <FaBell />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-richblack-800">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                                {user?.image ? (
                                    <img src={user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <FaUser className="text-richblack-900" />
                                )}
                            </div>
                            <span className="hidden md:block text-richblack-25 text-sm font-medium">
                                {user?.firstName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-300 ${
                sidebarCollapsed ? 'w-16' : 'w-64'
            }`}>
                <Sidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Enhanced Main Content */}
            <div className={`flex-1 mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
                sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}>
                <div className='mx-auto w-11/12 max-w-[1400px] py-8 px-4 overflow-x-hidden'>
                    {/* Quick Stats Bar */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass-effect p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <div>
                                    <p className="text-sm text-richblack-300">Status</p>
                                    <p className="text-lg font-semibold text-green-400">Online</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="glass-effect p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                <div>
                                    <p className="text-sm text-richblack-300">Session</p>
                                    <p className="text-lg font-semibold text-blue-400">Active</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="glass-effect p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                <div>
                                    <p className="text-sm text-richblack-300">Theme</p>
                                    <p className="text-lg font-semibold text-yellow-400 capitalize">{theme}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="glass-effect p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                                <div>
                                    <p className="text-sm text-richblack-300">Role</p>
                                    <p className="text-lg font-semibold text-purple-400 capitalize">{user?.accountType}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="fade-in-up">
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-richblack-900 z-40">
                <FaCog className="text-xl animate-spin-slow" />
            </button>
        </div>
    )
}

export default EnhancedDashboard
