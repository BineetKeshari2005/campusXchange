import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./configuration/dbConfig.js";

import signupRoute from "./routes/signup.js";
import loginRoute from "./routes/login.js";
import userRoute from "./routes/user.js";
import listingRoutes from "./routes/listing.js";
import profileRoutes from "./routes/profile.js";
import savedRoutes from "./routes/saved.js";
import publicUserRoutes from "./routes/publicUser.js";
import chatService from "./services/chat.js";


dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Create HTTP server & Socket.IO server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // for dev, you can restrict later
  },
});

// store online userId -> socketId
const onlineUsers = new Map();

// make io available in controllers (req.app.get("io"))
app.set("io", io);

// SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // client: socket.emit("register", userId);
  socket.on("register", (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    console.log("User registered:", userId);
  });

  // client: socket.emit("join_conversation", { conversationId })
  socket.on("join_conversation", ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room ${conversationId}`);
  });

  // client: socket.emit("send_message", { conversationId, senderId, receiverId, text })
  socket.on("send_message", async ({ conversationId, senderId, receiverId, text }) => {
    try {
      if (!conversationId || !senderId || !receiverId || !text) return;

      // save in DB
      const message = await chatService.sendMessage(
        conversationId,
        senderId,
        receiverId,
        text
      );

      // emit to all in this conversation room
      io.to(conversationId).emit("new_message", message);

      // also send a notification-like event to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message_notification", {
          conversationId,
          message,
        });
      }
    } catch (err) {
      console.error("Socket send_message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    // clean from onlineUsers map
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// ROUTES
app.use("/api/listings", listingRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/saved", savedRoutes);
app.use("/user", signupRoute);
app.use("/auth", loginRoute);
app.use("/api", userRoute);
app.use("/api/public-user", publicUserRoutes);

// Root
app.get("/", (req, res) => {
  res.send("CampusXchange API with Real-Time Chat 🚀");
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
