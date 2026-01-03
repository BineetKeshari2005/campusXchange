"use client";
import { useEffect, useState } from "react";

export default function BoughtPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/bought`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setOrders);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-10">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-10 text-center">
        🛍 My Purchases
      </h1>

      {orders.length === 0 && (
        <p className="text-center text-gray-500 text-lg">
          You haven’t bought anything yet.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.map(o => (
          <div
            key={o._id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden"
          >
            <div className="relative">
              <img
                src={o.listingId.images[0]}
                className="h-56 w-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                Purchased
              </span>
            </div>

            <div className="p-5">
              <h2 className="font-bold text-lg truncate">
                {o.listingId.title}
              </h2>

              <p className="text-indigo-600 font-bold text-xl mt-2">
                ₹{o.amount}
              </p>

              <div className="mt-3 text-sm text-gray-600">
                Seller: <span className="font-medium">{o.sellerId.name}</span>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                Order ID: {o._id.slice(-8)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
