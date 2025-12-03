import Listing from "../models/Listing.js";

// ================================
// GET ALL LISTINGS WITH FILTERS
// ================================
export const getAllListings = async (query) => {
  let {
    search,
    category,
    minPrice,
    maxPrice,
    condition,
    sort,
    page = 1,
    limit = 20,
  } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = {};

  // SEARCH filter
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  // CATEGORY filter
  if (category && category !== "All") {
    filter.category = category.toLowerCase();
  }

  // PRICE RANGE
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // CONDITION filter
  if (condition) {
    filter.condition = condition.toLowerCase();
  }

  // ----------------------------
  // SORTING
  // ----------------------------
  let sortOptions = {};

  if (sort === "newest") sortOptions = { createdAt: -1 };
  else if (sort === "price_asc") sortOptions = { price: 1 };
  else if (sort === "price_desc") sortOptions = { price: -1 };
  else sortOptions = { createdAt: -1 }; // default

  // ----------------------------
  // PAGINATION
  // ----------------------------
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate("seller", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),

    Listing.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ================================
// GET SINGLE LISTING BY ID
// ================================
export const getListingById = async (id) => {
  return await Listing.findById(id).populate("seller", "name email");
};

// ================================
// CREATE LISTING
// ================================
export const createListing = async (data) => {
  console.log("REQ FILES:", req.files);
  console.log("REQ BODY:", req.body);
  return await Listing.create(data);
};

// ================================
// UPDATE LISTING
// ================================
export const updateListingById = async (id, data) => {
  return await Listing.findByIdAndUpdate(id, data, { new: true });
};

// ================================
// DELETE LISTING
// ================================
export const deleteListingById = async (id) => {
  return await Listing.findByIdAndDelete(id);
};

// ================================
// GET LISTINGS FOR LOGGED-IN USER
// ================================
export const getMyListings = async (userId) => {
  return await Listing.find({ seller: userId }).sort({ createdAt: -1 });
};
