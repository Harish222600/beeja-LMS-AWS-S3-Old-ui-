import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { BsChatDots } from 'react-icons/bs';
import { initiateChat } from '../../../services/operations/chatAPI';
import ChatWindow from './ChatWindow';

const ChatButton = ({ courseId, courseName, instructorName }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChatClick = async () => {
    if (!token || !user) {
      toast.error('Please login to chat with instructor');
      return;
    }

    if (user.accountType !== 'Student') {
      toast.error('Only students can initiate chats with instructors');
      return;
    }

    if (!courseId) {
      toast.error('Course information not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const chatData = await initiateChat(courseId, token);
      if (chatData) {
        setCurrentChat(chatData);
        setIsChatOpen(true);
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setCurrentChat(null);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleChatClick}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-yellow-50 hover:bg-yellow-100 text-richblack-900 hover:scale-105'
          }
          border border-yellow-200 shadow-sm hover:shadow-md
        `}
        title={`Chat with ${instructorName || 'Instructor'}`}
      >
        <BsChatDots size={18} />
        <span className="text-sm">
          {isLoading ? 'Starting...' : 'Chat with Instructor'}
        </span>
      </button>

      {/* Chat Window Modal */}
      {isChatOpen && currentChat && (
        <ChatWindow
          chat={currentChat}
          onClose={handleCloseChat}
          courseName={courseName}
        />
      )}
    </>
  );
};

export default ChatButton;
