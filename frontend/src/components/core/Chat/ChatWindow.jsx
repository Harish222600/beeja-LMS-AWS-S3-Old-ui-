import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { IoClose, IoSend, IoImage, IoPersonCircle, IoVideocam, IoCall } from 'react-icons/io5';
import { BsEmojiSmile, BsThreeDotsVertical } from 'react-icons/bs';
import { HiOutlinePaperClip } from 'react-icons/hi';
import { getChatMessages, sendMessage } from '../../../services/operations/chatAPI';
import MessageList from './MessageList';
import io from 'socket.io-client';

const ChatWindow = ({ chat, onClose, courseName }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [messages, setMessages] = useState([]);
  
  // Helper function to deduplicate messages by _id
  const deduplicateMessages = (messageArray) => {
    const seen = new Set();
    return messageArray.filter(msg => {
      if (seen.has(msg._id)) {
        return false;
      }
      seen.add(msg._id);
      return true;
    });
  };
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (token && chat?._id) {
      const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL || 
                     (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
                       ? `${window.location.protocol}//${window.location.hostname}:5001` 
                       : 'http://localhost:5001');
      const newSocket = io(baseUrl, {
        withCredentials: true
      });

      // Authenticate socket
      newSocket.emit('authenticate', token);

      newSocket.on('authenticated', () => {
        console.log('Socket authenticated successfully');
        newSocket.emit('join_chat', chat._id);
      });

      newSocket.on('joined_chat', ({ chatId }) => {
        console.log('Joined chat:', chatId);
      });

      newSocket.on('new_message', (message) => {
        console.log('New message received:', message);
        // Only add messages from other users, not our own sent messages
        setMessages(prev => {
          // Check if message already exists by ID
          const messageExists = prev.some(msg => msg._id === message._id);
          if (messageExists) {
            return prev; // Message already exists, don't add duplicate
          }
          
          // Skip messages from current user to prevent interference with optimistic updates
          if (message.sender._id === user._id) {
            return prev;
          }
          
          // Add new message from other users
          const newMessage = {
            ...message,
            sender: {
              _id: message.sender._id,
              firstName: message.sender.firstName,
              lastName: message.sender.lastName,
              image: message.sender.image
            }
          };
          return deduplicateMessages([...prev, newMessage]);
        });
        scrollToBottom();
      });

      newSocket.on('user_typing', ({ userId, typing }) => {
        if (userId !== user._id) {
          setOtherUserTyping(typing);
        }
      });

      // Listen for notifications
      newSocket.on('new_notification', (notification) => {
        console.log('New notification received:', notification);
        // Show toast notification
        toast.success(notification.message, {
          duration: 5000,
          position: 'top-right',
        });
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Connection error');
      });

      newSocket.on('authentication_error', (error) => {
        console.error('Socket authentication error:', error);
        toast.error('Authentication failed');
      });

      setSocket(newSocket);

      return () => {
        newSocket.emit('leave_chat', chat._id);
        newSocket.disconnect();
      };
    }
  }, [token, chat?._id, user?._id]);

  // Load initial messages
  useEffect(() => {
    if (chat?._id && token) {
      loadMessages();
    }
  }, [chat?._id, token]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const messagesData = await getChatMessages(chat._id, token);
      if (messagesData?.messages) {
        setMessages(deduplicateMessages(messagesData.messages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || isSending) {
      return;
    }

    setIsSending(true);
    
    try {
      const messageType = selectedImage ? 'image' : 'text';
      const content = selectedImage ? (newMessage.trim() || 'Image') : newMessage.trim();
      
      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        _id: Date.now().toString(), // Temporary ID
        chat: chat._id,
        sender: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image
        },
        messageType,
        content,
        imageUrl: selectedImage ? imagePreview : null,
        createdAt: new Date().toISOString(),
        isOptimistic: true // Flag to identify optimistic messages
      };

      // Add message optimistically to UI
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Clear input immediately
      const messageContent = newMessage;
      const selectedImg = selectedImage;
      const imgPreview = imagePreview;
      
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      
      // Stop typing indicator
      if (socket && isTyping) {
        socket.emit('typing_stop', chat._id);
        setIsTyping(false);
      }
      
      // Send message to server
      const sentMessage = await sendMessage(
        chat._id,
        content,
        messageType,
        selectedImg,
        token
      );

      if (sentMessage) {
        // Replace optimistic message with real message and ensure sender info is preserved
        setMessages(prev => {
          // Filter out optimistic message with same _id
          const filtered = prev.filter(msg => !(msg.isOptimistic && msg._id === optimisticMessage._id));
          // Ensure the real message has the correct sender info
          const realMessage = {
            ...sentMessage,
            sender: {
              _id: user._id, // Ensure this matches the current user
              firstName: user.firstName,
              lastName: user.lastName,
              image: user.image
            },
            isOptimistic: false
          };
          return deduplicateMessages([...filtered, realMessage]);
        });
      } else {
        // Remove optimistic message if sending failed
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        // Restore input values
        setNewMessage(messageContent);
        setSelectedImage(selectedImg);
        setImagePreview(imgPreview);
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic));
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && !isTyping) {
      socket.emit('typing_start', chat._id);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        socket.emit('typing_stop', chat._id);
        setIsTyping(false);
      }
    }, 1000);
  };

  const otherUser = user?.accountType === 'Student' ? chat?.instructor : chat?.student;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] h-[700px] flex flex-col mx-auto overflow-hidden border border-gray-200">
        {/* Modern Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                {otherUser?.image ? (
                  <img 
                    src={otherUser.image} 
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IoPersonCircle size={48} className="text-white/80" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold text-xl">
                {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Chat'}
              </h3>
              <p className="text-sm text-white/80 truncate max-w-[250px] flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {courseName || chat?.course?.courseName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2"
              title="Close Chat"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        {/* Messages Area with Modern Background */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-gray-50 to-white">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-gray-500 text-sm">Loading messages...</p>
              </div>
            </div>
          ) : (
            <MessageList 
              messages={messages} 
              currentUserId={user?._id}
              messagesEndRef={messagesEndRef}
            />
          )}
          
          {/* Enhanced Typing Indicator */}
          {otherUserTyping && (
            <div className="px-6 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="font-medium">{otherUser?.firstName}</span> is typing...
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Image Preview */}
        {imagePreview && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
                <button
                  onClick={removeSelectedImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <IoClose size={14} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Image ready to send</p>
                <p className="text-xs text-gray-500">Click the send button to share</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            {/* Attachment Buttons */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                title="Attach image"
              >
                <IoImage size={20} />
              </button>
              <button
                type="button"
                className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                title="Attach file"
              >
                <HiOutlinePaperClip size={20} />
              </button>
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                rows="1"
                style={{ minHeight: '52px', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-yellow-500 rounded-full transition-colors"
                title="Add emoji"
              >
                <BsEmojiSmile size={18} />
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedImage) || isSending}
              className={`p-3 rounded-2xl transition-all duration-200 ${
                (!newMessage.trim() && !selectedImage) || isSending
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <IoSend size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
