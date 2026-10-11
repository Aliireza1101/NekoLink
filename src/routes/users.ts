import { Router } from "express";
import { protect, restrictTo } from "../controllers/auth";
import { deleteMe, getAllUsers, getMe } from "../controllers/users";

const router = Router();
router.route("/users").get(protect, restrictTo("ADMIN"), getAllUsers);
router.route("/me").get(protect, getMe).delete(protect, deleteMe);
export default router;
