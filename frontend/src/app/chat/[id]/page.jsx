"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatPage() {
  const { id: conversationId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // info from URL query (seller)
  const otherId = searchParams.get("other");
  const otherName = searchParams.get("name") || "Seller";

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Get logged-in user from localStorage / token
  useEffect(() => {
    if (!conversationId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    let userObj = null;
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        userObj = JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }

    if (!userObj) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userObj = {
          id: payload.id,
          name: payload.name,
          email: payload.email,
        };
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }

    if (!userObj?.id) {
      alert("Session expired. Please login again.");
      router.push("/auth/login");
      return;
    }

    setCurrentUser(userObj);
  }, [conversationId, router]);

  // Fetch existing messages (REST)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${conversationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("📩 MESSAGES API:", data);

        if (!res.ok) {
          console.error("Failed to fetch messages:", data);
          return;
        }

        // backend returns { items: [] }
        const items = Array.isArray(data.items) ? data.items : data;
        setMessages(items || []);
        setTimeout(scrollToBottom, 50);
      } catch (err) {
        console.error("Messages fetch error:", err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Set up Socket.io connection
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected");
      setIsConnected(true);

      // register user and join room
      socket.emit("register", currentUser.id);
      socket.emit("join_conversation", { conversationId });
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    // Listen for new messages in this conversation
    socket.on("new_message", (msg) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 50);
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, currentUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !currentUser) return;

    const text = input.trim();
    setInput("");

    // Let backend save + broadcast
    socketRef.current.emit("send_message", {
      conversationId,
      senderId: currentUser.id,
      receiverId: otherId,
      text,
    });
  };

  if (!conversationId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Invalid conversation.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col h-screen bg-white border-x border-gray-200">
        {/* HEADER */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Avatar circle */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
              {otherName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold text-gray-900">{otherName}</p>
              <p className="text-xs text-gray-500">
                {isConnected ? "Connected" : "Reconnecting..."}
              </p>
            </div>
          </div>
        </header>

        {/* MESSAGES LIST */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg._id}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="mt-1 text-[10px] opacity-70 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </main>

        {/* INPUT AREA */}
        <form
          onSubmit={handleSend}
          className="border-t border-gray-200 px-4 py-3 bg-white flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-full bg-blue-600 disabled:bg-blue-300 text-white flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
