"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Added for motion effects
import { Tag, DollarSign, MapPin, Package, Clock, MessageSquare, User, Mail, Phone, Home, Hash, Info } from "lucide-react"; // Added Icons

// Helper function (Safe to add, purely presentational)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
        return 'Invalid Date';
    }
};

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Fetch Product (LOGIC PRESERVED)
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
  // Fetch Seller Info (LOGIC PRESERVED)
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
  // Start Chat (LOGIC PRESERVED)
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
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat/start/${product._id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const convo = await res.json();

    if (!res.ok) {
      alert(convo.message || "Failed to start chat");
      return;
    }

    router.push(`/chat/${convo._id}`);
  } catch (err) {
    console.error("Chat start error:", err);
    alert("Failed to start chat");
  }
};


  useEffect(() => {
    fetchProduct();
  }, [id]);
const buyNow = async () => {
  const token = localStorage.getItem("token");
  if (!token) return router.push("/auth/login");

const order = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/payments/pay/${product._id}`,
  { method: "POST", headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

new window.Razorpay({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  name: "CampusXchange",
  description: product.title,
  order_id: order.id,
  handler: async (response) => {
    const verify = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(response)
    });

    if (verify.ok) {
      router.push("/home");          // 👈 redirect home
    } else {
      alert("Payment verification failed");
    }
  }
}).open();
}

  if (loading || !product) {
    return (
      // Enhanced Loading State
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-blue-600 flex items-center">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></span>
            Loading product details...
        </div>
      </div>
    );
  }

  // Destructure product data for cleaner UI access
  const { title, price, description, images, category, condition, location, createdAt } = product;
  
  // Destructure seller data (or provide defaults)
  const sellerName = seller?.name || product.seller?.name || 'N/A';
  const sellerId = seller?._id || product.seller?._id;


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-8 pb-12 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        
        {/* === LEFT COLUMN (IMAGE & DESCRIPTION) === */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* --- Product Header (for mobile) --- */}
            <div className="block lg:hidden pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
                <p className="text-4xl font-extrabold text-blue-600 mt-2">
                    ₹{price}
                </p>
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={startChat}
                    className="mt-4 w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/50"
                >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Chat With Seller
                </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={buyNow}
              className="mt-3 w-full flex items-center justify-center bg-green-600 text-white py-3 rounded-xl text-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/50"
            >
                Buy Now
              </motion.button>
                
            </div>

  
          
            
            {/* --- Image Gallery --- */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 p-4">
                {images?.[0] ? (
                    <img
                        src={images[0]}
                        alt={title}
                        className="w-full h-96 object-contain rounded-lg bg-gray-100"
                    />
                ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
                        <Info className="w-6 h-6 mr-2" /> No Image Available
                    </div>
                )}
            </div>

            {/* --- Key Attributes --- */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Key Information</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    
                    {/* Price */}
                    <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100">
                        <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <span className="text-sm font-semibold">₹{price}</span>
                    </div>
                    
                    {/* Category */}
                    <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100">
                        <Tag className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                        <span className="text-sm font-semibold capitalize">{category}</span>
                    </div>

                    {/* Condition */}
                    <div className="p-3 bg-green-50/70 rounded-lg border border-green-100">
                        <Package className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <span className="text-sm font-semibold capitalize">{condition}</span>
                    </div>
                    
                    {/* Posted Date */}
                    <div className="p-3 bg-yellow-50/70 rounded-lg border border-yellow-100">
                        <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                        <span className="text-sm font-semibold">{formatDate(product.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* --- Description --- */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">Detailed Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {description}
                </p>
            </div>
        </div>

        {/* === RIGHT COLUMN (PRICE & SELLER INFO) === */}
        <div className="lg:col-span-1 space-y-8">
            <div className="sticky top-8">

                {/* --- Price & Main CTA (Desktop only) --- */}
                <div className="hidden lg:block bg-white rounded-xl shadow-2xl border border-gray-100 p-6 mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
                    <p className="text-5xl font-extrabold text-blue-600 my-4">
                        ₹{price}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={startChat}
                        className="mt-4 w-full flex items-center justify-center bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/50"
                    >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Chat With Seller
                    </motion.button>
                    <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={buyNow}
                            className="mt-3 w-full flex items-center justify-center bg-green-600 text-white py-3 rounded-xl text-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/50"
                          >
                              Buy Now
                      </motion.button>
                </div>

                {/* --- Seller Information Card --- */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" /> Seller Information
                    </h2>

                    {!seller ? (
                        <p className="text-gray-500">Seller info not available (requires authentication token).</p>
                    ) : (
                        <div className="space-y-3">
                            
                            {/* Seller Name */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-600 flex items-center"><User className="w-4 h-4 mr-2" /> Name:</span>
                                <span
                                    className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition"
                                    onClick={() => router.push(`/user/${sellerId}`)}
                                >
                                    {sellerName}
                                </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-600 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Location:</span>
                                <span className="font-medium text-gray-800">{location || 'N/A'}</span>
                            </div>


                            {/* Hostel */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-600 flex items-center"><Home className="w-4 h-4 mr-2" /> Hostel:</span>
                                <span className="font-medium text-gray-800">{seller.hostel || 'N/A'}</span>
                            </div>

                            {/* Room No */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-600 flex items-center"><Hash className="w-4 h-4 mr-2" /> Room No:</span>
                                <span className="font-medium text-gray-800">{seller.room || 'N/A'}</span>
                            </div>
                            
                            {/* Email */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-600 flex items-center"><Mail className="w-4 h-4 mr-2" /> Email:</span>
                                <span className="text-sm text-gray-600 truncate">{seller.email || 'N/A'}</span>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-gray-600 flex items-center"><Phone className="w-4 h-4 mr-2" /> Phone:</span>
                                <span className="font-medium text-gray-800">{seller.phone || 'N/A'}</span>
                            </div>
                            
                            {/* The Chat button is already in the main CTA section for better prominence */}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}