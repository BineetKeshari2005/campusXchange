"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, X, DollarSign, Tag, List, MapPin } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

export default function SellPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "books",
    condition: "good",
    description: "",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ["books", "electronics", "notes", "accessories", "others"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // Limit to 5 images
    setImages(files);
    setPreview(files.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreview = preview.filter((_, i) => i !== index);
    setImages(newImages);
    setPreview(newPreview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      router.push("/auth/login");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one image.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );
      images.forEach((img) => data.append("images", img));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.log("UPLOAD ERROR RAW:", errorText);

        let message = "Something went wrong";
        try {
          const errJson = JSON.parse(errorText);
          message = errJson.message || message;
        } catch {}

        alert(message);
        return;
      }

      const result = await res.json();
      console.log("UPLOAD SUCCESS:", result);

      alert("Listing created successfully!");
      router.push("/home");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Define a base class for all inputs and selects for consistency and visibility
  const baseInputClasses = "w-full border border-gray-300 rounded-lg py-3 pl-4 pr-4 text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm";
  const baseLabelClasses = "block font-semibold mb-2 text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      
      {/* HEADER */}
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-center text-blue-600 mb-2 tracking-tight"
      >
        Publish New Listing
      </motion.h1>
      <p className="text-center text-gray-500 mb-10">
        Fill out the details below to reach thousands of campus buyers!
      </p>

      {/* MAIN FORM CARD */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white shadow-2xl shadow-blue-100/50 border border-gray-100 rounded-2xl p-8"
      >
        
        {/* === SECTION 1: IMAGES === */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
            <UploadCloud className="w-6 h-6 mr-2 text-blue-500" /> Photos
        </h2>
        
        {/* UPLOAD INPUT (Hidden) */}
        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        
        {/* DRAG-AND-DROP ZONE */}
        <label htmlFor="image-upload" className="block cursor-pointer border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/50 transition duration-300 rounded-xl p-8 mb-6 text-center">
          <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-blue-600">Click or Drag & Drop Images Here</p>
          <p className="text-sm text-gray-500 mt-1">Maximum 5 files. (JPEG, PNG)</p>
        </label>

        {/* IMAGE PREVIEW */}
        {preview.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {preview.map((src, i) => (
              <div key={i} className="relative w-full h-28 rounded-md shadow-lg overflow-hidden border border-gray-200">
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition opacity-80"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* === SECTION 2: ITEM DETAILS === */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
            <Tag className="w-6 h-6 mr-2 text-blue-500" /> Info
        </h2>
        
        {/* TITLE */}
        <div className="mb-5">
          <label htmlFor="title" className={baseLabelClasses}>Title of Item</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Economics Textbook - 5th Edition"
              className={`${baseInputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          
          {/* PRICE */}
          <div className="mb-5">
            <label htmlFor="price" className={baseLabelClasses}>Price (₹)</label>
            <div className="relative">
                <FaIndianRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="Enter price in Rupees (e.g., 500)"
                    className={`${baseInputClasses} pl-10`}
                />
            </div>
          </div>

          {/* CONDITION */}
          <div className="mb-5">
            <label htmlFor="condition" className={baseLabelClasses}>Condition</label>
            <div className="relative">
                <List className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className={`${baseInputClasses} pl-10 appearance-none bg-white`}
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

        {/* CATEGORY */}
        <div className="mb-5">
          <label htmlFor="category" className={baseLabelClasses}>Category</label>
            <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`${baseInputClasses} pl-10 appearance-none bg-white`}
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

        {/* DESCRIPTION */}
        <div className="mb-5">
          <label htmlFor="description" className={baseLabelClasses}>
            Detailed Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Include details like wear, size, age, brand, or what is included. (Min 20 characters)"
            className={baseInputClasses}
          />
        </div>
        
        {/* LOCATION */}
        <div className="mb-5">
          <label htmlFor="location" className={baseLabelClasses}>
            Preferred Pickup Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className={`${baseInputClasses} pl-10 `}
                placeholder="e.g., Hostel Block C, Room 101"
            />
          </div>

        </div>

        <hr className="my-8 border-gray-200" />

        
        {/* SUBMIT BUTTON */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg text-xl font-bold transition-all shadow-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/50"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
              Uploading...
            </span>
          ) : (
            "Publish Listing"
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}