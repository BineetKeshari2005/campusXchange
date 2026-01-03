import express from "express";
import auth from "../utils/authMiddleware.js";
import Conversation from "../models/conversation.js";
import Listing from "../models/listing.js";
import Message from "../models/message.js";

const router = express.Router();

/* ----------------------------
   START / GET CONVERSATION
-----------------------------*/
router.post("/start/:listingId", auth, async (req, res) => {
  try {
    const buyerId = req.user.id;
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const sellerId = listing.seller;

    let convo = await Conversation.findOne({
      buyerId,
      sellerId,
      listingId: listing._id
    });

    if (!convo) {
      convo = await Conversation.create({
        buyerId,
        sellerId,
        listingId: listing._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: "Chat start failed", err });
  }
});

/* ----------------------------
   SELLER / BUYER INBOX
-----------------------------*/
router.get("/inbox", auth, async (req, res) => {
  const userId = req.user.id;

  const convos = await Conversation.find({
    $or: [{ sellerId: userId }, { buyerId: userId }]
  })
  .populate("buyerId", "name")
  .populate("listingId");

  // 🔥 AUTO REMOVE DEAD CHATS
  const alive = [];
  for (let c of convos) {
    if (!c.listingId || c.listingId.status === "sold") {
      await Conversation.findByIdAndDelete(c._id); // auto cleanup
    } else {
      alive.push(c);
    }
  }

  res.json(alive.sort((a,b)=>b.updatedAt-a.updatedAt));
});


/* ----------------------------
   LOAD MESSAGES
-----------------------------*/
router.get("/:conversationId", auth, async (req, res) => {
  const msgs = await Message.find({ conversationId: req.params.conversationId })
    .sort({ createdAt: 1 });

  res.json(msgs);
});

/* ----------------------------
   MARK AS READ
-----------------------------*/
router.post("/read/:conversationId", auth, async (req, res) => {
  const convo = await Conversation.findById(req.params.conversationId);

  if (req.user.id == convo.sellerId) convo.unread.seller = 0;
  else convo.unread.buyer = 0;

  await convo.save();
  res.json({ success: true });
});

export default router;
