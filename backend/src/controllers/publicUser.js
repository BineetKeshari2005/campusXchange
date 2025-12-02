import User from "../models/user.js";
import Listing from "../models/listing.js";

export const getPublicUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("name email phone hostel room");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const listings = await Listing.find({ seller: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      user,
      listings
    });

  } catch (err) {
    console.error("Public User Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
