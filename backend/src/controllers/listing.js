import * as listingService from "../services/listing.js";
import { getMyListings } from "../services/listing.js";

export const createListing = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // ------------------------------------------------------------------
    // ✅ FIX: Use the 'path' property provided by multer-storage-cloudinary
    // ------------------------------------------------------------------
    const imageUrls = (req.files || []).map((file) => file.path);
    // ------------------------------------------------------------------
    
    const data = {
      ...req.body,
      seller: req.user.id, // ⬅ IMPORTANT: using your token payload
      images: imageUrls,
    };

    const listing = await listingService.createListing(data);

    res.status(201).json({ message: "Listing created", data: listing });
  } catch (err) {
    next(err);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const data = await listingService.getListings(req.query);
    res.status(200).json(data);
  } catch (err) {
    console.error("Get listings error:", err);
    next(err);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const listingId = req.params.id;

    // Upload new images if provided
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer))
      );
    }

    const updateData = { ...req.body };

    // If images were uploaded, update them
    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
    }

    const updatedListing = await listingService.updateListing(
      listingId,
      userId,
      updateData
    );

    if (!updatedListing) {
      return res.status(404).json({
        message: "Listing not found OR you are not the owner",
      });
    }

    res.status(200).json({
      message: "Listing updated",
      data: updatedListing,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const listing = await listingService.deleteListing(req.params.id, userId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found OR you are not the owner",
      });
    }

    res.status(200).json({ message: "Listing deleted" });
  } catch (err) {
    next(err);
  }
};

export const fetchMyListings = async (req, res) => {
  try {
    const listings = await getMyListings(req.user.id);
    res.status(200).json({
      total: listings.length,
      items: listings
    });
  } catch (error) {
    console.error("My Listings Error:", error);
    res.status(500).json({ message: "Failed to fetch your listings" });
  }
};