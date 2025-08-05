import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { IoPersonCircle, IoCheckmarkDone, IoCheckmark } from 'react-icons/io5';

const MessageList = ({ messages, currentUserId, messagesEndRef }) => {
  
  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  const isMessageRead = (message) => {
    return message.readBy?.some(read => read.user !== currentUserId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
            <div className="text-5xl">💬</div>
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No messages yet</p>
          <p className="text-sm text-gray-500">Start the conversation by sending a message!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
            const isSystemMessage = message.isSystemMessage;

            if (isSystemMessage) {
              return (
                <div key={message._id} className="flex justify-center my-2">
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                    {message.content}
                  </div>
                </div>
              );
            }

            // More robust check for own message - handle both string and ObjectId comparisons
            const isOwnMessage = currentUserId && message.sender && (
              String(message.sender._id) === String(currentUserId) ||
              message.sender._id === currentUserId
            );
            
            return (
              <div key={message._id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-3`}>
                {/* Avatar */}
                {showAvatar && (
                  <div className="flex-shrink-0 mb-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      {message.sender.image ? (
                        <img
                          src={message.sender.image}
                          alt={`${message.sender.firstName} ${message.sender.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <IoPersonCircle size={32} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Message Content - Below Avatar */}
                <div className={`max-w-[75%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                  {/* Message Bubble */}
                  <div className={`inline-block px-3 py-2 rounded-2xl ${
                    isOwnMessage 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md' 
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                  } shadow-sm`}>
                    {/* Text Content */}
                    {message.content && message.content !== 'Image' && (
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>
                    )}
                    
                    {/* Image Message */}
                    {message.messageType === 'image' && message.imageUrl && (
                      <div className="mb-1">
                        <img
                          src={message.imageUrl}
                          alt="Shared image"
                          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.imageUrl, '_blank')}
                          style={{ maxHeight: '300px', maxWidth: '250px' }}
                        />
                      </div>
                    )}
                    
                    {/* Message Time and Status */}
                    <div className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <span className={isOwnMessage ? 'text-white/70' : 'text-gray-500'}>
                        {formatMessageTime(message.createdAt)}
                      </span>
                      
                      {/* Read Status (only for own messages) */}
                      {isOwnMessage && (
                        <>
                          {isMessageRead(message) ? (
                            <IoCheckmarkDone size={12} className="text-blue-200" title="Read" />
                          ) : (
                            <IoCheckmark size={12} className="text-white/70" title="Sent" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
