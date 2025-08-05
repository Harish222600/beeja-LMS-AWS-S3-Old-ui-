import { useState, lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBookOpen, FaChartBar, FaGraduationCap, FaQuestionCircle, FaChartLine, FaTag } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import { VscPackage } from 'react-icons/vsc';

import AdminSidebar from '../../components/core/Dashboard/Admin/AdminSidebar';

// Lazy load components to improve initial load performance
const StudentProgress = lazy(() => import('./components/StudentProgress/StudentProgress'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const CourseManagement = lazy(() => import('./components/CourseManagement'));
const CreateCourse = lazy(() => import('./components/CreateCourse/CreateCourse'));
const EnhancedAnalytics = lazy(() => import('./components/EnhancedAnalytics'));
const Settings = lazy(() => import('./components/Settings'));
const CourseAccessRequests = lazy(() => import('../../components/core/Dashboard/Admin/CourseAccessRequests'));
const QuizManagement = lazy(() => import('./components/QuizManagement'));
const CourseCategories = lazy(() => import('../../components/core/Dashboard/AddCategory/CourseCategories'));
const BundleAccessRequests = lazy(() => import('./components/BundleAccessRequests'));
const Coupons = lazy(() => import('./Coupons'));
const Orders = lazy(() => import('./components/Orders'));
const NotificationManagement = lazy(() => import('./components/NotificationManagement'));
const FeaturedCoursesManagement = lazy(() => import('./components/FeaturedCoursesManagement'));
const ContactMessages = lazy(() => import('../../components/core/Dashboard/Admin/ContactMessages'));
const FaqManagement = lazy(() => import('./components/FaqManagement'));
const AdminChats = lazy(() => import('../Dashboard/AdminChats'));
const CareersManagement = lazy(() => import('./components/CareersManagement'));
const RecycleBin = lazy(() => import('./components/RecycleBin'));
const ReviewManagement = lazy(() => import('./components/ReviewManagement'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.profile);
  const { isCollapsed } = useSelector((state) => state.sidebar);
  const [activeTab, setActiveTab] = useState('analytics');
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  // Sidebar navigation items for title display (matching AdminSidebar order)
  const sidebarItems = [
    { id: 'analytics', label: 'Analytics Dashboard', icon: <FaChartBar className="w-5 h-5" /> },
    { id: 'users', label: 'User Management', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'courses', label: 'Course Management', icon: <FaBookOpen className="w-5 h-5" /> },
    { id: 'categories', label: 'Course Categories', icon: <FaGraduationCap className="w-5 h-5" /> },
    { id: 'recycleBin', label: 'Recycle Bin', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'studentProgress', label: 'Student Progress', icon: <FaChartLine className="w-5 h-5" /> },
    { id: 'quizzes', label: 'Quiz Management', icon: <FaQuestionCircle className="w-5 h-5" /> },
    { id: 'featuredCourses', label: 'Featured Courses Management', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'reviews', label: 'Review ', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'accessRequests', label: 'Access Requests', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'bundleRequests', label: 'Bundle Requests', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <VscPackage className="w-5 h-5" /> },
    { id: 'coupons', label: 'Coupons', icon: <FaTag className="w-5 h-5" /> },
    { id: 'careers', label: 'Careers', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notification Management', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'contactMessages', label: 'Contact Messages', icon: <FaUsers className="w-5 h-5" /> },
    { id: 'faqs', label: 'FAQ Management', icon: <FaQuestionCircle className="w-5 h-5" /> },
    { id: 'chats', label: 'Manage Chats', icon: <FaUsers className="w-5 h-5" /> },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowCreateCourse(false);
  };

  const handleCreateCourse = () => {
    setShowCreateCourse(true);
    setActiveTab('courses');
  };

  return (
    <div className="min-h-screen bg-richblack-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="sm:fixed sm:left-0 sm:top-16 h-[calc(100vh-4rem)] z-30 transition-all duration-300">
          <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Main Content */}
        <div className={`flex-1 mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          isCollapsed ? 'sm:ml-16' : 'sm:ml-64'
        } w-full px-4 sm:px-0`}>
          <div className="p-4 sm:p-6 overflow-x-hidden">
            {/* Header */}
            <div className="mb-4 sm:mb-8 bg-richblack-800 border border-richblack-700 p-4 sm:p-6 rounded-xl shadow-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">
                {showCreateCourse ? 'Create Course' : sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-richblack-200 mt-2">
                Manage your platform efficiently with these tools
              </p>
            </div>

            {/* Content */}
            <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4 sm:p-6 shadow-md">
              <Suspense fallback={<LoadingSpinner />}>
                {showCreateCourse ? (
                  <CreateCourse onCancel={() => setShowCreateCourse(false)} />
                ) : (
                  <>
                    {activeTab === 'analytics' && <EnhancedAnalytics />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'courses' && <CourseManagement onCreateCourse={handleCreateCourse} />}
                    {activeTab === 'categories' && <CourseCategories />}
                    {activeTab === 'accessRequests' && <CourseAccessRequests />}
                    {activeTab === 'settings' && <Settings />}
                    {activeTab === 'quizzes' && <QuizManagement />}
                    {activeTab === 'bundleRequests' && <BundleAccessRequests />}
                    {activeTab === 'studentProgress' && <StudentProgress />}
                    {activeTab === 'orders' && <Orders />}
                    {activeTab === 'coupons' && <Coupons />}
                    {activeTab === 'notifications' && <NotificationManagement />}
                    {activeTab === 'contactMessages' && <ContactMessages />}
                    {activeTab === 'featuredCourses' && <FeaturedCoursesManagement />}
                    {activeTab === 'reviews' && <ReviewManagement />}
                    {activeTab === 'faqs' && <FaqManagement />}
                    {activeTab === 'chats' && <AdminChats />}
                    {activeTab === 'careers' && <CareersManagement />}
                    {activeTab === 'recycleBin' && <RecycleBin />}
                  </>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
