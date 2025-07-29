import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage,
  clearChat,
  deleteMessageForMe,
  deleteMessageForEveryone
} from "../controllers/message.controller.js";
import { getUserConversations } from "../controllers/conversation.controller.js";

const router = express.Router();

// ✅ EXISTING ROUTES
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.get("/conversations/:userId", protectRoute, getUserConversations);
router.post("/send/:id", protectRoute, sendMessage);

// ✅ NEW ROUTES: Clear Chat & Delete Message
router.delete("/clear/:userId", protectRoute, clearChat);
router.patch("/delete-for-me/:messageId", protectRoute, deleteMessageForMe);
router.delete("/delete-for-everyone/:messageId", protectRoute, deleteMessageForEveryone);

export default router;