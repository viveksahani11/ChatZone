import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { MoreVertical, Trash2, Trash2Icon } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = ({ onBackToSidebar }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessageForMe,
    deleteMessageForEveryone,
    isMessageDeletedForMe,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  
  // ✅ TYPING INDICATOR STATE
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  
  // ✅ NEW: Message options state
  const [showMessageOptions, setShowMessageOptions] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ TYPING INDICATOR SOCKET LISTENER
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ senderId, isTyping: userIsTyping }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(userIsTyping);
        setTypingUser(userIsTyping ? selectedUser : null);
        
        // Auto hide typing after 3 seconds
        if (userIsTyping) {
          setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        }
      }
    };

    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
    };
  }, [socket, selectedUser]);

  // ✅ NEW: Handle message deletion
  const handleDeleteMessage = async (messageId, deleteType) => {
    try {
      if (deleteType === "forMe") {
        await deleteMessageForMe(messageId);
      } else if (deleteType === "forEveryone") {
        await deleteMessageForEveryone(messageId);
      }
      setShowMessageOptions(null);
    } catch (error) {
      console.error("Delete message error:", error);
    }
  };

  // ✅ NEW: Check if message can be deleted for everyone (within 7 minutes)
  const canDeleteForEveryone = (message, isMyMessage) => {
    console.log("🔍 Delete check:", { isMyMessage, message });
    
    if (!isMyMessage) return false;
    
    const now = new Date();
    const messageTime = new Date(message.createdAt);
    const timeDiff = (now - messageTime) / (1000 * 60); // in minutes
    
    console.log("⏰ Time diff:", timeDiff, "minutes");
    
    return timeDiff <= 7; // 7 minutes limit
  };

  // ✅ NEW: Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMessageOptions(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader onBackToSidebar={onBackToSidebar} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader onBackToSidebar={onBackToSidebar} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          // ✅ FIXED: Proper sender ID extraction
          const messageSenderId = typeof message.senderId === 'object' 
            ? message.senderId._id 
            : message.senderId;
          
          const isMyMessage = messageSenderId === authUser._id;
          
          // ✅ NEW: Check if message is deleted for current user
          const isDeletedForMe = isMessageDeletedForMe(message);
          
          // ✅ NEW: Skip rendering if deleted for me
          if (isDeletedForMe) return null;

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"} group relative`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMyMessage
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              
              {/* ✅ NEW: Message bubble with options */}
              <div className="chat-bubble flex flex-col relative">
                {/* ✅ NEW: Message options button */}
                <button
                  className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 
                           transition-opacity duration-200 bg-base-200 hover:bg-base-300 
                           rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessageOptions(showMessageOptions === message._id ? null : message._id);
                  }}
                >
                  <MoreVertical size={16} />
                </button>

                {/* ✅ NEW: Message options dropdown */}
                {showMessageOptions === message._id && (
                  <div className="absolute top-6 right-2 bg-base-100 border border-base-300 
                                rounded-lg shadow-lg z-10 min-w-[160px]"
                       onClick={(e) => e.stopPropagation()}>
                    
                    {/* Delete for Me */}
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-base-200 
                               flex items-center gap-2 text-sm"
                      onClick={() => handleDeleteMessage(message._id, "forMe")}
                    >
                      <Trash2 size={16} />
                      Delete for me
                    </button>

                    {/* Delete for Everyone - only for own messages within time limit */}
                    {canDeleteForEveryone(message, isMyMessage) && (
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-base-200 
                                 flex items-center gap-2 text-sm text-red-500"
                        onClick={() => handleDeleteMessage(message._id, "forEveryone")}
                      >
                        <Trash2Icon size={16} />
                        Delete for everyone
                      </button>
                    )}
                  </div>
                )}

                {/* ✅ Message content */}
                {message.deletedForEveryone ? (
                  <p className="italic text-gray-500">This message was deleted</p>
                ) : (
                  <>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[200px] rounded-md mb-2"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* ✅ TYPING INDICATOR */}
        {isTyping && typingUser && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={typingUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-bubble bg-base-300">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-500">typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;