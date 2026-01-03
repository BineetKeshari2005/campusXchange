import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },

  amount: Number,

  // Razorpay fields
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
