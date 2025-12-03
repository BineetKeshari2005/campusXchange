"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa"; 
import { VscNotebook } from "react-icons/vsc"; // Icon for My Listings

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedIds, setSavedIds] = useState([]); 

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

  // Fetch all listings
  const fetchListings = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings`
      );
      const data = await res.json();

      if (!res.ok) {
        console.error("Listings fetch failed:", data);
        alert(data.message || "Failed to fetch listings");
        return;
      }

      setListings(data.items || []);
      setFiltered(data.items || []);
    } catch (error) {
      console.error("Fetch listings error:", error);
    }
  };

  // Fetch saved listings for logged-in user
  const fetchSaved = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; 

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Saved fetch failed:", data);
        return;
      }

      const ids = Array.isArray(data) ? data.map((item) => item._id) : [];
      setSavedIds(ids);
    } catch (err) {
      console.error("Saved fetch error:", err);
    }
  };

  // Toggle save/unsave listing
  const toggleSave = async (listingId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to save items");
      router.push("/auth/login");
      return;
    }

    const isSaved = savedIds.includes(listingId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved/${listingId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Toggle save failed:", data);
        alert(data.message || "Failed to update saved items");
        return;
      }

      // Update local state
      if (isSaved) {
        setSavedIds((prev) => prev.filter((id) => id !== listingId));
      } else {
        setSavedIds((prev) => [...prev, listingId]);
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchListings();
    fetchSaved();
  }, []);

  // Filtering
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


      {/* SEARCH BAR: Centered and polished */}
      <div className="flex justify-center mt-8 px-4">
        <div className="flex items-center w-full max-w-4xl border border-gray-200 rounded-xl shadow-lg px-5 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 transition duration-300">
          <FiSearch className="text-gray-400 text-xl mr-3" />
          <input
            type="text"
            placeholder='Search items (ex: "Book", "Phone", "Notes")'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-gray-800 placeholder-gray-400 text-base"
          />
        </div>
      </div>

      {/* CATEGORY BAR: Clean tab selection */}
      <div className="flex justify-center mt-6 px-6 overflow-x-auto pb-2">
        <div className="flex gap-4 sm:gap-6 text-sm font-medium whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-1 transition duration-200 ${
                activeCategory === cat
                  ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                  : "text-gray-600 hover:text-blue-500 border-b-2 border-transparent"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* LISTINGS GRID: Enhanced card design */}
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filtered.map((item) => {
          const isSaved = savedIds.includes(item._id);

          return (
            <div
              key={item._id}
              className="border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 bg-white cursor-pointer overflow-hidden"
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
                    className="absolute top-3 right-3 text-3xl text-red-500 bg-white rounded-full p-1 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation(); // don't open product page
                      toggleSave(item._id);
                    }}
                  />
                ) : (
                  <AiOutlineHeart
                    className="absolute top-3 right-3 text-3xl text-gray-700 bg-white rounded-full p-1 shadow-md hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item._id);
                    }}
                  />
                )}
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900">
                  ₹{item.price}
                </h3>

                <p className="text-gray-700 text-base mt-1 h-10 overflow-hidden line-clamp-2">
                  {item.title}
                </p>

                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <p className="truncate">{item.location}</p>

                  <p className="whitespace-nowrap">
                    {getTimeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500 text-lg py-12">
            No items found matching your criteria. Try adjusting the search or category.
          </p>
        )}
      </div>
    </div>
  );
}