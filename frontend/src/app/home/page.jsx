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
  const [pagination, setPagination] = useState({});
  const [savedIds, setSavedIds] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");

  const categories = ["All", "books", "electronics", "notes", "accessories", "others"];

  // ===============================
  // FETCH LISTINGS (BACKEND FILTERS)
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
      setPagination(data.pagination || {});
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
  // TOGGLE SAVE
  // ===============================
  const toggleSave = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      router.push("/auth/login");
      return;
    }

    const isSaved = savedIds.includes(id);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved/${id}`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return;

      setSavedIds((prev) =>
        isSaved ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  };

  // ===============================
  // REFETCH when filters change
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

      {/* SEARCH BAR */}
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
      </div>

      {/* CATEGORY BAR */}
      <div className="flex justify-center mt-6 px-6 overflow-x-auto pb-2">
        <div className="flex gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setPage(1);
                setActiveCategory(cat);
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
      <div className="flex flex-col items-center">
      {/* Ensure 'pagination' state is available in scope, e.g., 
        const { totalPages } = pagination; 
      */}
      <div className="flex justify-center items-center gap-6 py-8 px-4 md:px-6 border-t border-gray-200 w-full max-w-lg mx-auto">
        
        {/* Previous Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </motion.button>

        {/* Page Info */}
        <span className="font-bold text-lg text-gray-800 px-3 py-1 rounded-full bg-blue-100/70 shadow-sm">
          <span className="text-blue-600">
            {pagination.page || 1}
          </span>
          <span className="text-gray-500"> / </span>
          {pagination.totalPages || 1}
        </span>

        {/* Next Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={page === pagination.totalPages || pagination.totalPages === 0}
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
    </div>
  );
}
