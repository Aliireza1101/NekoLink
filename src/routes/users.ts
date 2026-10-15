import { Router } from "express";
import { requiredAuth, restrictTo } from "../controllers/auth";
import { deleteMe, getAllUsers, getMe } from "../controllers/users";

const router = Router();
router.route("/users").get(requiredAuth, restrictTo("ADMIN"), getAllUsers);
router.route("/me").get(requiredAuth, getMe).delete(requiredAuth, deleteMe);
export default router;
