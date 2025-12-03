import express from "express";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listing.js";

import authenticateToken from "../utils/authMiddleware.js";
import upload from "../middleware/upload.js";
import { fetchMyListings } from "../controllers/listing.js";

const router = express.Router();

router.get("/my", authenticateToken, fetchMyListings);
// PUBLIC ROUTES
router.get("/", getListings);
router.get("/:id", getListingById);

router.post(
  "/",
  authenticateToken,
  upload.array("images", 5),   // up to 5 images
  createListing
);

router.put(
  "/:id",
  authenticateToken,
  upload.array("images", 5),
  updateListing
);

router.delete("/:id", authenticateToken, deleteListing);


export default router;
