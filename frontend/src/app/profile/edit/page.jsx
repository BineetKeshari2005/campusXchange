"use client";

import { useEffect, useState } from "react";
// Removed Next.js router imports to prevent resolution errors.
// We will use window.location.href for redirection instead.
// import { useRouter } from "next/router"; 
import { Trash2 } from "lucide-react";

export default function EditProfilePage() {
  // const router = useRouter(); // Removed
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // New state for deletion loader

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

  // Helper function for redirection
  const redirect = (path) => {
    window.location.href = path;
  };

  // Fetch existing profile
  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return redirect("/auth/login"); // Use redirect helper

    try {
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
    } catch (error) {
        console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Form Submit (Save Changes)
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
        setLoading(false);
        alert("Authentication failed. Please log in again.");
        return redirect("/auth/login"); // Use redirect helper
    }

    try {
        // Step 1: Update text fields
        const textRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        });

        if (!textRes.ok) throw new Error("Failed to update text fields.");

        // Step 2: Upload profile photo
        if (photoFile) {
          const formData = new FormData();
          formData.append("photo", photoFile);

          const photoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me/photo`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (!photoRes.ok) throw new Error("Failed to upload photo.");
        }

        alert("Profile updated successfully!");
        redirect("/profile"); // Use redirect helper
        
    } catch (error) {
        console.error("Profile update error:", error);
        alert(`Failed to save profile: ${error.message || 'Check console for details.'}`);
    } finally {
        setLoading(false);
    }
  };


  // --- NEW: Account Deletion Logic ---
  const handleDeleteAccount = async () => {
    // 1. Confirmation
    // IMPORTANT: Replacing window.confirm with a custom modal is recommended for production
    const isConfirmed = window.confirm(
      "⚠️ WARNING: Are you absolutely sure you want to permanently delete your account? This will delete all your listings and cannot be undone."
    );

    if (!isConfirmed) {
      return;
    }
    
    setIsDeleting(true);

    const token = localStorage.getItem("token");
    if (!token) {
        setIsDeleting(false);
        alert("Authentication failed. Please log in again.");
        return redirect("/auth/login"); // Use redirect helper
    }

    // 2. API Call
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 3. Handle Response
      if (res.status === 204) { // 204 No Content is success for DELETE
        alert("✅ Your account and all associated listings have been successfully deleted.");
        
        // CRITICAL: Clear the token and redirect to the login page (root in this case)
        localStorage.removeItem("token");
        redirect("/"); // Use redirect helper
        
      } else {
        // Read error response only if status is not 204
        const errorData = res.status !== 204 && res.headers.get("Content-Type")?.includes("application/json") 
                         ? await res.json() 
                         : { message: `Deletion failed with status: ${res.status}` };
                         
        alert(`Account deletion failed: ${errorData.message || res.statusText || res.status}`);
      }
    } catch (err) {
      console.error("Network error during deletion:", err);
      alert("A network error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
          disabled={loading || isDeleting}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-xl shadow-md font-semibold transition duration-150"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
      
      {/* --- ACCOUNT DELETION SECTION --- */}
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-300 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            Danger Zone
        </h2>
        <p className="text-sm text-red-600 mb-4">
            Permanently deleting your account is irreversible. All your personal data and listings will be removed from the system.
        </p>
        <button
            onClick={handleDeleteAccount}
            disabled={loading || isDeleting}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-md py-3 rounded-xl shadow-lg font-semibold transition duration-150 disabled:opacity-50"
        >
            {isDeleting ? "Deleting..." : "Permanently Delete Account"}
        </button>
      </div>
    </div>
  );
}