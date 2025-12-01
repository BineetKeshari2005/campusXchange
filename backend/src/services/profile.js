import User from "../models/user.js";

export const getUserById = async (id) => {
  return await User.findById(id)
    .select("-password") // hide password
    .populate("savedListings");
};

export const updateUserById = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true }).select(
    "-password"
  );
};
