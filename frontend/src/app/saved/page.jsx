"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AiFillHeart } from "react-icons/ai";

export default function SavedPage() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/auth/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = await res.text();
      console.log("RAW RESPONSE:", raw);

      const data = JSON.parse(raw);
      console.log("PARSED JSON:", data);

      // 🔥 Accepts both formats: [array] OR { items: [array] }
      const finalItems = Array.isArray(data) ? data : data.items || [];

      console.log("FINAL ITEMS TO RENDER:", finalItems);

      setSavedItems(finalItems);
    } catch (err) {
      console.error("Saved fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/saved/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // Update UI instantly
      setSavedItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Remove saved error:", err);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading saved items...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Saved Items ❤️
      </h1>

      {savedItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          You haven't saved any items yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {savedItems.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-white"
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

                <AiFillHeart
                  className="absolute top-3 right-3 text-2xl text-red-600 bg-white rounded-full p-1 shadow-sm hover:scale-110 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSaved(item._id);
                  }}
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  ₹{item.price}
                </h3>

                <p className="text-gray-600 text-sm mt-1">{item.title}</p>

                <p className="text-gray-400 text-xs mt-2">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
