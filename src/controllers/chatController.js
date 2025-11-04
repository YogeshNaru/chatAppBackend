import { Chat } from "../models/userModel.js";

export const chatMsg = async (req, res) => {
  const { user1, user2 } = req.query;
  try {
    const messages = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { receiver: user1, sender: user2 },
      ],
    })
      .populate("sender", "userName")
      .populate("receiver", "userName")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "failed to fetch messages" });
  }
};
