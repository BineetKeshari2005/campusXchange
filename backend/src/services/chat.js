import Conversation from "../models/chatConversation.js";
import Message from "../models/chatMessage.js";

// create or find 1-1 conversation between two users
export const getOrCreateConversation = async (userId1, userId2) => {
  let convo = await Conversation.findOne({
    participants: { $all: [userId1, userId2] },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [userId1, userId2],
    });
  }

  return convo;
};

export const sendMessage = async (conversationId, senderId, receiverId, text) => {
  // create message
  const msg = await Message.create({
    conversation: conversationId,
    sender: senderId,
    receiver: receiverId,
    text,
  });

  // update conversation last message
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    lastMessageAt: new Date(),
  });

  // populate sender/receiver for frontend use
  return msg.populate("sender receiver", "name email profilePhoto");
};

export const getMessages = async (conversationId, page = 1, limit = 20) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate("sender receiver", "name email profilePhoto");

  const total = await Message.countDocuments({ conversation: conversationId });

  return {
    items: messages.reverse(), // oldest → newest order for UI
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getUserConversations = async (userId) => {
  const convos = await Conversation.find({
    participants: userId,
  })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name email profilePhoto");

  return convos;
};
