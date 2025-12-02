"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedIds, setSavedIds] = useState([]); // <-- IDs of saved listings

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
    if (!token) return; // not logged in, hearts will all be empty

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

      // backend returns array of saved listing docs
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
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-4 border-b shadow-sm bg-white">
        <h1
          className="text-3xl font-bold text-blue-600 cursor-pointer"
          onClick={() => router.push("/home")}
        >
          CampusXchange
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/sell")}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
          >
            + SELL
          </button>

          <button
            onClick={() => router.push("/my-listings")}
            className="px-4 py-2 text-gray-600 hover:text-blue-600"
          >
            My Listings
          </button>

          <button
            onClick={() => router.push("/saved")}
            className="px-4 py-2 text-gray-600 hover:text-red-600"
          >
            Saved
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="px-4 py-2 text-gray-600 hover:text-green-600"
          >
            Profile
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
        {filtered.map((item) => {
          const isSaved = savedIds.includes(item._id);

          return (
            <div
              key={item._id}
              className="border rounded-lg shadow-sm hover:shadow-md transition bg-white cursor-pointer"
              onClick={() => router.push(`/product/${item._id}`)}
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

                {/* HEART ICON */}
                {isSaved ? (
                  <AiFillHeart
                    className="absolute top-3 right-3 text-2xl text-red-500 bg-white rounded-full p-1 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation(); // don't open product page
                      toggleSave(item._id);
                    }}
                  />
                ) : (
                  <AiOutlineHeart
                    className="absolute top-3 right-3 text-2xl text-gray-700 bg-white rounded-full p-1 shadow-sm hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item._id);
                    }}
                  />
                )}
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
          );
        })}

        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No items found.
          </p>
        )}
      </div>
    </div>
  );
}
