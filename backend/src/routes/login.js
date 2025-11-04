import express from "express"
import cors from "cors"
import login from "../controllers/login.js";
import refreshToken from "../controllers/refreshToken.js";
const router = express.Router();
router.use(cors())
router.post("/login",login);
router.post("/refresh-token",refreshToken);
export default router;