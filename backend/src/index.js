import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

import connectDB from "./configuration/dbConfig.js";
import secretKey from "./configuration/jwtConfig.js";

import chatRoutes from "./routes/chat.js";
import signupRoute from "./routes/signup.js";
import loginRoute from "./routes/login.js";
import userRoute from "./routes/user.js";
import listingRoutes from "./routes/listing.js";
import profileRoutes from "./routes/profile.js";
import savedRoutes from "./routes/saved.js";
import publicUserRoutes from "./routes/publicUser.js";
import paymentsRoutes from "./routes/payments.js";
import orderRoutes from "./routes/order.js";
import Conversation from "./models/conversation.js";
import Message from "./models/message.js";

dotenv.config();
connectDB();

const app = express();
app.use("/api/payments/webhook", bodyParser.raw({ type: "application/json" }));
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.set("io", io);

const onlineUsers = new Map();

/* ================= SOCKET AUTH ================= */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("NO_TOKEN"));

  try {
    const user = jwt.verify(token, secretKey);
    socket.userId = user.id;
    next();
  } catch {
    next(new Error("INVALID_TOKEN"));
  }
});

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("Connected:", socket.userId);
  onlineUsers.set(socket.userId, socket.id);

  // JOIN ROOM
  socket.on("join_room", async (conversationId) => {
    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.buyerId || !convo.sellerId) return;

    if (![convo.buyerId.toString(), convo.sellerId.toString()].includes(socket.userId)) return;

    socket.join(conversationId);

    if (socket.userId === convo.buyerId.toString()) convo.unread.buyer = 0;
    if (socket.userId === convo.sellerId.toString()) convo.unread.seller = 0;
    await convo.save();
  });

  // SEND MESSAGE
  socket.on("send_message", async ({ conversationId, text }) => {
    const convo = await Conversation.findById(conversationId);
    if (!convo || convo.closed || !convo.buyerId || !convo.sellerId) return;

    const msg = await Message.create({
      conversationId,
      senderId: socket.userId,
      text
    });

    convo.lastMessage = text;
    convo.lastMessageAt = new Date();

    if (socket.userId === convo.buyerId.toString()) convo.unread.seller++;
    if (socket.userId === convo.sellerId.toString()) convo.unread.buyer++;
    await convo.save();

    io.to(conversationId).emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    console.log("Disconnected:", socket.userId);
  });
});

/* ================= ROUTES ================= */
app.use("/api/payments", paymentsRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/saved", savedRoutes);
app.use("/user", signupRoute);
app.use("/auth", loginRoute);
app.use("/api", userRoute);
app.use("/api/public-user", publicUserRoutes);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("CampusXchange API with Real-Time Marketplace Chat 🚀");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
