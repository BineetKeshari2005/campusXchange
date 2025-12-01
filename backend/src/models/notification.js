import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    link: { type: String }, // optional redirect on frontend
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["message", "save", "sold", "profile"],
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
