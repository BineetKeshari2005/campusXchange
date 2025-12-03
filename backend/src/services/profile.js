import User from "../models/user.js";

export const getUserById = async (id) => {
  return await User.findById(id)
    .select("-password") // hide password
    .populate("savedListings");
};

export const updateUserById = async (id, data) => {
  // Define allowed fields to update
  const allowedFields = [
    "name",
    "email",       // only if you want email update
    "phone",
    "hostel",
    "room",
    "bio",
    "profilePhoto" // Cloudinary URL
  ];

  // Build clean update object
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).select("-password");

  return updatedUser;
};