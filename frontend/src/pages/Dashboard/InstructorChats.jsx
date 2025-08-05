import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { BsChatDots, BsSearch, BsFilter } from 'react-icons/bs';
import { IoPersonCircle, IoTime } from 'react-icons/io5';
import { getInstructorChats, getChatDetails } from '../../services/operations/chatAPI';
import ChatWindow from '../../components/core/Chat/ChatWindow';
import { formatDistanceToNow } from 'date-fns';

const InstructorChats = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChats: 0
  });

  // Get unique courses for filter
  const uniqueCourses = [...new Set(chats.map(chat => chat.course?.courseName))].filter(Boolean);

  useEffect(() => {
    if (token && user?.accountType === 'Instructor') {
      loadChats();
    }
  }, [token, user]);

  useEffect(() => {
    filterChats();
  }, [chats, searchTerm, filterCourse]);

  const loadChats = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await getInstructorChats(token, page, 10);
      if (response?.chats) {
        setChats(response.chats);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalChats: response.totalChats
        });
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterChats = () => {
    let filtered = chats;

    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCourse) {
      filtered = filtered.filter(chat => chat.course?.courseName === filterCourse);
    }

    setFilteredChats(filtered);
  };

  const handleChatSelect = async (chat) => {
    try {
      const chatDetails = await getChatDetails(chat._id, token);
      if (chatDetails) {
        setSelectedChat(chatDetails);
      }
    } catch (error) {
      console.error('Error loading chat details:', error);
      toast.error('Failed to load chat details');
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    // Refresh chats to update unread counts
    loadChats(pagination.currentPage);
  };

  const formatLastMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  if (user?.accountType !== 'Instructor') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-richblack-500">Access denied. This page is for instructors only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">My Chats</h1>
          <p className="text-richblack-300 mt-1">
            Manage conversations with your students
          </p>
        </div>
        <div className="flex items-center gap-2 text-richblack-300">
          <BsChatDots size={20} />
          <span>{pagination.totalChats} total conversations</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" size={16} />
          <input
            type="text"
            placeholder="Search by student name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-richblack-800 border border-richblack-700 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50"
          />
        </div>
        <div className="relative">
          <BsFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" size={16} />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="pl-10 pr-8 py-2 bg-richblack-800 border border-richblack-700 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 min-w-[200px]"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map((course, index) => (
              <option key={index} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat List */}
      <div className="bg-richblack-800 rounded-lg border border-richblack-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-50"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-richblack-300">
            <BsChatDots size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No chats found</h3>
            <p className="text-sm text-center max-w-md">
              {chats.length === 0 
                ? "You don't have any student conversations yet. Students can start chats from their course pages."
                : "No chats match your current search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-richblack-700">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat)}
                className="p-4 hover:bg-richblack-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Student Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-richblack-600 flex items-center justify-center flex-shrink-0">
                    {chat.student?.image ? (
                      <img
                        src={chat.student.image}
                        alt={`${chat.student.firstName} ${chat.student.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IoPersonCircle size={48} className="text-richblack-300" />
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-richblack-5 truncate">
                          {chat.student?.firstName} {chat.student?.lastName}
                        </h3>
                        <p className="text-sm text-richblack-300 truncate">
                          {chat.course?.courseName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-richblack-400">
                          <IoTime size={12} />
                          {formatLastMessageTime(chat.lastMessageTime)}
                        </div>
                        {chat.unreadByInstructor > 0 && (
                          <div className="bg-yellow-50 text-richblack-900 text-xs font-medium px-2 py-1 rounded-full">
                            {chat.unreadByInstructor}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Last Message Preview */}
                    {chat.lastMessage && (
                      <div className="mt-2">
                        <p className="text-sm text-richblack-400 truncate">
                          {chat.lastMessage.messageType === 'image' ? '📷 Image' : chat.lastMessage.content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => loadChats(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1 bg-richblack-700 text-richblack-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-richblack-600"
          >
            Previous
          </button>
          <span className="text-richblack-300">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => loadChats(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1 bg-richblack-700 text-richblack-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-richblack-600"
          >
            Next
          </button>
        </div>
      )}

      {/* Chat Window Modal */}
      {selectedChat && (
        <ChatWindow
          chat={selectedChat}
          onClose={handleCloseChat}
          courseName={selectedChat.course?.courseName}
        />
      )}
    </div>
  );
};

export default InstructorChats;
