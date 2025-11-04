import Router from "express";
import { chatMsg } from "../controllers/chatController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.route("/chat").get(auth, chatMsg);

export default router;
