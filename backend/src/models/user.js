import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    phone: { type: String, default: "" },

    hostel: { type: String, default: "" },

    room: { type: String, default: "" },

    bio: { type: String, default: "" },

    profilePhoto: { type: String, default: "" }, // Cloudinary URL

    razorpayAccountId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["not_enabled", "pending_verification", "active"],
      default: "not_enabled"
    },

  //    sold: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  // bought: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],

    savedListings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Listing" }
    ],
  },
  { timestamps: true }
);

// FIX: prevents OverwriteModelError on hot reload
export default mongoose.models.User || mongoose.model("User", userSchema);