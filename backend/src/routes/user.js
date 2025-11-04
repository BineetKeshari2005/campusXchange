import express from "express";
import cors from "cors";
import authenticateToken from "../utils/authMiddleware.js";
import User from "../models/user.js";
import getUser from "../controllers/user.js";

const router = express.Router();
router.use(cors());

router.get("/users", authenticateToken,getUser)

export default router;