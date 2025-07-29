import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    // ✅ NEW: Track which users deleted this message for themselves
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }],
    // ✅ NEW: Track if message is deleted for everyone
    deletedForEveryone: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;