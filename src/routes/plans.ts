import { Router } from "express";
import {
    getPlan,
    getPlans,
    createPlan,
    deletePlan,
} from "../controllers/plans";

const router = Router();
router.route("/").get(getPlans).post(createPlan);
router.route("/:id").get(getPlan).delete(deletePlan);

export default router;
