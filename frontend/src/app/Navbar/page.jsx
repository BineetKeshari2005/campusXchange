"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AiFillHeart } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { VscNotebook } from "react-icons/vsc";
import { Home, LogOut, MessageCircle } from "lucide-react"; 
import { motion } from "framer-motion";

const Navbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const NavLink = ({ href, icon: Icon, label, isIconOnly = false }) => {
    const baseClasses = "flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold transition duration-150";
    const activeClasses = "bg-blue-100/70 text-blue-700 shadow-inner";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-800";
    const isActive = false;

    const classes = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

    return (
      <button onClick={() => router.push(href)} className={classes} title={label}>
        <Icon className="text-xl" />
        {!isIconOnly && <span className="hidden md:block text-sm">{label}</span>}
      </button>
    );
  };

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 py-3 border-b border-gray-100 shadow-xl bg-white/95 backdrop-blur-sm">
      
      {/* LEFT */}
      <h1
        className="text-2xl sm:text-3xl font-extrabold text-blue-600 cursor-pointer tracking-tight whitespace-nowrap"
        onClick={() => router.push("/home")}
      >
        CampusXchange
      </h1>

      {/* CENTER */}
      <div className="hidden lg:flex items-center gap-2 justify-center absolute left-1/2 transform -translate-x-1/2">
        <NavLink href="/home" icon={Home} label="Home" />
        <NavLink href="/saved" icon={AiFillHeart} label="Saved" />
        <NavLink href="/my-listings" icon={VscNotebook} label="My Listings" />
        <NavLink href="/chat" icon={MessageCircle} label="Inbox" /> {/* NEW */}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 md:gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/sell")}
          className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/50 hover:bg-green-600 transition duration-200 flex items-center gap-1"
        >
          <span className="hidden sm:block">+ Sell Item</span>
          <span className="sm:hidden text-lg">+ Sell</span>
        </motion.button>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* MOBILE */}
        <div className="flex lg:hidden items-center gap-2">
          <NavLink href="/home" icon={Home} label="Home" isIconOnly />
          <NavLink href="/saved" icon={AiFillHeart} label="Saved" isIconOnly />
          <NavLink href="/my-listings" icon={VscNotebook} label="My Listings" isIconOnly />
          <NavLink href="/chat" icon={MessageCircle} label="Inbox" isIconOnly /> {/* NEW */}
        </div>

        <button onClick={() => router.push("/profile")} className="text-blue-600 p-1">
          <FaUserCircle className="text-3xl" />
        </button>

        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-1 text-red-500 font-medium text-sm hover:text-red-600 px-2 py-1 rounded-md"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
