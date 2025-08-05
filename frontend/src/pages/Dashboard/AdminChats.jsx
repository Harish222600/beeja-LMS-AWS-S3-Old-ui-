import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  BsChatDots, 
  BsSearch, 
  BsFilter, 
  BsArchive, 
  BsFlag, 
  BsTrash,
  BsEye,
  BsThreeDotsVertical 
} from 'react-icons/bs';
import { IoPersonCircle, IoTime, IoWarning } from 'react-icons/io5';
import { 
  getAllChats, 
  getChatDetails, 
  archiveChat, 
  unarchiveChat,
  flagChat, 
  unflagChat,
  deleteChat 
} from '../../services/operations/chatAPI';
import ChatWindow from '../../components/core/Chat/ChatWindow';
import { formatDistanceToNow } from 'date-fns';

const AdminChats = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterInstructor, setFilterInstructor] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChats: 0
  });

  // Get unique courses and instructors for filters
  const uniqueCourses = [...new Set(chats.map(chat => chat.course?.courseName))].filter(Boolean);
  const uniqueInstructors = [...new Set(chats.map(chat => 
    `${chat.instructor?.firstName} ${chat.instructor?.lastName}`
  ))].filter(Boolean);

  useEffect(() => {
    if (token && user?.accountType === 'Admin') {
      loadChats();
    }
  }, [token, user, statusFilter]);

  useEffect(() => {
    filterChats();
  }, [chats, searchTerm, filterCourse, filterInstructor]);

  const [allChats, setAllChats] = useState([]);

  const loadChats = async (page = 1) => {
    setIsLoading(true);
    try {
      // Get filtered chats based on status
      const filters = {
        page,
        limit: 10,
        status: statusFilter
      };
      
      const response = await getAllChats(token, filters);
      
      // Get all chats for accurate counts
      const allChatsResponse = await getAllChats(token, { status: 'all' });
      
      if (response?.chats) {
        setChats(response.chats);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalChats: response.totalChats
        });
      }

      if (allChatsResponse?.chats) {
        setAllChats(allChatsResponse.chats);
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
        chat.instructor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.instructor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCourse) {
      filtered = filtered.filter(chat => chat.course?.courseName === filterCourse);
    }

    if (filterInstructor) {
      filtered = filtered.filter(chat => 
        `${chat.instructor?.firstName} ${chat.instructor?.lastName}` === filterInstructor
      );
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
    loadChats(pagination.currentPage);
  };

  const handleArchiveChat = async (chatId) => {
    const success = await archiveChat(chatId, token);
    if (success) {
      loadChats(pagination.currentPage);
    }
    setShowActionMenu(null);
  };

  const handleFlagChat = async (chatId) => {
    const reason = prompt('Enter reason for flagging this chat:');
    if (reason) {
      const success = await flagChat(chatId, reason, token);
      if (success) {
        loadChats(pagination.currentPage);
      }
    }
    setShowActionMenu(null);
  };

  const handleUnarchiveChat = async (chatId) => {
    const success = await unarchiveChat(chatId, token);
    if (success) {
      loadChats(pagination.currentPage);
    }
    setShowActionMenu(null);
  };

  const handleUnflagChat = async (chatId) => {
    const success = await unflagChat(chatId, token);
    if (success) {
      loadChats(pagination.currentPage);
    }
    setShowActionMenu(null);
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      const success = await deleteChat(chatId, token);
      if (success) {
        loadChats(pagination.currentPage);
      }
    }
    setShowActionMenu(null);
  };

  const formatLastMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const getStatusBadge = (chat) => {
    if (chat.isFlagged) {
      return (
        <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          <IoWarning size={12} />
          Flagged
        </div>
      );
    }
    if (chat.isArchived) {
      return (
        <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
          Archived
        </div>
      );
    }
    return (
      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
        Active
      </div>
    );
  };

  if (user?.accountType !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-richblack-500">Access denied. This page is for administrators only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-richblack-5">Manage Chats</h1>
          <p className="text-richblack-300 mt-1">
            Monitor and moderate all student-instructor conversations
          </p>
        </div>
        <div className="flex items-center gap-2 text-richblack-300">
          <BsChatDots size={20} />
          <span>{allChats.length} total conversations</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b border-richblack-700">
        {[
          { key: 'active', label: 'Active', count: allChats.filter(c => !c.isArchived && !c.isFlagged).length },
          { key: 'flagged', label: 'Flagged', count: allChats.filter(c => c.isFlagged).length },
          { key: 'archived', label: 'Archived', count: allChats.filter(c => c.isArchived).length },
          { key: 'all', label: 'All', count: allChats.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.key
                ? 'border-yellow-50 text-yellow-50'
                : 'border-transparent text-richblack-300 hover:text-richblack-5'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-richblack-800 border border-richblack-700 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50"
          />
        </div>
        
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="px-3 py-2 bg-richblack-800 border border-richblack-700 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
        >
          <option value="">All Courses</option>
          {uniqueCourses.map((course, index) => (
            <option key={index} value={course}>{course}</option>
          ))}
        </select>

        <select
          value={filterInstructor}
          onChange={(e) => setFilterInstructor(e.target.value)}
          className="px-3 py-2 bg-richblack-800 border border-richblack-700 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
        >
          <option value="">All Instructors</option>
          {uniqueInstructors.map((instructor, index) => (
            <option key={index} value={instructor}>{instructor}</option>
          ))}
        </select>
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
                ? "No conversations match the current filter criteria."
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
                className="p-4 hover:bg-richblack-700 transition-colors relative cursor-pointer"
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-richblack-5">
                            {chat.student?.firstName} {chat.student?.lastName}
                          </h3>
                          <span className="text-richblack-400">↔</span>
                          <span className="text-richblack-300">
                            {chat.instructor?.firstName} {chat.instructor?.lastName}
                          </span>
                        </div>
                        <p className="text-sm text-richblack-300 truncate">
                          {chat.course?.courseName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(chat)}
                          <div className="flex items-center gap-1 text-xs text-richblack-400">
                            <IoTime size={12} />
                            {formatLastMessageTime(chat.lastMessageTime)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === chat._id ? null : chat._id);
                          }}
                          className="p-2 text-richblack-400 hover:text-richblack-5 hover:bg-richblack-600 rounded-full transition-colors"
                        >
                          <BsThreeDotsVertical size={16} />
                        </button>
                        
                        {showActionMenu === chat._id && (
                          <div className="absolute right-0 top-full mt-1 bg-richblack-900 border border-richblack-700 rounded-lg shadow-lg z-10 min-w-[150px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChatSelect(chat);
                                setShowActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-richblack-5 hover:bg-richblack-700 flex items-center gap-2 rounded-t-lg"
                            >
                              <BsEye size={14} />
                              View Chat
                            </button>
                            {chat.isArchived ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnarchiveChat(chat._id);
                                }}
                                className="w-full px-4 py-2 text-left text-richblack-5 hover:bg-richblack-700 flex items-center gap-2"
                              >
                                <BsArchive size={14} />
                                Unarchive
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveChat(chat._id);
                                }}
                                className="w-full px-4 py-2 text-left text-richblack-5 hover:bg-richblack-700 flex items-center gap-2"
                              >
                                <BsArchive size={14} />
                                Archive
                              </button>
                            )}
                            {chat.isFlagged ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnflagChat(chat._id);
                                }}
                                className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-richblack-700 flex items-center gap-2"
                              >
                                <BsFlag size={14} />
                                Remove Flag
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFlagChat(chat._id);
                                }}
                                className="w-full px-4 py-2 text-left text-yellow-400 hover:bg-richblack-700 flex items-center gap-2"
                              >
                                <BsFlag size={14} />
                                Flag
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat._id);
                              }}
                              className="w-full px-4 py-2 text-left text-red-400 hover:bg-richblack-700 flex items-center gap-2 rounded-b-lg"
                            >
                              <BsTrash size={14} />
                              Delete
                            </button>
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

                    {/* Flag Reason */}
                    {chat.isFlagged && chat.flagReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        <strong>Flag Reason:</strong> {chat.flagReason}
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

      {/* Click outside to close action menu */}
      {showActionMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </div>
  );
};

export default AdminChats;
