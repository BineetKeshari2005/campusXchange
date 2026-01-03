import Listing from "../models/listing.js";


export const getListings = async (query) => {
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

  const filter = { status: "available" };

  if (search) filter.title = { $regex: search, $options: "i" };
  if (category && category !== "All")
    filter.category = category.toLowerCase();

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (condition) filter.condition = condition.toLowerCase();

  let sortOptions = {};
  if (sort === "newest") sortOptions = { createdAt: -1 };
  else if (sort === "price_asc") sortOptions = { price: 1 };
  else if (sort === "price_desc") sortOptions = { price: -1 };
  else sortOptions = { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate("seller", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),

    Listing.countDocuments({ status: "available", ...filter }),
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


export const createListing = async (data) => {
  return await Listing.create(data);
};


export const getListingById = async (id) => {
  return await Listing.findById(id).populate("seller", "name email");
};


export const updateListing = async (id, userId, data) => {
  return await Listing.findOneAndUpdate(
    { _id: id, seller: userId },
    data,
    { new: true }
  );
};



export const deleteListing = async (id, userId) => {
  return await Listing.findOneAndDelete({ _id: id, seller: userId });
};


export const getMyListings = async (userId) => {
  return await Listing.find({ seller: userId }).sort({ createdAt: -1 });
};
