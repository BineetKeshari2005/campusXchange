import * as chatService from "../services/chat.js";

// POST /api/chat/start/:userId
export const startConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myId = req.user.id;

    const convo = await chatService.getOrCreateConversation(myId, otherUserId);

    res.status(200).json(convo);
  } catch (err) {
    console.error("startConversation error:", err);
    res.status(500).json({ message: "Failed to start conversation" });
  }
};

// GET /api/chat
export const getMyConversations = async (req, res) => {
  try {
    const myId = req.user.id;
    const convos = await chatService.getUserConversations(myId);
    res.status(200).json(convos);
  } catch (err) {
    console.error("getMyConversations error:", err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// GET /api/chat/:conversationId/messages
export const getConversationMessages = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await chatService.getMessages(
      req.params.conversationId,
      page,
      limit
    );
    res.status(200).json(data);
  } catch (err) {
    console.error("getConversationMessages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// POST /api/chat/:conversationId/message
export const sendMessageHttp = async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    const senderId = req.user.id;
    const { conversationId } = req.params;

    if (!text || !receiverId) {
      return res.status(400).json({ message: "text and receiverId are required" });
    }

    const message = await chatService.sendMessage(
      conversationId,
      senderId,
      receiverId,
      text
    );

    // also emit via socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("new_message", message);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessageHttp error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
