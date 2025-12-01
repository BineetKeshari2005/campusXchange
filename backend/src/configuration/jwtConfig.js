import dotenv from "dotenv";
dotenv.config();    // VERY IMPORTANT

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  console.error("❌ ERROR: JWT_SECRET is undefined! Check your .env file.");
}

export default secretKey;
