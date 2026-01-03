"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Inbox() {
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/chat/inbox", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setConvos(res.data));
  }, []);

  return (
  <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

    {/* LEFT — Inbox */}
    <div className="w-96 bg-white shadow-xl border-r flex flex-col">

      {/* Header */}
      <div className="p-5 border-b bg-white sticky top-0 z-10">
        <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
          Messages
        </h2>
        <p className="text-xs text-gray-500 mt-1">Buyer conversations</p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">

        {convos.length === 0 && (
          <div className="text-center mt-20 text-gray-400 text-sm">
            No conversations yet
          </div>
        )}

        {convos.map(c => (
          <Link key={c._id} href={`/chat/${c._id}`}>
            <div className="group relative px-5 py-4 border-b hover:bg-blue-50 transition cursor-pointer">

              {/* Unread glow */}
              {c.unread.seller > 0 && (
                <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r" />
              )}

              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 group-hover:text-blue-700">
                    {c.buyerId.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.listingId.title}
                  </p>
                </div>

                {c.unread.seller > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {c.unread.seller}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-600 truncate">
                {c.lastMessage || "Start the conversation"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>

    {/* RIGHT — Placeholder */}
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
      <div className="text-6xl mb-4">💬</div>
      <p className="text-lg font-semibold">Select a chat to start messaging</p>
      <p className="text-sm">Your conversations appear here</p>
    </div>
  </div>
);
}
