import { Router } from "express";
import { protect, restrictTo } from "../controllers/auth";
import { updateDownloadLink } from "../controllers/downloadLinks";

const router = Router();
router.route("/:id").patch(protect, updateDownloadLink);
export default router;
