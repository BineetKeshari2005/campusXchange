"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/auth/login");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">
        My Profile
      </h1>

      <div className="max-w-lg mx-auto bg-white shadow rounded-xl p-6 border">
        
        {/* Avatar */}
        <div className="flex justify-center">
          <img
            src={
              profile.avatar ||
              "https://i.pinimg.com/736x/84/24/20/842420e3883eb78671cc435deabf735c.jpg"
            }
            className="w-32 h-32 rounded-full object-cover border"
            alt="avatar"
          />
        </div>

        <h2 className="text-2xl font-semibold text-center mt-4">
          {profile.name}
        </h2>

        <p className="text-center text-gray-500">{profile.email}</p>

        {profile.phone && (
          <p className="text-center text-gray-500 mt-1">
            Phone: {profile.phone}
          </p>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/profile/edit")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
