import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await Conversation.find({ members: userId }).populate(
      "members",
      "username profilePhoto"
    );

    const results = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversationId: conv._id }).sort({
          createdAt: -1,
        });
        return {
          ...conv._doc,
          latestMessage: lastMessage || null,
        };
      })
    );

    // Sort by latest message time
    results.sort(
      (a, b) =>
        new Date(b.latestMessage?.createdAt || 0) -
        new Date(a.latestMessage?.createdAt || 0)
    );

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Server error" });
  }
};
