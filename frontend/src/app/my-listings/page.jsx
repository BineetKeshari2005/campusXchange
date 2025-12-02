"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

export default function MyListingsPage() {
  const router = useRouter();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load listings");
        return;
      }

      setListings(data.items);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // DELETE LISTING
  const deleteListing = async (id) => {
    if (!confirm("Do you want to delete this listing?")) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert("Listing deleted");
      setListings(listings.filter((item) => item._id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-gray-600">
        Loading your listings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        My Listings
      </h1>

      {listings.length === 0 ? (
        <p className="text-center text-gray-500 text-lg mt-10">
          You haven't listed anything yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item._id}
              className="border rounded-xl shadow-sm bg-white overflow-hidden"
            >
              {/* IMAGE */}
              <img
                src={
                  item.images?.[0] ||
                  "https://via.placeholder.com/300?text=No+Image"
                }
                className="w-full h-44 object-cover"
                alt={item.title}
              />

              {/* CONTENT */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  ₹{item.price}
                </h2>
                <p className="text-gray-600 mt-1">{item.title}</p>

                <p className="text-gray-400 text-xs mt-1">{item.location}</p>

                {/* ACTION BUTTONS */}
                <div className="flex justify-between items-center mt-4">
                  {/* EDIT - not implemented yet */}
                  <button
                    onClick={() =>
                      router.push(`/listing/edit/${item._id}`)
                    }
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <AiOutlineEdit />
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteListing(item._id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700"
                  >
                    <AiOutlineDelete />
                    Delete
                  </button>
                </div>

                {/* STATUS */}
                <p className="text-xs text-green-600 mt-2 font-medium">
                  {item.status === "active" ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
