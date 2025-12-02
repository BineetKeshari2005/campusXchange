"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch existing profile
  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/auth/login");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setProfile({ name: data.name, phone: data.phone || "" });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    // Update name + phone
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });

    // Update avatar
    if (avatar) {
      const formData = new FormData();
      formData.append("avatar", avatar);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    alert("Profile updated!");
    router.push("/profile");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">
        Edit Profile
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white shadow rounded-xl p-6 border"
      >
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={
              preview ||
              "https://i.pinimg.com/736x/84/24/20/842420e3883eb78671cc435deabf735c.jpg"
            }
            className="w-28 h-28 rounded-full object-cover border"
          />
          <input
            type="file"
            accept="image/*"
            className="mt-3"
            onChange={(e) => {
              setAvatar(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
          />
        </div>

        {/* Name */}
        <label className="font-medium">Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full border p-3 rounded mb-4"
          required
        />

        {/* Phone */}
        <label className="font-medium">Phone</label>
        <input
          type="text"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="w-full border p-3 rounded mb-4"
          placeholder="Optional"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
