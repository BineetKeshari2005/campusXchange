// routes/user.js
import express from "express";
import cors from "cors";
import authenticateToken from "../utils/authMiddleware.js";
// import User from "../models/user.js"; // No need to import model here
import { getUser, deleteUser } from "../controllers/user.js"; // *** NEW: Import deleteUser ***

const router = express.Router();
router.use(cors());

// GET /api/users
router.get("/", authenticateToken, getUser); // Use "/" for resource root

// --- NEW: DELETE route for the authenticated user ---
// DELETE /api/users/me
// It uses `authenticateToken` to ensure only the logged-in user can delete their profile.
router.delete("/me", authenticateToken, deleteUser);

export default router;