import { Router } from "express";
import { signup } from "../controllers/auth";

const router = Router();

router.route("/signup").post(signup);

export default router;
