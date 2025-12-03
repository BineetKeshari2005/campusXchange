import express from "express";
import authenticateToken from "../utils/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  uploadProfilePhoto
} from "../controllers/profile.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.get("/me", authenticateToken, getMyProfile);
router.put("/me", authenticateToken, updateMyProfile);
router.put("/me/photo", authenticateToken, upload.single("photo"), uploadProfilePhoto);
router.get("/:userId", authenticateToken, getUserProfile);



export default router;
