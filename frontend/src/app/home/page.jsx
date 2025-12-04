"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [savedIds, setSavedIds] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 8;
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");

  const categories = ["All", "books", "electronics", "notes", "accessories", "others"];

  // ===============================
  // FETCH LISTINGS FROM BACKEND
  // ===============================
  const fetchListings = async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        sort,
        minPrice,
        maxPrice,
        condition,
      });

      if (activeCategory !== "All") {
        params.append("category", activeCategory);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Listings fetch failed:", data);
        return;
      }

      setListings(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Fetch listings error:", err);
    }
  };

  // ===============================
  // FETCH SAVED ITEMS
  // ===============================
  const fetchSaved = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return;

      const ids = Array.isArray(data) ? data.map((i) => i._id) : [];
      setSavedIds(ids);
    } catch (err) {
      console.error("Saved fetch error:", err);
    }
  };

  // ===============================
  // SAVE / UNSAVE TOGGLE
  // ===============================
  const toggleSave = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return alert("Please login first.");
    }

    const isSaved = savedIds.includes(id);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved/${id}`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSavedIds((prev) =>
        isSaved ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  };

  // ===============================
  // EFFECT: LOAD LISTINGS WHEN FILTERS CHANGE
  // ===============================
  useEffect(() => {
    fetchListings();
  }, [page, search, activeCategory, sort, minPrice, maxPrice, condition]);

  useEffect(() => {
    fetchSaved();
  }, []);

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + " mins ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* SEARCH BAR
      <div className="flex justify-center mt-8 px-4">
        <div className="flex items-center w-full max-w-4xl border border-gray-200 rounded-xl shadow-lg px-5 py-3 bg-white">
          <FiSearch className="text-gray-400 text-xl mr-3" />
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full outline-none text-gray-800"
          />
        </div>
      </div> */}

      {/* SORTING DROPDOWN */}
<div className="flex justify-center mt-8 px-4">
  <div className="flex items-start w-full max-w-4xl gap-4">
    
    {/* 1. SEARCH BAR (Takes up most space) */}
    <div className="flex items-center w-full max-w-3xl border border-gray-200 rounded-xl shadow-lg px-5 py-3 bg-white">
      <FiSearch className="text-gray-400 text-xl mr-3" />
      <input
        type="text"
        placeholder="Search items…"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
        className="w-full outline-none text-gray-800"
      />
    </div>

    {/* 2. SORTING DROPDOWN (Fixed width/placement to the right) */}
    <div className="flex-shrink-0">
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value);
          setPage(1);
        }}
        className="border p-3 rounded-xl bg-white shadow-lg text-gray-700 h-full cursor-pointer hover:border-blue-400 transition"
      >
        <option value="newest">Newest First</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>
    </div>

  </div>
</div>

      {/* CATEGORY BAR */}
      <div className="flex justify-center mt-6 px-6 overflow-x-auto pb-2">
        <div className="flex gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setPage(1);
              }}
              className={`pb-1 ${
                activeCategory === cat
                  ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* LISTINGS GRID */}
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((item) => {
          const isSaved = savedIds.includes(item._id);

          return (
            <div
              key={item._id}
              className="border rounded-xl shadow-md hover:shadow-xl transition bg-white cursor-pointer"
              onClick={() => router.push(`/product/${item._id}`)}
            >
              <div className="relative">
                <img
                  src={
                    item.images?.[0] ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />

                {/* HEART ICON */}
                {isSaved ? (
                  <AiFillHeart
                    className="absolute top-3 right-3 text-3xl text-red-500 bg-white rounded-full p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item._id);
                    }}
                  />
                ) : (
                  <AiOutlineHeart
                    className="absolute top-3 right-3 text-3xl text-gray-700 bg-white rounded-full p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item._id);
                    }}
                  />
                )}
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900">₹{item.price}</h3>
                <p className="text-gray-700 mt-1 line-clamp-2">{item.title}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                  <p className="truncate">{item.location}</p>
                  <p>{getTimeAgo(item.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-6 py-8">

        {/* Previous */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={pagination.page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-blue-50 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </motion.button>

        {/* Page Info */}
        <span className="font-bold text-lg text-gray-800 px-3 py-1 rounded-full bg-blue-100 shadow-sm">
          {pagination.page} / {pagination.totalPages}
        </span>

        {/* Next */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={pagination.page === pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-blue-50 disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
