// Signup.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User } from "lucide-react"; // Added 'User' icon for name field
import Image from "next/image";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  
  // NOTE: Use the same image URL as the Login page
  const IMAGE_URL = "https://lh3.googleusercontent.com/p/AF1QipNWC_MbFAfLlUcchLXGGmEYlawRXIimq6hvFJKx=s1360-w1360-h1020-rw";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // ✅ Handle error responses
      if (!response.ok) {
        alert(data.message || "Something went wrong! Please try again.");
        return; // stop redirect
      }

      // ✅ Signup success
      localStorage.setItem("token", data.token);
      alert("Signup successful! Redirecting to home...");
      router.push("/home");
    } catch (error) {
      console.error("Error:", error);
      alert("Network error — please check your connection.");
    } finally {
      setLoading(false);
      setFormData({ name: "", email: "", password: "" });
    }
  };

  return (
    // Outer container: Full screen height, light background, flex container
    <div className="h-screen w-full flex bg-gray-50 text-gray-800 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        // Main Card: Full height, 50/50 split on medium screens
        className="w-full h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/50 grid grid-cols-1 md:grid-cols-2"
      >
        
        {/* === LEFT COLUMN: IMAGE AND INTRO (50% Width) === */}
        <div className="relative h-64 md:h-auto bg-gray-900">
          
          {/* Image Component with fixed URL */}
          <Image
            src={IMAGE_URL}
            alt="Campus Building"
            fill
            style={{ objectFit: 'cover' }}
            priority
            className="opacity-70"
          />
          
          {/* Overlay and Text */}
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-8 text-white">
            <h2 className="text-xl font-medium tracking-tight">
              Join
            </h2>
            <h1 className="text-4xl font-extrabold mt-1">
              CampusXchange
            </h1>
            <p className="text-gray-200 text-sm mt-3">
              Your centralized marketplace for buying and selling student essentials.
            </p>
          </div>
        </div>

        {/* === RIGHT COLUMN: SIGNUP FORM (50% Width) === */}
        <div className="p-10 flex flex-col justify-center">
          
          {/* Header */}
          <div className="text-left mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                It only takes a minute to get started.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            
            {/* Name Input */}
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                // Light input styling matching Login page
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                required
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                // Light input styling matching Login page
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                // Light input styling matching Login page
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              // Primary Blue Button matching Login page
              className={`w-full ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-400/50"
              } text-white p-3 rounded-lg font-semibold transition-colors`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </motion.button>
          </form>

          {/* Footer Link */}
          <div className="relative z-10 mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <a
                href="/auth/login"
                // Blue link matching Login page
                className="text-blue-600 hover:text-blue-700 font-semibold transition"
              >
                Login
              </a>
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}