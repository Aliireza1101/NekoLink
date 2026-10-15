import { Router } from "express";
import {
    getPlan,
    getPlans,
    createPlan,
    deletePlan,
} from "../controllers/plans";
import { requiredAuth, restrictTo } from "../controllers/auth";

const router = Router();
router.route("/").get(getPlans).post(requiredAuth, restrictTo("ADMIN"), createPlan);
router
    .route("/:id")
    .get(getPlan)
    .delete(requiredAuth, restrictTo("ADMIN"), deletePlan);

export default router;
