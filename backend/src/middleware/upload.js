import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configuration/cloudinary.js";

// Define storage in a specific folder in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "campusxchange/listings", // change folder name if you like
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

export default upload;
