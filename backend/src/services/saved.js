import User from "../models/user.js";

export const addSavedListing = async (userId, listingId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedListings: listingId } }, // prevents duplicates
    { new: true }
  ).populate("savedListings");
};

export const removeSavedListing = async (userId, listingId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { savedListings: listingId } },
    { new: true }
  ).populate("savedListings");
};

export const getSavedListings = async (userId) => {
  return await User.findById(userId)
    .select("savedListings")
    .populate("savedListings");
};
