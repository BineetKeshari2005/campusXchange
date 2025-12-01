import {
  addSavedListing,
  removeSavedListing,
  getSavedListings
} from "../services/saved.js";

export const saveListing = async (req, res) => {
  try {
    const result = await addSavedListing(req.user.id, req.params.listingId);
    res.status(200).json({ message: "Listing saved", data: result.savedListings });
  } catch (err) {
    res.status(500).json({ message: "Failed to save listing" });
  }
};

export const unsaveListing = async (req, res) => {
  try {
    const result = await removeSavedListing(req.user.id, req.params.listingId);
    res.status(200).json({ message: "Listing removed from saved", data: result.savedListings });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove saved listing" });
  }
};

export const getMySavedListings = async (req, res) => {
  try {
    const saved = await getSavedListings(req.user.id);
    res.status(200).json(saved.savedListings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch saved listings" });
  }
};
