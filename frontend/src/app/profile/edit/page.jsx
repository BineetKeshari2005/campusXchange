"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    hostel: "",
    room: "",
    bio: "",
    profilePhoto: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch existing profile
  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/auth/login");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setProfile({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      hostel: data.hostel || "",
      room: data.room || "",
      bio: data.bio || "",
      profilePhoto: data.profilePhoto || "",
    });

    setPreview(data.profilePhoto || null);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Form Submit
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    // Step 1: Update text fields
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });

    // Step 2: Upload profile photo
    if (photoFile) {
      const formData = new FormData();
      formData.append("photo", photoFile);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/photo`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    alert("Profile updated successfully!");
    router.push("/profile");

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-10">
      <h1 className="text-4xl font-bold text-blue-600 text-center mb-10">
        Edit Profile
      </h1>

      <form
        onSubmit={handleSave}
        className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-200"
      >
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={
              preview ||
              "https://i.pinimg.com/736x/84/24/20/842420e3883eb78671cc435deabf735c.jpg"
            }
            className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md object-cover"
            alt="profile"
          />

          <label className="mt-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            Change Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setPhotoFile(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </label>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name */}
          <div>
            <label className="text-gray-600 font-medium">Full Name</label>
            <input
              className="mt-1 w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              required
            />
          </div>

          {/* Email (non-editable) */}
          <div>
            <label className="text-gray-600 font-medium">Email</label>
            <input
              className="mt-1 w-full p-3 rounded-xl border bg-gray-100 cursor-not-allowed text-gray-700"
              value={profile.email}
              disabled
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-600 font-medium">Phone</label>
            <input
              className="mt-1 w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>

          {/* Hostel */}
          <div>
            <label className="text-gray-600 font-medium">Hostel</label>
            <input
              className="mt-1 w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
              value={profile.hostel}
              onChange={(e) =>
                setProfile({ ...profile, hostel: e.target.value })
              }
            />
          </div>

          {/* Room */}
          <div>
            <label className="text-gray-600 font-medium">Room No.</label>
            <input
              className="mt-1 w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
              value={profile.room}
              onChange={(e) =>
                setProfile({ ...profile, room: e.target.value })
              }
            />
          </div>

        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="text-gray-600 font-medium">About You</label>
          <textarea
            className="mt-1 w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
            rows={4}
            placeholder="Tell something about yourself..."
            value={profile.bio}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-xl shadow-md font-semibold"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
