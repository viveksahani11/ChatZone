import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import { getUserConversations } from "../controllers/conversation.controller.js";

const router = express.Router();


router.get("/users",protectRoute, getUsersForSidebar);
router.get("/:id",protectRoute, getMessages);
router.get("/conversations/:userId", protectRoute, getUserConversations);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
