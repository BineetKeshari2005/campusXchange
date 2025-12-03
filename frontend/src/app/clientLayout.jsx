// components/ClientLayout.jsx
"use client";

import React from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import Navbar from './Navbar/page.jsx'; 
import Footer from './Footer/page.jsx'; 

// Define paths where the Navbar and Footer should be HIDDEN
const AUTH_ROUTES = ['/auth/login', '/auth/signup'];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current path starts with any of the authentication routes
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  return (
    // If it's an auth route, we use a simple full-screen div to let the login/signup page fill the space.
    // If not an auth route, we use the flex-col structure with Navbar/Footer.
    <div className={`flex flex-col min-h-screen ${isAuthRoute ? 'bg-gray-50' : 'bg-gray-50'}`}> 
      
      {!isAuthRoute && (
        // Only render Navbar if not on an auth route
        <Navbar /> 
      )}
      
      {/* The main content area */}
      <main className={!isAuthRoute ? "flex-grow" : "w-full flex-grow"}>
        {children}
      </main>
      
      {!isAuthRoute && (
        // Only render Footer if not on an auth route
        <Footer /> 
      )}
      
    </div>
  );
}