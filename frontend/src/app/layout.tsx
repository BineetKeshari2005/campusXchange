import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. Import the ClientLayout component
import ClientLayout from "../app/clientLayout.jsx"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusXchange - Buy & Sell", // Suggestion: Update the title
  description: "The easiest way to buy and sell items on campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2. Wrap the children (page content) with ClientLayout */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}