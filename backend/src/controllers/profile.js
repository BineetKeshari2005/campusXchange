import {
  getUserById,
  updateUserById
} from "../services/profile.js";
import { uploadToCloudinary } from "../services/upload.js"; 


export const getMyProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const updated = await updateUserById(req.user.id, req.body);
    res.status(200).json({ message: "Profile updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await getUserById(req.params.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Upload to Cloudinary
    const imageURL = await uploadToCloudinary(req.file.buffer);

    // Update user with new profile photo
    const updatedUser = await updateUserById(req.user.id, { profilePhoto: imageURL });

    res.status(200).json({
      message: "Profile photo updated",
      photo: imageURL,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile Photo Upload Error:", error);
    res.status(500).json({ message: "Failed to upload profile photo" });
  }
};