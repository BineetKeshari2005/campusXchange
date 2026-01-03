"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../../socket.js";
import ChatInput from "../../../components/ChatInput.jsx";

export default function ChatRoom() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/chat/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setMessages(res.data));

    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();
    socket.emit("join_room", id);

    socket.on("receive_message", msg => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => socket.disconnect();
  }, [id]);

  const myId = JSON.parse(localStorage.getItem("user"))?.id;

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <p className="font-bold text-gray-800 text-lg">Conversation</p>
        <p className="text-xs text-gray-500">Live marketplace chat</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">

        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-24">
            Say hi 👋 and start the conversation
          </div>
        )}

        {messages.map(m => {
          const isMe = m.senderId === myId;

          return (
            <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-4 py-2 text-sm rounded-2xl shadow
                ${isMe
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-100 rounded-bl-none"}
                `}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <ChatInput conversationId={id} />
      </div>
    </div>
  );
}
