import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: ["books", "electronics", "notes", "other"],
      required: true,
    },

    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair"],
      default: "good",
    },

    images: [
      {
        type: String, // Cloudinary URLs (you already have cloudinary config)
      },
    ],

    location: {
      type: String, // e.g. "Hostel A", "Library", "CSE Block"
      required: true,
    },

    // Seller is the logged-in user
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "sold", "hidden"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
listingSchema.index({ title: "text", description: "text" });


// prevent OverwriteModelError
export default mongoose.models.Listing || mongoose.model("Listing", listingSchema);
