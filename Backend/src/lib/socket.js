import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"], // ✅ EXISTING: Both ports
    methods: ["GET", "POST"],
  },
});

// Store online users
const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ EXISTING: TYPING INDICATORS (unchanged)
  socket.on("typing", ({ receiverId, isTyping }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("userTyping", {
        senderId: userId,
        isTyping
      });
    }
  });

  // ✅ NEW: Handle message deletion events (optional - controller handles this directly)
  socket.on("messageDeleted", ({ messageId, receiverId, deletedForEveryone, deletedFor }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("messageDeleted", {
        messageId,
        deletedForEveryone,
        deletedFor
      });
    }
  });

  // ✅ NEW: Handle chat clear events (optional - controller handles this directly)
  socket.on("chatCleared", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("chatCleared", {
        clearedBy: userId,
        clearedFor: receiverId
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };