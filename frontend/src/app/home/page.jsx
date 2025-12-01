"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AiOutlineHeart } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
console.log("API:", process.env.NEXT_PUBLIC_API_URL);

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  

  const categories = [
    "All",
    "books",
    "electronics",
    "notes",
    "accessories",
    "others",
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // ⬇ Fetch Listings From Backend
  const fetchListings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings`);
      setListings(res.data.items);
      setFiltered(res.data.items);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // ⬇ Filtering Logic
  useEffect(() => {
    let result = listings;

    if (activeCategory !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [search, activeCategory, listings]);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + " mins ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hrs ago";
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 border-b shadow-sm bg-white">
        <h1 className="text-3xl font-bold text-blue-600">CampusXchange</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/sell")}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
          >
            + SELL
          </button>

          <button
            onClick={handleLogout}
            className="text-red-500 font-medium hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* SEARCH BAR */}
      <div className="flex justify-center mt-6 px-4">
        <div className="flex items-center w-full max-w-3xl border rounded-lg shadow-sm px-4 py-3 bg-white">
          <FiSearch className="text-gray-500 text-xl mr-2" />
          <input
            type="text"
            placeholder='Search items (ex: "Book", "Phone")'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-gray-700"
          />
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div className="flex gap-6 px-6 mt-6 overflow-x-auto pb-2 text-gray-700 font-medium">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-1 border-b-2 transition ${
              activeCategory === cat
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-blue-500"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* LISTINGS GRID */}
      <div className="px-6 mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg shadow-sm hover:shadow-md transition bg-white cursor-pointer"
            onClick={() => router.push(`/listing/${item._id}`)}
          >
            <div className="relative">
              <img
                src={
                  item.images?.[0] ||
                  "https://via.placeholder.com/400x300?text=No+Image"
                }
                alt={item.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <AiOutlineHeart className="absolute top-3 right-3 text-2xl text-gray-700 bg-white rounded-full p-1 shadow-sm hover:text-red-500 transition" />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                ₹{item.price}
              </h3>

              <p className="text-gray-600 text-sm mt-1">{item.title}</p>

              <p className="text-gray-400 text-xs mt-2">{item.location}</p>

              <p className="text-gray-400 text-xs">
                {getTimeAgo(item.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No items found.
          </p>
        )}
      </div>
    </div>
  );
}
