import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },

  lastMessage: String,
  lastMessageAt: Date,
  closed: { type: Boolean, default: false },

  unread: {
    buyer: { type: Number, default: 0 },
    seller: { type: Number, default: 0 }
  },

  expiresAt: { type: Date, index: { expires: "7d" } }
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
