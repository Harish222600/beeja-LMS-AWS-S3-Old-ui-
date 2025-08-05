import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiSend, 
  FiUsers, 
  FiUser, 
  FiTrash2, 
  FiEdit3, 
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { BsCheckAll, BsPeople, BsPersonCheck } from 'react-icons/bs';
import { IoClose, IoSparkles } from 'react-icons/io5';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { 
  sendNotification, 
  getAllNotifications, 
  deleteNotificationAdmin, 
  getAllUsers,
  formatRecipientType,
  getPriorityColor 
} from '../../../services/operations/adminNotificationAPI';
import toast from 'react-hot-toast';

const NotificationManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipients: 'all', // 'all', 'specific', 'students', 'instructors', 'admins'
    selectedUsers: [],
    relatedCourse: '',
    priority: 'medium' // 'low', 'medium', 'high'
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getAllNotifications(token);
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers(token);
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.recipients === 'specific' && formData.selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      setLoading(true);
      const notificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        recipients: formData.recipients,
        selectedUsers: formData.recipients === 'specific' ? formData.selectedUsers : undefined,
        relatedCourse: formData.relatedCourse || undefined,
        priority: formData.priority
      };

      const response = await sendNotification(notificationData, token);
      
      if (response.success) {
        setFormData({
          title: '',
          message: '',
          recipients: 'all',
          selectedUsers: [],
          relatedCourse: '',
          priority: 'medium'
        });
        setShowCreateForm(false);
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notification) => {
    const displayText = notification.recipientCount > 1 
      ? `this notification group (${notification.recipientCount} recipients)` 
      : 'this notification';
    
    if (!window.confirm(`Are you sure you want to delete ${displayText}?`)) {
      return;
    }

    try {
      // Use bulkId for grouped notifications, otherwise use _id for individual notifications
      const deleteId = notification.bulkId || notification.displayId || notification._id;
      console.log('Deleting notification with ID:', deleteId, {
        bulkId: notification.bulkId,
        displayId: notification.displayId,
        _id: notification._id,
        recipientCount: notification.recipientCount
      });
      
      const response = await deleteNotificationAdmin(deleteId, token);
      if (response.success) {
        const deletedCount = response.deletedCount || 1;
        toast.success(`${deletedCount} notification${deletedCount > 1 ? 's' : ''} deleted successfully`);
        fetchNotifications();
      } else if (response.notFound) {
        toast.success('Notification was already deleted');
        fetchNotifications(); // Refresh the list to remove the deleted item
      } else {
        toast.error(response.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getRecipientText = (notification) => {
    if (notification.recipients === 'all' || notification.recipientType === 'All') return 'All Users';
    if (notification.recipients === 'students' || notification.recipientType === 'Student') return 'All Students';
    if (notification.recipients === 'instructors' || notification.recipientType === 'Instructor') return 'All Instructors';
    if (notification.recipients === 'admins' || notification.recipientType === 'Admin') return 'All Administrators';
    if (notification.recipients === 'specific' || notification.recipientType === 'Specific') {
      return `${notification.recipientCount || 0} Selected Users`;
    }
    return formatRecipientType(notification.recipients || notification.recipientType);
  };

  const getRecipientIcon = (recipients) => {
    const type = String(recipients || 'unknown');
    switch (type.toLowerCase()) {
      case 'all': return <BsPeople className="w-4 h-4" />;
      case 'student':
      case 'students': return <HiOutlineAcademicCap className="w-4 h-4" />;
      case 'instructor':
      case 'instructors': return <BsPersonCheck className="w-4 h-4" />;
      case 'admin':
      case 'admins': return <FiUser className="w-4 h-4" />;
      case 'specific': return <FiUsers className="w-4 h-4" />;
      default: return <FiUsers className="w-4 h-4" />;
    }
  };

  const getLocalPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const filteredNotifications = notifications
    .filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const recipientType = notification.recipients || notification.recipientType || '';
      const matchesFilter = filterType === 'all' || recipientType.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title': return a.title.localeCompare(b.title);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const getNotificationStats = () => {
    const total = notifications.length;
    const byType = {
      all: notifications.filter(n => (n.recipients === 'all' || n.recipientType === 'All')).length,
      students: notifications.filter(n => (n.recipients === 'students' || n.recipientType === 'Student')).length,
      instructors: notifications.filter(n => (n.recipients === 'instructors' || n.recipientType === 'Instructor')).length,
      admins: notifications.filter(n => (n.recipients === 'admins' || n.recipientType === 'Admin')).length,
      specific: notifications.filter(n => (n.recipients === 'specific' || n.recipientType === 'Specific')).length,
    };
    return { total, byType };
  };

  const stats = getNotificationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-2xl border border-indigo-500/30">
            <FiBell className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
              Notification Center
              <IoSparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
            </h2>
            <p className="text-sm sm:text-base text-pure-greys-50">Manage and send notifications to your community</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchNotifications}
            className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-600 transition-all duration-200 text-sm sm:text-base"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span className="sm:inline">Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
          >
            <FiSend className="w-4 h-4" />
            Create Notification
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Sent</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FiBell className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">To Students</p>
              <p className="text-2xl font-bold text-white">{stats.byType.students}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <HiOutlineAcademicCap className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">To Instructors</p>
              <p className="text-2xl font-bold text-white">{stats.byType.instructors}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <BsPersonCheck className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Broadcast</p>
              <p className="text-2xl font-bold text-white">{stats.byType.all}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <BsPeople className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-pure-greys-50 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Recipients</option>
              <option value="student">Students Only</option>
              <option value="instructor">Instructors Only</option>
              <option value="admin">Administrators Only</option>
              <option value="specific">Specific Users</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Notification Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Send New Notification</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-pure-greys-50 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-pure-greys-25 mb-2">
                      Title *
                    </label>
                    <div className="w-full overflow-hidden">
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter notification title"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 break-all word-break-break-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Recipients */}
                  <div>
                    <label className="block text-sm font-medium text-pure-greys-25 mb-2">
                      Recipients
                    </label>
                    <select
                      name="recipients"
                      value={formData.recipients}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">🌐 All Users</option>
                      <option value="students">🎓 All Students</option>
                      <option value="instructors">👨‍🏫 All Instructors</option>
                      <option value="admins">👑 All Administrators</option>
                      <option value="specific">👥 Specific Users</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-pure-greys-25 mb-2">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-pure-greys-25 mb-2">
                    Message *
                  </label>
                  <div className="w-full overflow-hidden">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Enter notification message..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 break-all word-break-break-all"
                      required
                    />
                  </div>
                  <div className="mt-2 text-xs text-pure-greys-50">
                    {formData.message.length}/500 characters
                  </div>
                </div>

                {/* User Selection */}
                {formData.recipients === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium text-pure-greys-25 mb-3">
                      Select Users ({formData.selectedUsers.length} selected)
                    </label>
                    <div className="max-h-64 overflow-y-auto bg-slate-700 rounded-xl border border-slate-600">
                      <div className="p-3 border-b border-slate-600 bg-slate-600/50">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-pure-greys-25">Select recipients</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, selectedUsers: users.map(u => u._id) }))}
                                className="text-xs px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, selectedUsers: [] }))}
                                className="text-xs px-2 py-1 bg-slate-500 text-white rounded hover:bg-slate-400 transition-colors"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search users by email..."
                              value={userSearchTerm}
                              onChange={(e) => setUserSearchTerm(e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pure-greys-50" />
                          </div>
                        </div>
                      </div>
                      {users
                        .filter(user => {
                          if (userSearchTerm === '') return true;
                          const searchLower = userSearchTerm.toLowerCase();
                          const emailMatch = user.email.toLowerCase().includes(searchLower);
                          const nameMatch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower);
                          console.log('Filtering user:', user.email, 'Search:', searchLower, 'Match:', emailMatch || nameMatch);
                          return emailMatch || nameMatch;
                        })
                        .map((user) => (
                        <motion.label
                          key={user._id}
                          whileHover={{ backgroundColor: 'rgba(71, 85, 105, 0.5)' }}
                          className="flex items-center p-4 cursor-pointer border-b border-slate-600 last:border-b-0 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelection(user._id)}
                            className="mr-4 w-4 h-4 text-indigo-600 bg-slate-600 border-slate-500 rounded focus:ring-indigo-500 focus:ring-2"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="relative">
                              <img
                                src={user.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-10 h-10 rounded-full border-2 border-slate-500"
                              />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-700 ${
                                user.accountType === 'Student' ? 'bg-green-500' : 
                                user.accountType === 'Instructor' ? 'bg-blue-500' : 'bg-purple-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-pure-greys-50 text-xs">{user.email}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  user.accountType === 'Student' ? 'bg-green-500/20 text-green-400' :
                                  user.accountType === 'Instructor' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-purple-500/20 text-purple-400'
                                }`}>
                                  {user.accountType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {(formData.title || formData.message) && (
                  <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                    <h4 className="text-sm font-medium text-pure-greys-25 mb-3">Preview</h4>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <FiBell className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-medium break-all word-break-break-all overflow-hidden max-w-full">{formData.title || 'Notification Title'}</h5>
                          <p className="text-pure-greys-25 text-sm mt-1 break-all word-break-break-all overflow-hidden max-w-full">{formData.message || 'Notification message will appear here...'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getLocalPriorityColor(formData.priority)}`}>
                              {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                            </span>
                            <span className="text-xs text-gray-400">
                              {getRecipientText({ recipients: formData.recipients, recipientCount: formData.selectedUsers.length })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-slate-600">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <IoClose className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List with Pagination */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiEye className="w-5 h-5" />
                Recent Notifications
              </h3>
              <p className="text-pure-greys-50 text-sm mt-1">
                {filteredNotifications.length} of {notifications.length} notifications
              </p>
            </div>
            {filteredNotifications.length > 0 && (
              <div className="text-xs text-pure-greys-50">
                Showing {sortBy === 'newest' ? 'newest' : sortBy === 'oldest' ? 'oldest' : 'alphabetical'} first
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-pure-greys-50 text-lg">Loading notifications...</p>
            <p className="text-pure-greys-50 text-sm mt-2">Please wait while we fetch your data</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiBell className="w-10 h-10 text-pure-greys-50" />
            </div>
            <h4 className="text-white text-lg font-semibold mb-2">
              {searchTerm || filterType !== 'all' ? 'No matching notifications' : 'No notifications sent yet'}
            </h4>
            <p className="text-pure-greys-50 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start by creating your first notification to engage with your community'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 mx-auto"
              >
                <FiSend className="w-4 h-4" />
                Create First Notification
              </motion.button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredNotifications
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-slate-700/30 transition-all duration-200 group"
              >
                <div className="flex justify-between items-start gap-4 w-full overflow-hidden">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 text-pure-greys-5 rounded-lg group-hover:bg-indigo-500/30 transition-colors flex-shrink-0">
                        {getRecipientIcon(notification.recipients)}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h4 className="text-base sm:text-lg text-white font-semibold mb-1 group-hover:text-indigo-300 transition-colors break-all word-break-break-all overflow-hidden max-w-full">
                          {notification.title}
                        </h4>
                        <p className="text-sm sm:text-base text-pure-greys-25 mb-3 leading-relaxed break-all word-break-break-all overflow-hidden max-w-full">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-pure-greys-50 bg-slate-700/50 px-2 py-1 rounded-lg">
                        {getRecipientIcon(notification.recipients)}
                        {getRecipientText(notification)}
                      </span>
                      
                      <span className="flex items-center gap-1.5 text-pure-greys-50 bg-slate-700/50 px-2 py-1 rounded-lg">
                        <FiClock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} at {new Date(notification.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      {notification.priority && notification.priority !== 'medium' && (
                        <span className={`text-xs px-2 py-1 rounded-lg border ${getLocalPriorityColor(notification.priority)}`}>
                          {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteNotification(notification)}
                      className="p-2 text-pure-greys-50 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                      title={`Delete ${notification.recipientCount > 1 ? 'notification group' : 'notification'}`}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination and Footer Info */}
      {filteredNotifications.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Pagination Controls */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(Math.ceil(filteredNotifications.length / itemsPerPage))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === i + 1
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-700 text-pure-greys-50 hover:bg-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredNotifications.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredNotifications.length / itemsPerPage)}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Next
            </button>
          </div>
          
          {/* Info Text */}
          <div className="text-center text-pure-greys-5 text-sm">
            <p>
              Showing {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
              {filterType !== 'all' && ` for ${filterType}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;