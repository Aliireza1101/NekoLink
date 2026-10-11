import { Router } from "express";
import {
    forgotPassword,
    login,
    resetPassword,
    signup,
} from "../controllers/auth";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

export default router;
