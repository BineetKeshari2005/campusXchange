
import bcrypt from "bcrypt";
import User from "../models/user.js";
import generateToken from "../utils/jwtUtils.js";
import verifyToken from "../utils/verifyToken.js";

async function refreshToken(oldToken) {
  try {
    // Remove "Bearer " if it exists
    const token = oldToken.startsWith("Bearer ") ? oldToken.split(" ")[1] : oldToken;

    // Verify the token
    const decodedToken = verifyToken(token);

    // Find the user by id from payload
    const user = await User.findById(decodedToken.id);
    if (!user) {
      throw new Error("User not Found");
    }

    // Generate a new token
    const newToken = generateToken(user);
    return newToken;
  } catch (error) {
    console.log("Refresh Token Error:", error.message);
    throw new Error("Invalid Token");
  }
}

export default refreshToken;