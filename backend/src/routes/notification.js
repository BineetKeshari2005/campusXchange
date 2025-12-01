import express from "express";
import authenticateToken from "../utils/authMiddleware.js";
import { myNotifications, readNotification } from "../controllers/notification.js";

const router = express.Router();


export default router;
