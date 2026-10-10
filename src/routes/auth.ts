import { Router } from "express";
import { forgotPassword, login, signup } from "../controllers/auth";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);

export default router;
