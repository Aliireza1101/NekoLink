import { Router } from "express";
import {
    getPlan,
    getPlans,
    createPlan,
    deletePlan,
} from "../controllers/plans";
import { protect } from "../controllers/auth";

const router = Router();
router.route("/").get(getPlans).post(protect, createPlan);
router.route("/:id").get(getPlan).delete(protect, deletePlan);

export default router;
