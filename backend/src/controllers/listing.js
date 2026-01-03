import * as listingService from "../services/listing.js";
import { getMyListings } from "../services/listing.js";
import { uploadToCloudinary } from "../services/upload.js";

export const createListing = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    

    const imageUrls = (req.files || []).map((file) => file.path);

    
    const data = {
      ...req.body,
      seller: req.user.id, 
      images: imageUrls,
      status: "available"
    };

    const listing = await listingService.createListing(data);

    res.status(201).json({ message: "Listing created", data: listing });
  } catch (err) {
    console.error("CRITICAL LISTING CREATION ERROR:", err);
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

export const updateListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;

    let updateData = { ...req.body };


    if (req.files && req.files.length > 0) {
      const cloudinaryUrls = req.files.map((file) => file.path);
      updateData.images = cloudinaryUrls;
    }

    const updated = await listingService.updateListing(
      listingId,
      userId,
      updateData
    );

    if (!updated) {
      return res.status(404).json({
        message: "Listing not found or you are not the owner",
      });
    }

    res.status(200).json({
      message: "Listing updated",
      data: updated,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
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