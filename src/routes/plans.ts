import { Router } from "express";
import {
    getPlan,
    getPlans,
    createPlan,
    deletePlan,
} from "../controllers/plans";
import { protect, restrictTo } from "../controllers/auth";

const router = Router();
router.route("/").get(getPlans).post(protect, restrictTo("ADMIN"), createPlan);
router
    .route("/:id")
    .get(getPlan)
    .delete(protect, restrictTo("ADMIN"), deletePlan);

export default router;
