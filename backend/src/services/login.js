import bcrypt from "bcrypt";
import User from "../models/user.js";
import generateToken from "../utils/jwtUtils.js";
import verifyToken from "../utils/verifyToken.js";

 async function login(email, password) {
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      throw new Error("Invalid Password");
    }

    const token = generateToken(existingUser);
    return ({token, user: existingUser});;
  } catch (error) {
    console.log("Login Error:", error.message);
    throw new Error("Invalid credentials");
  }
}


export default login;