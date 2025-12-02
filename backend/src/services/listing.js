"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();

  // Data States
  const [listings, setListings] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

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

  // Fetch filtered listings (FROM BACKEND)
  const fetchListings = async () => {
    try {
      const params = new URLSearchParams({
        search,
        category: activeCategory !== "All" ? activeCategory : "",
        minPrice,
        maxPrice,
        condition,
        sort,
        page,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings?${params.toString()}`
      );

      const data = await res.json();

      if (res.ok) {
        setListings(data.items || []);
        setPagination(data.pagination);
      } else {
        console.error("Listing fetch failed", data);
      }
    } catch (err) {
      console.error("Fetch listings error:", err);
    }
  };

  // Fetch saved items
  const fetchSaved = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setSavedIds(data.map((item) => item._id));
      }
    } catch (err) {
      console.error("Saved fetch error:", err);
    }
  };

  // Toggle save
  const toggleSave = async (listingId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const isSaved = savedIds.includes(listingId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved/${listingId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        if (isSaved) {
          setSavedIds((prev) => prev.filter((id) => id !== listingId));
        } else {
          setSavedIds((prev) => [...prev, listingId]);
        }
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  };

  // Auto-fetch on load + whenever filters change
  useEffect(() => {
    fetchListings();
  }, [search, activeCategory, minPrice, maxPrice, condition, sort, page]);

  // Load saved items separately
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
            className="px-6 py-2 bg-blue-600 text-white rounded-full"
          >
            + SELL
          </button>

          <button onClick={() => router.push("/my-listings")} className="hover:text-blue-600">
            My Listings
          </button>

          <button onClick={() => router.push("/saved")} className="hover:text-red-600">
            Saved
          </button>

          <button onClick={() => router.push("/profile")} className="hover:text-green-600">
            Profile
          </button>

          <button onClick={handleLogout} className="text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      {/* SEARCH BAR */}
      <div className="flex justify-center mt-6 px-4">
        <div className="flex items-center w-full max-w-3xl border rounded-lg px-4 py-3 shadow-sm">
          <FiSearch className="text-gray-500 text-xl mr-2" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full outline-none"
          />
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div className="flex gap-6 px-6 mt-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setPage(1);
              setActiveCategory(cat);
            }}
            className={`pb-1 border-b-2 ${
              activeCategory === cat
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ADVANCED FILTERS */}
      <div className="px-6 mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">

        {/* Condition */}
        <select
          value={condition}
          onChange={(e) => {
            setPage(1);
            setCondition(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="">Condition (All)</option>
          <option value="new">New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>

        {/* Price Range */}
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => {
            setPage(1);
            setMinPrice(e.target.value);
          }}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => {
            setPage(1);
            setMaxPrice(e.target.value);
          }}
          className="border p-2 rounded"
        />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>

      </div>

      {/* LISTINGS GRID */}
      <div className="px-6 mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {listings.map((item) => {
          const isSaved = savedIds.includes(item._id);

          return (
            <div
              key={item._id}
              className="border rounded-lg shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => router.push(`/product/${item._id}`)}
            >
              <div className="relative">
                <img
                  src={item.images?.[0] || "https://via.placeholder.com/400"}
                  className="w-full h-48 object-cover rounded-t-lg"
                />

                {/* HEART ICON */}
                {isSaved ? (
                  <AiFillHeart
                    className="absolute top-3 right-3 text-2xl text-red-500 bg-white rounded-full p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item._id);
                    }}
                  />
                ) : (
                  <AiOutlineHeart
                    className="absolute top-3 right-3 text-2xl text-gray-700 bg-white rounded-full p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item._id);
                    }}
                  />
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold">₹{item.price}</h3>
                <p className="text-gray-600">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.location}</p>
                <p className="text-gray-400 text-xs">
                  {getTimeAgo(item.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {listings.length === 0 && (
          <p className="text-center col-span-full text-gray-500">
            No items found.
          </p>
        )}
      </div>

      {/* PAGINATION */}
      {pagination && (
        <div className="flex justify-center gap-4 mt-8 mb-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-gray-700 font-medium">
            Page {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
