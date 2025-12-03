"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { X, UploadCloud } from "lucide-react";

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    condition: "",
    description: "",
    location: "",
  });

  const [oldImages, setOldImages] = useState([]);  // URLs already uploaded
  const [newImages, setNewImages] = useState([]);  // new files user uploads
  const [preview, setPreview] = useState([]);      // for new files

  const categories = ["books", "electronics", "notes", "accessories", "others"];

  // -------------------------------------------------
  // 1️⃣ Load Existing Listing Data
  // -------------------------------------------------
  const loadListing = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`
      );

      const data = await res.json();

      setFormData({
        title: data.title,
        price: data.price,
        category: data.category,
        condition: data.condition,
        description: data.description,
        location: data.location,
      });

      setOldImages(data.images || []);
    } catch (err) {
      console.error("LOAD LISTING ERROR:", err);
      alert("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadListing();
  }, [id]);

  // -------------------------------------------------
  // 2️⃣ Handle Input Changes
  // -------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------------------------
  // 3️⃣ Handle New Image Uploads
  // -------------------------------------------------
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);

    setNewImages(files);
    setPreview(files.map((file) => URL.createObjectURL(file)));
  };

  // Delete OLD cloudinary images
  const deleteOldImage = (index) => {
    setOldImages(oldImages.filter((_, i) => i !== index));
  };

  // Delete NEW preview images before upload
  const deleteNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setPreview(preview.filter((_, i) => i !== index));
  };

  // -------------------------------------------------
  // 4️⃣ Handle Submit (PUT request)
  // -------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("token");

    const form = new FormData();

    // append text fields
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    // append old images (as JSON)
    form.append("oldImages", JSON.stringify(oldImages));

    // append new images
    newImages.forEach((img) => form.append("images", img));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed");
        return;
      }

      alert("Listing updated!");
      router.push("/my-listings");
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading listing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-8">
        Edit Listing
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8"
      >
        {/* ============================
             OLD IMAGES
        ============================= */}
        <h2 className="text-xl font-bold mb-3">Current Photos</h2>

        {oldImages.length === 0 ? (
          <p className="text-gray-500 mb-4">No images.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {oldImages.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img}
                  className="w-full h-28 rounded object-cover border"
                />
                <button
                  type="button"
                  onClick={() => deleteOldImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ============================
             ADD NEW IMAGES
        ============================= */}
        <label className="font-semibold">Upload New Photos</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-3 block"
        />

        {/* PREVIEW NEW FILES */}
        {preview.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {preview.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  className="w-full h-28 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => deleteNewImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ============================
            FORM FIELDS
        ============================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TITLE */}
          <div>
            <label>Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded p-3 mt-1"
              required
            />
          </div>

          {/* PRICE */}
          <div>
            <label>Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded p-3 mt-1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          {/* CATEGORY */}
          <div>
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded p-3 mt-1"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* CONDITION */}
          <div>
            <label>Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full border rounded p-3 mt-1"
            >
              <option value="new">NEW</option>
              <option value="good">GOOD</option>
              <option value="used">USED</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-5">
          <label>Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-3 mt-1"
            required
          />
        </div>

        {/* LOCATION */}
        <div className="mt-5">
          <label>Pickup Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded p-3 mt-1"
            required
          />
        </div>

        {/* SUBMIT */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={saving}
          className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition"
        >
          {saving ? "Updating..." : "Save Changes"}
        </motion.button>
      </form>
    </div>
  );
}
