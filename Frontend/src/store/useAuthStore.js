import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// ✅ FIXED: Separate BASE_URL for API and Socket
const API_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
const SOCKET_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ FIXED: Better socket connection with error handling
  connectSocket: () => {
    const { authUser, socket } = get();
    
    // Don't connect if no user or already connected
    if (!authUser || socket?.connected) return;

    console.log("Connecting socket for user:", authUser._id);

    const newSocket = io(SOCKET_BASE_URL, {
      query: {
        userId: authUser._id,
      },
      // ✅ FIXED: Better connection options
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    // ✅ FIXED: Socket event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected successfully:", newSocket.id);
      set({ socket: newSocket });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection failed. Please try again.");
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users updated:", userIds);
      set({ onlineUsers: userIds });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // ✅ FIXED: Set socket immediately for typing events
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      console.log("Disconnecting socket...");
      socket.disconnect();
      set({ socket: null });
    }
  },
}));