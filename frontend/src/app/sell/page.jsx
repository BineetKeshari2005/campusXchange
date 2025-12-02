"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    const files = Array.from(e.target.files);
    setImages(files);
    setPreview(files.map((file) => URL.createObjectURL(file)));
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
        const errorText = await res.text(); // read raw HTML/JSON safely
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

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Sell Your Item
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-white shadow-md border border-gray-200 rounded-xl p-6"
      >
        {/* IMAGE PREVIEW */}
        {preview.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {preview.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="preview"
                className="w-full h-28 rounded-md object-cover border"
              />
            ))}
          </div>
        )}

        {/* UPLOAD */}
        <div className="mb-5">
          <label className="block font-medium mb-2 text-gray-700">
            Upload Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-md p-2 bg-white"
          />
        </div>

        {/* TITLE */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-3"
          />
        </div>

        {/* PRICE */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-1">
            Price (₹)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-3"
          />
        </div>

        {/* CATEGORY */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-3"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* CONDITION */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-3"
          >
            <option value="new">NEW</option>
            <option value="good">GOOD</option>
            <option value="used">USED</option>
          </select>
        </div>

        {/* DESCRIPTION */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-3"
          />
        </div>

        {/* LOCATION */}
        <div className="mb-5">
          <label className="block font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md p-3"
            placeholder="Hostel / Block / Room"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
