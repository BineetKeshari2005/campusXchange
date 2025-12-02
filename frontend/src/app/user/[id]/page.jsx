"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PublicUserProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public-user/${id}`
      );

      const data = await res.json();
      console.log("PUBLIC PROFILE:", data);

      if (res.ok) {
        setUser(data.user);
        setListings(data.listings);
      }
    } catch (err) {
      console.error("Public user fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPublicUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-800">
          {user.name}
        </h1>

        <p className="text-gray-600 mt-2">{user.email}</p>

        <div className="mt-4 space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Phone:</span> {user.phone}
          </p>
          <p>
            <span className="font-medium">Hostel:</span> {user.hostel}
          </p>
          <p>
            <span className="font-medium">Room:</span> {user.room}
          </p>
        </div>

        <button
          onClick={() => alert("Chat coming soon!")}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
        >
          Contact Seller
        </button>
      </div>

      {/* SELLER LISTINGS */}
      <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
        Seller's Listings
      </h2>

      {listings.length === 0 ? (
        <p className="text-gray-500">No listings available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item._id}
              className="bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/product/${item._id}`)}
            >
              <img
                src={item.images?.[0]}
                className="h-48 w-full object-cover rounded-t-xl"
              />

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  ₹{item.price}
                </h3>
                <p className="text-gray-600 mt-1">{item.title}</p>
                <p className="text-gray-400 text-sm mt-1">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
