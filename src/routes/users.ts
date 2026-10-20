import { Router } from "express";
import { requiredAuth, restrictTo } from "../controllers/auth";
import {
    deleteMe,
    deleteUser,
    editUser,
    getAllUsers,
    getMe,
    getUser,
    updateMe,
} from "../controllers/users";

const router = Router();
router.use(["/me", "/users"], requiredAuth);

router.route("/me").get(getMe).delete(deleteMe).patch(updateMe);

router.use("/users", restrictTo("ADMIN"));
router.route("/users").get(getAllUsers);
router.route("/users/:id").get(getUser).delete(deleteUser).patch(editUser);

export default router;
