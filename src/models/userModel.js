import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  lastLogin: Date,
});

const User = mongoose.model("User", userSchema);

const chatSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    image: {
      type: String, // store cloudinary URL
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export { User, Chat };
