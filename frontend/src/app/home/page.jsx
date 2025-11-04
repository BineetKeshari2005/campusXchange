"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-white shadow-md px-8 py-4">
        <h1 className="text-2xl font-bold text-blue-600">CampusXchange</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col justify-center items-center mt-20 text-center">
        <h2 className="text-4xl font-semibold mb-4">Welcome to CampusXchange 🎓</h2>
        <p className="text-gray-600 max-w-xl">
          This is your dashboard home page. You can explore, buy, sell, or share campus essentials here.
        </p>
      </main>
    </div>
  );
}
