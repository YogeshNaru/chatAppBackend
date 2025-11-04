import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import chatRoute from "./routes/chatRoute.js";
import { Chat } from "./models/userModel.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://allora-chat.vercel.app", "http://localhost:5173"],
    methods: ["get", "post"],
  },
});

const port = process.env.PORT || 8000;
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/user", userRoute);
app.use("/api", chatRoute);

// socket.io logic

const users = new Map(); // userid : socketId

io.on("connection", (Socket) => {
  console.log("a new user connected", Socket.id);

  Socket.on("register", (userId) => {
    users.set(userId, Socket.id);
    console.log("Registered user", userId);
    io.emit("online-users", Array.from(users.keys()));
  });

  Socket.on("send-message", async (data) => {
    // data = message , senderid , receiverid
    try {
      const newMsg = new Chat({
        message: data.message,
        sender: data.senderId,
        receiver: data.receiverId,
      });
      await newMsg.save();

      const populateMsg = await newMsg.populate([
        { path: "sender", select: "userName" },
        { path: "receiver", select: "userName" },
      ]);

      const senderSocket = users.get(data.senderId);
      const receiverSocket = users.get(data.receiverId);
      if (senderSocket)
        // if user is online then emit the message otherwise not
        io.to(senderSocket).emit("receive-message", populateMsg);
      if (receiverSocket)
        io.to(receiverSocket).emit("receive-message", populateMsg);
    } catch (error) {
      console.log("error saving message", error);
    }
  });

  Socket.on("disconnect", () => {
    for (const [userid, id] of users.entries()) {
      if (id === Socket.id) users.delete(userid);
    }
    console.log("user disconnected ", Socket.id);
    io.emit("online-users", Array.from(users.keys()));
  });
});

// db + start server

const dburl = process.env.MONGO_URL;
const start = async () => {
  await mongoose.connect(dburl);
  console.log("Database connected ");
  server.listen(port, () => {
    console.log("app is listen on port 8000");
  });
};

start();
