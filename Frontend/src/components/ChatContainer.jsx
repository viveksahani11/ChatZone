import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  
  // ✅ TYPING INDICATOR STATE
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

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

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          // ✅ FIXED: Proper sender ID extraction
          const messageSenderId = typeof message.senderId === 'object' 
            ? message.senderId._id 
            : message.senderId;
          
          const isMyMessage = messageSenderId === authUser._id;
          
          console.log("🔍 Message debug:", {
            messageId: message._id,
            messageSenderId,
            currentUserId: authUser._id,
            isMyMessage,
            messageText: message.text
          });

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
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
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
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