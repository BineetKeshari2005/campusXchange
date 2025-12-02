import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Save a new message
export const sendMessage = async (conversationId, senderId, receiverId, text) => {
  const message = await Message.create({
    conversationId,
    senderId,
    receiverId,
    text,
  });

  return message;
};

// Get or create a conversation between 2 users
export const getOrCreateConversation = async (user1, user2) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [user1, user2] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [user1, user2],
    });
  }

  return conversation;
};

// Get messages in a conversation
export const getConversationMessages = async (conversationId) => {
  return await Message.find({ conversationId }).sort({ createdAt: 1 });
};
