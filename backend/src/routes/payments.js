import express from "express";
import crypto from "crypto";
import { razorpay } from "../configuration/razorpay.js";
import User from "../models/user.js";
import Listing from "../models/listing.js";
import Order from "../models/order.js";
import auth from "../utils/authMiddleware.js";

const router = express.Router();

/* ==================================================
   SELLER ONBOARDING
================================================== */
router.post("/seller/onboard", auth, async (req, res) => {
  try {
    const seller = await User.findById(req.user.id);
      
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if (!seller.phone || !seller.email || !seller.name) {
      return res.status(400).json({ message: "Seller profile incomplete (name/email/phone required)" });
    }
    
    console.log("SELLER DEBUG:", seller);
    // Create connected account
    if (!seller.razorpayAccountId) {
      const account = await razorpay.accounts.create({
        type: "route",
        legal_business_name: seller.name,
        business_type: "individual",
        contact_name: seller.name,
        contact_mobile: seller.phone.toString(),   // MUST be string
        email: seller.email
      });

      seller.razorpayAccountId = account.id;
      await seller.save();
    }

    // Create onboarding link
    const link = await razorpay.accountLinks.create({
      account: seller.razorpayAccountId,
      purpose: "account_onboarding",
      refresh_url: `${process.env.FRONTEND_URL}/seller/payments`,
      return_url: `${process.env.FRONTEND_URL}/seller/payments`
    });

    return res.json({ url: link.short_url });

  } catch (err) {
    console.error("RAZORPAY:", err.error || err);
    return res.status(500).json({ message: "Razorpay Error", error: err.error });
  }

  
});


/* ==================================================
   CREATE PAYMENT ORDER
================================================== */
router.post("/pay/:listingId", auth, async (req, res) => {
  const listing = await Listing.findById(req.params.listingId).populate("seller");

  const razorpayOrder = await razorpay.orders.create({
    amount: listing.price * 100,
    currency: "INR",
    receipt: listing._id.toString()
  });

  await Order.create({
    buyerId: req.user.id,
    sellerId: listing.seller._id,
    listingId: listing._id,
    amount: listing.price,
    razorpayOrderId: razorpayOrder.id,
    status: "pending"
  });

  res.json(razorpayOrder);
});

/* ==================================================
   VERIFY & PAY SELLER
================================================== */
router.post("/verify", auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature)
    return res.status(400).json({ message: "Payment verification failed" });

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

  if (!order) return res.status(404).json({ message: "Order not found" });

  // 1. Mark order paid
  order.status = "paid";
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  await order.save();

  // 2. Mark listing sold
  const listing = await Listing.findByIdAndUpdate(
    order.listingId,
    { status: "sold" },
    { new: true }
  );

 await User.findByIdAndUpdate(order.sellerId, {
  $addToSet: { sold: listing._id }
});

await User.findByIdAndUpdate(order.buyerId, {
  $addToSet: { bought: listing._id }
});

  // 5. Transfer to seller
  const seller = await User.findById(order.sellerId);
  if (seller?.razorpayAccountId) {
    await razorpay.transfers.create({
      account: seller.razorpayAccountId,
      amount: order.amount * 100 - 100,
      currency: "INR",
      notes: { orderId: order._id.toString() }
    });
  }

  res.json({ success: true });
});


export default router;
