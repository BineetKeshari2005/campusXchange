import express from "express";
import authenticateToken from "../utils/authMiddleware.js";
import Order from "../models/order.js";

const router = express.Router();

/* SELLER DASHBOARD */
router.get("/sold", authenticateToken, async (req, res) => {
  const orders = await Order.find({ sellerId: req.user.id, status: "paid" })
    .populate("listingId")
    .populate("buyerId", "name email");

  res.json(orders);
});

/* BUYER DASHBOARD */
router.get("/bought", authenticateToken, async (req, res) => {
  const orders = await Order.find({ buyerId: req.user.id, status: "paid" })
    .populate("listingId")
    .populate("sellerId", "name email");

  res.json(orders);
});

export default router;
