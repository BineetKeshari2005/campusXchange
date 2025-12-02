"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Fetch Product
  // ---------------------------
  const fetchProduct = async () => {
    if (!id || id === "undefined") return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`
      );

      const data = await res.json();
      console.log("PRODUCT:", data);

      if (!data || !data._id) {
        console.warn("Product not found");
        return;
      }

      setProduct(data);

      // Fetch seller profile
      if (data.seller?._id) fetchSeller(data.seller._id);
    } catch (err) {
      console.error("Product fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Fetch Seller Info
  // ---------------------------
  const fetchSeller = async (sellerId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${sellerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      console.log("SELLER INFO:", data);

      if (res.ok) setSeller(data);
    } catch (err) {
      console.error("Seller fetch error:", err);
    }
  };

  // ---------------------------
  // Start Chat (FIXED)
  // ---------------------------
  const startChat = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to chat");
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sellerId: product.seller._id,     // ONLY send this
          }),
        }
      );

      const data = await res.json();
      console.log("CHAT START RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Failed to start chat");
        return;
      }

      router.push(
        `/chat/${data.conversationId}?other=${product.seller._id}&name=${encodeURIComponent(
          product.seller.name
        )}`
      );
    } catch (err) {
      console.error("Chat start error:", err);
      alert("Failed to start chat");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading || !product) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading product...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <h1 className="text-3xl font-bold">{product.title}</h1>

      <img
        src={product.images?.[0]}
        className="w-full max-w-lg rounded-lg mt-4"
      />

      <p className="mt-4 text-xl font-semibold">₹{product.price}</p>
      <p className="mt-2 text-gray-700">{product.description}</p>

      {/* SELLER INFO */}
      <div className="mt-8 bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Seller Information</h2>

        {!seller ? (
          <p className="text-gray-500">Seller info not available.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span
                className="font-medium text-blue-600 cursor-pointer"
                onClick={() => router.push(`/user/${seller._id}`)}
              >
                {seller.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{seller.email}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span>{seller.phone}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Hostel:</span>
              <span>{seller.hostel}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Room No:</span>
              <span>{seller.room}</span>
            </div>

            <button
              onClick={startChat}
              className="mt-5 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Chat With Seller
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
