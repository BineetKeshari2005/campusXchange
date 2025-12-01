import Listing from "../models/listing.js";

export const createListing = async (data) => {
  const listing = new Listing(data);
  return await listing.save();
};

export const getListings = async (filters = {}) => {
  const {
    search,
    category,
    condition,
    minPrice,
    maxPrice,
    location,   // e.g. "Hostel A"
    sort,
    page = 1,
    limit = 10,
  } = filters;

  const query = { status: "active" };

  // 🔍 Full-text search
  if (search) {
    query.$text = { $search: search };
  }

  // 🎯 Category filter
  if (category) {
    query.category = category;
  }

  // 🧹 Condition filter
  if (condition) {
    query.condition = condition;
  }

  // 💰 Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // 🏠 Location / hostel (case-insensitive substring)
  if (location) {
    query.location = new RegExp(location, "i");
  }

  // 📄 Pagination
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  // 🔽 Sorting
  let sortOption = { createdAt: -1 }; // default = latest
  let projection = {};

  if (search) {
    // sort by text relevance when searching
    projection.score = { $meta: "textScore" };
    sortOption = { score: { $meta: "textScore" } };
  }

  if (sort === "latest") {
    sortOption = { createdAt: -1 };
  } else if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sort === "price_asc") {
    sortOption = { price: 1 };
  } else if (sort === "price_desc") {
    sortOption = { price: -1 };
  }

  const [items, total] = await Promise.all([
    Listing.find(query, projection)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("seller", "name email profilePhoto hostel"),
    Listing.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return {
    items,
    total,
    page: pageNum,
    totalPages,
  };
};

export const getListingById = async (id) => {
  return await Listing.findById(id).populate("seller", "name email");
};

export const updateListing = async (id, userId, data) => {
  // only seller can update
  const listing = await Listing.findOneAndUpdate(
    { _id: id, seller: userId },
    data,
    { new: true }
  );
  return listing;
};

export const deleteListing = async (id, userId) => {
  const listing = await Listing.findOneAndDelete({ _id: id, seller: userId });
  return listing;
};


export const getMyListings = async (userId) => {
  return await Listing.find({ seller: userId })
    .sort({ createdAt: -1 });
};
