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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Failed to load profile.
      </div>
    );
  }

  // PROFILE COMPLETION CALCULATION
  const fields = ["phone", "hostel", "room", "bio", "profilePhoto"];
  const completed = fields.filter((field) => profile[field]?.trim() !== "").length;
  const completionPercent = Math.round((completed / fields.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">
        My Profile
      </h1>

      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-8 border">

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <img
            src={
              profile.profilePhoto ||
              "https://i.pinimg.com/736x/84/24/20/842420e3883eb78671cc435deabf735c.jpg"
            }
            className="w-32 h-32 rounded-full object-cover border shadow"
            alt="avatar"
          />
        </div>

        {/* Name + Email */}
        <h2 className="text-2xl font-semibold text-center text-gray-500">{profile.name}</h2>
        <p className="text-center text-gray-500">{profile.email}</p>

        {/* PROFILE COMPLETION BAR */}
        <div className="mt-6">
          <p className="text-gray-700 font-medium mb-2">
            Profile Completion: {completionPercent}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </div>

        {/* PROFILE DETAILS */}
        <div className="mt-8 space-y-4">
          <Detail label="Phone" value={profile.phone} />
          <Detail label="Hostel" value={profile.hostel} />
          <Detail label="Room No." value={profile.room} />
          <Detail label="Bio" value={profile.bio} />
        </div>

        {/* PAYMENT SETUP CARD */}
<div className="mt-10 p-6 border rounded-xl bg-indigo-50">
  <h3 className="text-xl font-bold mb-2 text-indigo-700">Payment Setup</h3>

  {profile.paymentStatus === "not_enabled" && (
    <>
      <p className="text-gray-700 mb-4">
        Enable payments to start receiving money from buyers.
      </p>

      <button
        onClick={async () => {
          const token = localStorage.getItem("token");

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/payments/seller/onboard`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          const data = await res.json();
          window.location.href = data.url;
        }}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
      >
        Enable Payments
      </button>
    </>
  )}

  {profile.paymentStatus === "pending" && (
    <p className="text-yellow-600 font-semibold">
      ⏳ Razorpay verification in progress. Please complete onboarding.
    </p>
  )}

  {profile.paymentStatus === "active" && (
    <p className="text-green-600 font-semibold">
      ✅ Payments enabled — buyers can now pay you.
    </p>
  )}
</div>

{/* DASHBOARD BUTTONS */}
<div className="grid grid-cols-2 gap-4 mt-8">
  <button
    onClick={() => router.push("/seller/sold")}
    className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
  >
    My Sales
  </button>

  <button
    onClick={() => router.push("/buyer/bought")}
    className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
  >
    My Purchases
  </button>
</div>


        {/* EDIT PROFILE BUTTON */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push("/profile/edit")}
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>

        {/* COMPLETE PROFILE ALERT */}
        {completionPercent < 100 && (
          <div className="mt-6 text-center text-yellow-600 font-medium">
            Complete your profile to increase trust among buyers & sellers.
          </div>
        )}
      </div>
    </div>
  );
}

// SMALL COMPONENT FOR CLEAN UI
function Detail({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">
        {value ? value : "Not added"}
      </span>
    </div>
  );
}
