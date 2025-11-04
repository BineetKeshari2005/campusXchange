import express from "express";
import signupController from "../controllers/signup.js";

const router = express.Router();

router.post("/register", signupController.createUser);

export default router;