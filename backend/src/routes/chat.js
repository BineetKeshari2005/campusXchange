import express from "express";
import authenticateToken from "../utils/authMiddleware.js";
import {
  startConversation,
  getMessages,
} from "../controllers/chat.js";

const router = express.Router();

// Start conversation
router.post("/start", authenticateToken, startConversation);

// Load messages
router.get("/messages/:conversationId", authenticateToken, getMessages);

export default router;
