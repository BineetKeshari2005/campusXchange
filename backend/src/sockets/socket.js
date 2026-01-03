import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export default function socketServer(io) {
  io.on("connection", (socket) => {

    socket.on("join", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("send_message", async ({ conversationId, senderId, text }) => {
      const msg = await Message.create({ conversationId, senderId, text });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text,
        lastMessageAt: new Date(),
        $inc: { "unread.seller": 1, "unread.buyer": 1 }
      });

      io.to(conversationId).emit("receive_message", msg);
    });

  });
}
