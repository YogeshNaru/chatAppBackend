import Router from "express";
import { signup, signin, allUser } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
const router = Router();

router.route("/signin").post(signin);

router.route("/signup").post(signup);

router.route("/all").get(auth, allUser);

export default router;
