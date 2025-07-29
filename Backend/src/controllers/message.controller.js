import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get all users except current user
    const allUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Get latest message for each user
    const usersWithLatestMessage = await Promise.all(
      allUsers.map(async (user) => {
        // Find conversation between current user and this user
        const conversation = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId }
          ]
        })
        .populate("senderId", "username fullName")
        .sort({ createdAt: -1 })
        .limit(1);

        return {
          ...user.toObject(),
          latestMessage: conversation ? {
            text: conversation.text,
            createdAt: conversation.createdAt,
            sender: conversation.senderId
          } : null
        };
      })
    );

    res.status(200).json(usersWithLatestMessage);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Handle image upload logic here if needed
      // For now, assume image is already a URL or base64
      imageUrl = image;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // ✅ FIXED: Populate sender info for better frontend handling
    await newMessage.populate("senderId", "username fullName profilePic");
    await newMessage.populate("receiverId", "username fullName profilePic");

    // Get receiver's socket ID
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    // ✅ FIXED: Emit to receiver only (not sender)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // ✅ FIXED: Don't emit to sender - they already have the message from API response
    // This prevents duplicate messages

    // ✅ FIXED: Emit sidebar updates to both users
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("updateSidebar", {
        userId: senderId,
        message: newMessage
      });
    }
    
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("updateSidebar", {
        userId: receiverId,
        message: newMessage
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ NEW: Clear entire chat between two users
export const clearChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Delete all messages between current user and specified user
    await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    });

    // Emit to both users about chat being cleared
    const receiverSocketId = getReceiverSocketId(userId);
    const senderSocketId = getReceiverSocketId(currentUserId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatCleared", {
        clearedBy: currentUserId,
        clearedFor: userId
      });
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("chatCleared", {
        clearedBy: currentUserId,
        clearedFor: currentUserId
      });
    }

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Error in clearChat controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ NEW: Delete message for current user only
export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Add current user to deletedFor array
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { 
        $addToSet: { deletedFor: currentUserId }
      },
      { new: true }
    );

    // Emit to current user only
    const senderSocketId = getReceiverSocketId(currentUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", {
        messageId,
        deletedForEveryone: false,
        deletedFor: [currentUserId]
      });
    }

    res.status(200).json({ message: "Message deleted for you" });
  } catch (error) {
    console.error("Error in deleteMessageForMe controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ NEW: Delete message for everyone (within time limit)
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if current user is the sender
    if (message.senderId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    // Check if message is within time limit (7 minutes)
    const now = new Date();
    const messageTime = new Date(message.createdAt);
    const timeDiff = (now - messageTime) / (1000 * 60); // in minutes

    if (timeDiff > 7) {
      return res.status(400).json({ error: "You can only delete messages within 7 minutes" });
    }

    // Mark message as deleted for everyone
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { 
        deletedForEveryone: true,
        text: "This message was deleted",
        image: null
      },
      { new: true }
    );

    // Emit to both sender and receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    const senderSocketId = getReceiverSocketId(currentUserId);

    const deleteEvent = {
      messageId,
      deletedForEveryone: true,
      deletedFor: []
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", deleteEvent);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", deleteEvent);
    }

    res.status(200).json({ message: "Message deleted for everyone" });
  } catch (error) {
    console.error("Error in deleteMessageForEveryone controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};