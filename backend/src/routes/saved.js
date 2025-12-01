import express from "express";
import authenticateToken from "../utils/authMiddleware.js";
import {
  saveListing,
  unsaveListing,
  getMySavedListings
} from "../controllers/saved.js";

const router = express.Router();

// Save a listing
router.post("/:listingId", authenticateToken, saveListing);

// Remove from saved
router.delete("/:listingId", authenticateToken, unsaveListing);

// Get all saved
router.get("/", authenticateToken, getMySavedListings);

export default router;
