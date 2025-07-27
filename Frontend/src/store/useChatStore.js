import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      console.log("🚀 Sending message to:", selectedUser.fullName);
      
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      
      console.log("✅ Message sent successfully");
      
      // ✅ FIXED: Add message to state immediately (optimistic update)
      set({ messages: [...messages, res.data] });
      
      // ✅ FIXED: Update users list after sending message
      get().getUsers();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // ✅ FIXED: Listen to socket events for real-time updates
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      console.log("📨 New message received via socket");
      
      const { selectedUser: currentSelectedUser, messages } = get();
      const currentUserId = useAuthStore.getState().authUser?._id;
      
      // ✅ FIXED: Proper ID comparison (handle both object and string)
      const messageSenderId = typeof newMessage.senderId === 'object' 
        ? newMessage.senderId._id 
        : newMessage.senderId;
      
      const isMessageFromSelectedUser = messageSenderId === currentSelectedUser?._id;
      const isCurrentUserSender = messageSenderId === currentUserId;
      const messageExists = messages.some(msg => msg._id === newMessage._id);
      
      console.log("🔍 Checks:", {
        messageSenderId,
        selectedUserId: currentSelectedUser?._id,
        currentUserId,
        isMessageFromSelectedUser,
        isCurrentUserSender,
        shouldAddMessage: isMessageFromSelectedUser && !isCurrentUserSender && !messageExists
      });
      
      // ✅ FIXED: Only add message if it's FROM selected user TO current user
      if (isMessageFromSelectedUser && !isCurrentUserSender && !messageExists) {
        console.log("✅ Adding message to chat");
        set({
          messages: [...messages, newMessage],
        });
      } else {
        console.log("❌ Not adding message - it's either from current user or duplicate");
      }
      
      // Update users list for sidebar
      get().getUsers();
    });

    // ✅ TYPING INDICATOR SUPPORT
    socket.on("userTyping", ({ senderId, isTyping }) => {
      // Handle typing indicator in ChatContainer component
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // ✅ NEW: Update single user in the list
  updateUserLatestMessage: (userId, message) => {
    const { users } = get();
    const updatedUsers = users.map(user => {
      if (user._id === userId) {
        return {
          ...user,
          latestMessage: {
            text: message.text,
            createdAt: message.createdAt,
            sender: message.senderId
          }
        };
      }
      return user;
    });
    set({ users: updatedUsers });
  }
}));