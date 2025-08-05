import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { BsCheckAll } from 'react-icons/bs';
import { FiBell } from 'react-icons/fi';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/operations/notificationAPI';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications(token);
      if (response.success) {
        const notificationsList = response.data?.notifications || [];
        // Show all notifications but mark read status properly
        setNotifications(notificationsList);
        // Count unread notifications properly - check both read and isRead for compatibility
        const unreadCount = notificationsList.filter((n) => !n.read && !n.isRead).length;
        setUnreadCount(response.data?.unreadCount || unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markNotificationAsRead(notificationId, token);
      if (response.success) {
        // Update the notification in the list to mark it as read
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true, read: true }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // Refresh notifications from backend to ensure sync
        setTimeout(() => fetchNotifications(), 500);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead(token);
      if (response.success) {
        // Mark all notifications as read in the state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true,
            read: true
          }))
        );
        setUnreadCount(0);
        // Refresh notifications from backend to ensure sync
        setTimeout(() => fetchNotifications(), 500);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Filter notifications to show only unread ones in the panel
  const unreadNotifications = notifications.filter((n) => !n.read && !n.isRead);

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 group"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <div className="relative">
          <FiBell className="w-6 h-6 text-white group-hover:text-indigo-400 transition-all duration-300" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </div>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-2 w-[320px] sm:w-[380px] lg:w-[420px] max-h-[85vh] overflow-hidden bg-[#1a1a2e] rounded-xl shadow-2xl border border-gray-700/50 z-50"
          >
            {/* Panel Header */}
            <div className="sticky top-0 z-10 bg-[#1a1a2e] p-4 border-b border-gray-700/50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllAsRead}
                    className="p-2 text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-all duration-200"
                    title="Mark all as read"
                  >
                    <BsCheckAll className="w-5 h-5" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                  title="Close"
                >
                  <IoClose className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {unreadNotifications.length > 0 ? (
                <ul className="divide-y divide-gray-700/50">
                  {unreadNotifications.map((notification) => (
                    <motion.li
                      key={notification._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="group relative bg-indigo-500/10 hover:bg-indigo-500/20 transition-all duration-300"
                    >
                      <div 
                        className="p-3 sm:p-4 cursor-pointer transition-all duration-200"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <div className="relative flex-shrink-0">
                            {notification.relatedCourse?.thumbnail ? (
                              <img
                                src={notification.relatedCourse.thumbnail}
                                alt="Course thumbnail"
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-700/50 group-hover:border-gray-600 transition-all duration-300"
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                              </div>
                            )}
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#1a1a2e] animate-pulse"></div>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-sm sm:text-[15px] font-bold text-white break-all word-break-break-all overflow-hidden max-w-full flex-1">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13.5px] text-gray-300 mt-1 leading-relaxed break-all word-break-break-all overflow-hidden max-w-full">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 space-x-2 sm:space-x-3">
                              <span className="text-xs text-gray-400">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                              {notification.relatedCourse?.name && (
                                <span className="text-xs px-2 sm:px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full border border-gray-700 break-all word-break-break-all overflow-hidden max-w-[120px] sm:max-w-[200px]">
                                  {notification.relatedCourse.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <FiBell className="w-7 h-7 text-gray-500" />
                  </div>
                  <h4 className="text-gray-300 font-bold text-lg mb-1">No unread notifications</h4>
                  <p className="text-gray-400 text-sm">All caught up! New notifications will appear here</p>
                </motion.div>
              )}
            </div>

            {/* Panel Footer */}
            {unreadNotifications.length > 0 && (
              <div className="sticky bottom-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/95 to-transparent p-4 border-t border-gray-700/50 text-center">
                <button 
                  className="px-5 py-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 rounded-lg hover:bg-indigo-500/10"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
