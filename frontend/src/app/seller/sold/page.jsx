"use client";
import { useEffect, useState } from "react";

export default function SoldPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/sold`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(r => r.json())
      .then(setOrders);
  }, []);

  const totalEarnings = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-10">
      <h1 className="text-4xl font-extrabold text-green-700 mb-6 text-center">
        💰 My Sales
      </h1>

      <div className="max-w-md mx-auto mb-10 bg-white shadow-lg rounded-2xl p-6 text-center">
        <p className="text-gray-500">Total Earnings</p>
        <p className="text-3xl font-extrabold text-green-600 mt-2">
          ₹{totalEarnings}
        </p>
      </div>

      {orders.length === 0 && (
        <p className="text-center text-gray-500 text-lg">
          You haven’t sold anything yet.
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
              <span className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                Sold
              </span>
            </div>

            <div className="p-5">
              <h2 className="font-bold text-lg truncate">
                {o.listingId.title}
              </h2>

              <p className="text-green-600 font-bold text-xl mt-2">
                ₹{o.amount}
              </p>

              <div className="mt-3 text-sm text-gray-600">
                Buyer: <span className="font-medium">{o.buyerId.name}</span>
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
