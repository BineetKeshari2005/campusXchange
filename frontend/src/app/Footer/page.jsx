// components/Footer.jsx
import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12 py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        
        {/* Logo/Branding */}
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-extrabold text-blue-600 tracking-tight">
            CampusXchange
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Buy and sell campus essentials easily.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-sm font-medium mb-4 md:mb-0">
          <a href="#" className="text-gray-600 hover:text-blue-600 transition">About</a>
          <a href="#" className="text-gray-600 hover:text-blue-600 transition">Terms</a>
          <a href="#" className="text-gray-600 hover:text-blue-600 transition">Privacy</a>
          <a href="#" className="text-gray-600 hover:text-blue-600 transition">Contact</a>
        </div>

        {/* Social Media/Copyright */}
        <div className="flex flex-col items-center md:items-end">
          <div className="flex gap-4 mb-2">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition"><FaGithub size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition"><FaLinkedin size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition"><FaEnvelope size={20} /></a>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            &copy; {new Date().getFullYear()} CampusXchange. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;