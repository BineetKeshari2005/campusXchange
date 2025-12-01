import express from "express";
import authenticateToken from "../utils/authMiddleware.js";
import {
  startConversation,
  getMyConversations,
  getConversationMessages,
  sendMessageHttp,
} from "../controllers/chat.js";

const router = express.Router();

// All routes require login
router.use(authenticateToken);

// Start or get existing conversation with another user
router.post("/start/:userId", startConversation);

// Get my conversation list
router.get("/", getMyConversations);

// Get messages in one conversation
router.get("/:conversationId/messages", getConversationMessages);

// Send a message via HTTP (also emits via socket.io)
router.post("/:conversationId/message", sendMessageHttp);

export default router;
