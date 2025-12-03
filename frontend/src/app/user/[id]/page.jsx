"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Home, Hash, MessageSquare, Tag, MapPin, DollarSign } from "lucide-react";

export default function PublicUserProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Fetch Public User (LOGIC PRESERVED)
  // ---------------------------
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-blue-600 flex items-center">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></span>
            Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-red-600">User Not Found</h1>
        <p className="text-gray-600 mt-2">The profile you are looking for does not exist.</p>
        <button 
            onClick={() => router.push('/home')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
            Go to Marketplace
        </button>
      </div>
    );
  }

  // --- Component for a single contact detail row ---
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg">
      <Icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-800 truncate">{value || 'N/A'}</span>
    </div>
  );
  
  // --- Component for a single listing card ---
  const ListingCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={item._id}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 cursor-pointer group"
      onClick={() => router.push(`/product/${item._id}`)}
    >
      <div className="h-48 w-full overflow-hidden">
        <img
          src={item.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={item.title}
          className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-500"
        />
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xl text-blue-600 flex items-center">
                <DollarSign className="w-5 h-5 mr-1" />{item.price}
            </h3>
            <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-0.5 bg-gray-100 rounded">
                {item.category}
            </p>
        </div>
        
        <p className="text-gray-900 font-semibold text-lg truncate">{item.title}</p>
        
        <p className="text-gray-500 text-sm flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
            {item.location}
        </p>
      </div>
    </motion.div>
  );


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* --- PROFILE HEADER CARD --- */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 shadow-blue-50/50"
        >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                
                {/* Name and Title */}
                <div className="mb-6 md:mb-0">
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                        <User className="w-8 h-8 mr-3 text-blue-600" /> 
                        {user.name}
                    </h1>
                    <p className="text-lg text-gray-500 mt-1 ml-11">Verified Seller Profile</p>
                </div>

                {/* Contact Button */}

            </div>

            {/* Contact Details Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-6">
                <DetailRow icon={Mail} label="Email" value={user.email} />
                <DetailRow icon={Phone} label="Phone" value={user.phone} />
                <DetailRow icon={Home} label="Hostel" value={user.hostel} />
                <DetailRow icon={Hash} label="Room No" value={user.room} />
                {/* You can add a placeholder for joined date if available:
                <DetailRow icon={Clock} label="Joined Since" value="Jan 2023" /> */}
            </div>
        </motion.div>

        {/* --- SELLER LISTINGS SECTION --- */}
        <h2 className="text-3xl font-bold text-gray-900 pt-6 flex items-center">
          <Tag className="w-6 h-6 mr-2 text-orange-500" /> 
          Listings ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
            <p className="text-xl text-gray-500">This seller currently has no active listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard key={item._id} item={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}