"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // ✅ Handle failed login
      if (!response.ok) {
        // Custom backend messages:
        if (data.message === "User not found") {
          alert("User not found! Please sign up first.");
        } else if (data.message === "Invalid password") {
          alert("Incorrect password! Please try again.");
        } else {
          alert(data.message || "Something went wrong, please try again.");
        }
        return;
      }

      // ✅ Successful login
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("login"));
      alert("Login successful!");
      router.push("/home");
    } catch (error) {
      console.error("Error:", error);
      alert("Network error! Please check your connection.");
    } finally {
      setLoading(false);
      setFormData({ email: "", password: "" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B0A1B] via-[#141022] to-[#1A162B] text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md p-8 rounded-2xl border border-[#2D2845] bg-gradient-to-br from-[#1A162B]/80 to-[#0F0B1E]/60 shadow-2xl backdrop-blur-lg"
      >
        {/* Glow Accent */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/20 to-transparent opacity-40 blur-2xl"></div>

        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/30 mb-4">
            <LogIn className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">
            Login to access your workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 pl-10 rounded-md bg-[#1A162B] border border-[#2D2845] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 pl-10 rounded-md bg-[#1A162B] border border-[#2D2845] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-br from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400"
            } text-white p-3 rounded-md font-semibold transition-colors shadow-lg`}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="relative z-10 mt-5 text-center">
          <p className="text-gray-400 text-sm">
            Don’t have an account?{" "}
            <a
              href="/auth/signup"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Sign Up
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
