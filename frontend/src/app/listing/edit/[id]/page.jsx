"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { X, UploadCloud, Edit, Save, Trash2, Loader2, DollarSign, Tag, List, MapPin, ArrowLeft } from "lucide-react";
import { FaIndianRupeeSign } from "react-icons/fa6";

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

  // Define base input and label classes for consistency
  const baseInputClasses = "w-full border border-gray-300 rounded-xl py-3 pl-4 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-gray-50";
  const baseLabelClasses = "block font-semibold mb-1 text-gray-700 text-sm";


  // -------------------------------------------------
  // 1️⃣ Load Existing Listing Data (LOGIC PRESERVED)
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
  // 2️⃣ Handle Input Changes (LOGIC PRESERVED)
  // -------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------------------------
  // 3️⃣ Handle New Image Uploads (LOGIC PRESERVED)
  // -------------------------------------------------
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - oldImages.length); // Limit total to 5

    setNewImages(files);
    setPreview(files.map((file) => URL.createObjectURL(file)));
  };

  // Delete OLD cloudinary images (LOGIC PRESERVED)
  const deleteOldImage = (index) => {
    // NOTE: Frontend logic is correct: remove URL from state, then send remaining URLs to backend
    setOldImages(oldImages.filter((_, i) => i !== index));
  };

  // Delete NEW preview images before upload (LOGIC PRESERVED)
  const deleteNewImage = (index) => {
    const newNewImages = newImages.filter((_, i) => i !== index);
    const newPreview = preview.filter((_, i) => i !== index);
    
    setNewImages(newNewImages);
    setPreview(newPreview);
  };

  // -------------------------------------------------
  // 4️⃣ Handle Submit (PUT request) (LOGIC PRESERVED)
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

    // append old images (as JSON) - This is the crucial payload for images the user kept
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
  // UI - Enhanced Design
  // -------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-blue-600 flex items-center">
            <Loader2 className="animate-spin w-6 h-6 mr-3" />
            Loading listing...
        </div>
      </div>
    );
  }
  
  const totalImages = oldImages.length + newImages.length;
  const imageLimit = 5;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => router.push("/my-listings")}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition text-sm font-medium"
        >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Listings
        </button>

        <header className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <Edit className="w-7 h-7 mr-3 text-blue-600" />
                Edit Listing: {formData.title || "Untitled Item"}
            </h1>
            <p className="text-gray-500 mt-2">Update your item's details and photos below.</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl shadow-blue-100/50 border border-gray-100 rounded-2xl p-8 space-y-10"
        >
          {/* ============================
               IMAGE MANAGEMENT SECTION
          ============================= */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <UploadCloud className="w-6 h-6 mr-2 text-blue-500" /> Photos ({totalImages}/{imageLimit})
            </h2>

            {/* --- Existing Images --- */}
            {oldImages.length > 0 && (
                <div className="mb-6">
                    <p className="font-medium text-gray-700 mb-3">Existing Images (Click 'X' to remove):</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {oldImages.map((img, i) => (
                            <motion.div 
                                key={img} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-full h-28 rounded-lg overflow-hidden shadow-lg border border-gray-200 group"
                            >
                                <img
                                    src={img}
                                    alt={`Existing image ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => deleteOldImage(i)}
                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                                    title="Remove this image"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* --- Add New Images --- */}
            {totalImages < imageLimit && (
              <>
                <label htmlFor="new-image-upload" className="block cursor-pointer border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/50 transition duration-300 rounded-xl p-6 mb-4 text-center">
                    <input
                        id="new-image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-md font-semibold text-blue-600">Click to add up to {imageLimit - totalImages} more photos</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size 5MB each.</p>
                </label>
                
                {/* --- Preview New Files --- */}
                {preview.length > 0 && (
                    <div className="mb-6">
                        <p className="font-medium text-gray-700 mb-3">New Images to Upload:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {preview.map((src, i) => (
                                <div key={i} className="relative w-full h-28 rounded-lg overflow-hidden shadow-lg border border-blue-400 group">
                                    <img
                                        src={src}
                                        alt={`New image preview ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => deleteNewImage(i)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg"
                                        title="Remove new image"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </>
            )}
            {totalImages >= imageLimit && (
                 <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-lg font-medium">
                    Maximum limit of {imageLimit} images reached.
                 </div>
            )}
          </div>

          {/* ============================
              FORM FIELDS SECTION
          ============================= */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <List className="w-6 h-6 mr-2 text-blue-500" /> Item Details
            </h2>

            {/* TITLE */}
            <div className="mb-5">
                <label className={baseLabelClasses}>Title</label>
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={baseInputClasses}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PRICE */}
                <div className="mb-5">
                    <label className={baseLabelClasses}>Price (₹)</label>
                    <div className="relative">
                        <FaIndianRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className={`${baseInputClasses} pl-10`}
                            required
                        />
                    </div>
                </div>

                {/* LOCATION */}
                <div className="mb-5">
                    <label className={baseLabelClasses}>Pickup Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className={`${baseInputClasses} pl-10`}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CATEGORY */}
                <div className="mb-5">
                    <label className={baseLabelClasses}>Category</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`${baseInputClasses} pl-10 appearance-none bg-white cursor-pointer`}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* CONDITION */}
                <div className="mb-5">
                    <label className={baseLabelClasses}>Condition</label>
                    <div className="relative">
                        <List className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            className={`${baseInputClasses} pl-10 appearance-none bg-white cursor-pointer`}
                        >
                            <option value="new">NEW (Unused/Sealed)</option>
                            <option value="good">GOOD (Minor wear)</option>
                            <option value="used">USED (Visible wear)</option>
                        </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-5">
                <label className={baseLabelClasses}>Description</label>
                <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className={`${baseInputClasses} resize-none`}
                    required
                />
            </div>
          </div>

          <hr className="border-gray-200" />
          
          {/* SUBMIT BUTTON */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className={`w-full text-white py-3 rounded-xl text-xl font-bold transition-all shadow-lg ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/50"
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-6 w-6 mr-3" />
                Saving Changes...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}