import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

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
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // ✅ NEW: Clear entire chat
  clearChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${userId}`);
      set({ messages: [] });
      toast.success("Chat cleared successfully");
    } catch (error) {
      toast.error("Failed to clear chat");
      console.error("Clear chat error:", error);
    }
  },

  // ✅ NEW: Delete message for me only
  deleteMessageForMe: async (messageId) => {
    const { messages } = get();
    const currentUserId = useAuthStore.getState().authUser._id;
    
    try {
      await axiosInstance.patch(`/messages/delete-for-me/${messageId}`);
      
      // Update local state - mark message as deleted for current user
      const updatedMessages = messages.map(msg => 
        msg._id === messageId 
          ? { ...msg, deletedFor: [...(msg.deletedFor || []), currentUserId] }
          : msg
      );
      
      set({ messages: updatedMessages });
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
      console.error("Delete message error:", error);
    }
  },

  // ✅ NEW: Delete message for everyone
  deleteMessageForEveryone: async (messageId) => {
    const { messages } = get();
    try {
      await axiosInstance.delete(`/messages/delete-for-everyone/${messageId}`);
      
      // Update local state - mark message as deleted for everyone
      const updatedMessages = messages.map(msg => 
        msg._id === messageId 
          ? { ...msg, deletedForEveryone: true, text: "This message was deleted", image: null }
          : msg
      );
      
      set({ messages: updatedMessages });
      toast.success("Message deleted for everyone");
    } catch (error) {
      toast.error("Failed to delete message for everyone");
      console.error("Delete for everyone error:", error);
    }
  },

  // ✅ NEW: Check if message is deleted for current user
  isMessageDeletedForMe: (message) => {
    const currentUserId = useAuthStore.getState().authUser?._id;
    return message.deletedFor?.includes(currentUserId) || false;
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // ✅ FIXED: Check both sender and receiver
      const messageSenderId = typeof newMessage.senderId === 'object' 
        ? newMessage.senderId._id 
        : newMessage.senderId;
      
      const isMessageSentFromSelectedUser = messageSenderId === selectedUser._id;
      const isMessageSentToSelectedUser = newMessage.receiverId === selectedUser._id;
      
      if (!isMessageSentFromSelectedUser && !isMessageSentToSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // ✅ NEW: Listen for message deletions
    socket.on("messageDeleted", ({ messageId, deletedForEveryone, deletedFor }) => {
      const { messages } = get();
      const updatedMessages = messages.map(msg => {
        if (msg._id === messageId) {
          if (deletedForEveryone) {
            return { ...msg, deletedForEveryone: true, text: "This message was deleted", image: null };
          } else {
            return { ...msg, deletedFor: [...(msg.deletedFor || []), ...deletedFor] };
          }
        }
        return msg;
      });
      set({ messages: updatedMessages });
    });

    // ✅ NEW: Listen for chat clear events
    socket.on("chatCleared", ({ clearedBy, clearedFor }) => {
      const currentUserId = useAuthStore.getState().authUser._id;
      if (clearedFor === currentUserId || clearedBy === currentUserId) {
        set({ messages: [] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("chatCleared");
  },
}));