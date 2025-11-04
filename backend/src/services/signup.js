import bcrypt from "bcrypt";
import User from "../models/user.js";
import generateToken from "../utils/jwtUtils.js";

export async function createUser(userData) {
  const { name, email, password } = userData;

  // check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  const savedUser = await user.save();

  // generate token
  const token = generateToken(savedUser);

  return { user: savedUser, token };
}

export default { createUser };
