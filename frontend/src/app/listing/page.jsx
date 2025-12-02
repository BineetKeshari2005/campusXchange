"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ListingDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [listing, setListing] = useState(null);

  const fetchListing = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Failed to fetch listing");
        return;
      }

      setListing(data);
    } catch (err) {
      console.log("Error fetching listing:", err);
    }
  };

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  if (!listing)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-white p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded-lg"
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Image */}
        <img
          src={
            listing.images?.[0] ||
            "https://via.placeholder.com/600x400?text=No+Image"
          }
          alt={listing.title}
          className="w-full h-80 object-cover rounded-lg shadow-md"
        />

        {/* Text */}
        <h1 className="text-3xl font-bold mt-6">{listing.title}</h1>

        <h2 className="text-2xl text-green-600 font-semibold mt-2">
          ₹{listing.price}
        </h2>

        <p className="text-gray-700 mt-4">{listing.description}</p>

        <p className="text-gray-500 mt-2">📍 {listing.location}</p>

        <p className="text-gray-400 mt-1">
          Posted on: {new Date(listing.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
