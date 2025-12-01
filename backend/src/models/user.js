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

    savedListings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Listing" }
    ],
  },
  { timestamps: true }
);

// FIX: prevents OverwriteModelError on hot reload
export default mongoose.models.User || mongoose.model("User", userSchema);