import express from "express";
import Conversation from "../models/conversation.model.js";
import { protectRoute } from "../middleware/auth.middleware.js"; // ✅ Named import

const router = express.Router();


router.get("/all", protectRoute, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
    .populate("participants", "username avatar")
    .populate({
      path: "latestMessage",
      select: "text createdAt sender",
      populate: {
        path: "sender",
        select: "username"
      }
    })
    .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
