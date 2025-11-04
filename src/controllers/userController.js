import { User } from "../models/userModel.js";
import bcrypt, { hash } from "bcrypt";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  let { userName, Email, password } = req.body;
  try {
    if (!userName || !Email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all details carefully!" });
    }
    const existingUser = await User.findOne({ $or: [{ userName }, { Email }] });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "userName or Email already exist " });
    }
    let hashPassword = await bcrypt.hash(password, 10);
    let newUser = new User({
      userName: userName,
      Email: Email,
      password: hashPassword,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, userName: newUser.userName },
      process.env.JWT_SECRET
    );
    return res.status(httpStatus.CREATED).json({
      message: "New user register",
      token: token,
      user: {
        _id: newUser._id,
        userName: newUser.userName,
        Email: newUser.Email,
      },
    });
  } catch (error) {
    res.json({
      message: `⚠️ Unable to create account. : ${error}`,
    });
  }
};

export const signin = async (req, res) => {
  let { userName, password } = req.body;
  try {
    let user = await User.findOne({ userName });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "user not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "⚠️ Incorrect email or password." });
    }

    const token = jwt.sign(
      { id: user._id, userName: user.userName },
      process.env.JWT_SECRET
    );

    return res.status(httpStatus.OK).json({
      token: token,
      user: { _id: user._id, userName: user.userName, Email: user.Email },
    });
  } catch (error) {
    return res.status(500).json({ message: "something went wrong " });
  }
};

export const allUser = async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "fetch users error" }, error);
  }
};
