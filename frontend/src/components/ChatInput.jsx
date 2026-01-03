"use client";
import { useState } from "react";
import { socket } from "../app/socket.js";

export default function ChatInput({ conversationId }) {
  const [text, setText] = useState("");

  const send = () => {
    socket.emit("send_message", { conversationId, text });
    setText("");
  };

  return (
    <div className="p-4 border-t flex">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 border p-2"
        placeholder="Type message..."
      />
      <button onClick={send} className="ml-2 bg-blue-500 text-white px-4">
        Send
      </button>
    </div>
  );
}
