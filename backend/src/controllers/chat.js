import {
  sendMessage,
  getOrCreateConversation,
  getConversationMessages,
} from "../services/chat.js";

// Start or return existing conversation
export const startConversation = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({ message: "sellerId missing" });
    }

    const conversation = await getOrCreateConversation(userId, sellerId);

    return res.status(200).json({
      message: "Conversation ready",
      conversationId: conversation._id,
    });
  } catch (err) {
    console.error("Start Conversation Error:", err);
    return res.status(500).json({ message: "Failed to start conversation" });
  }
};

// Get all messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId missing" });
    }

    const messages = await getConversationMessages(conversationId);

    return res.status(200).json({ items: messages });
  } catch (err) {
    console.error("Get Messages Error:", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};
