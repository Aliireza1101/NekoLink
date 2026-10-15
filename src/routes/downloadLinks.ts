import { Router } from "express";
import { protect, restrictTo } from "../controllers/auth";
import {
    deleteDownloadLink,
    updateDownloadLink,
    onlyOwner,
} from "../controllers/downloadLinks";

const router = Router();
router
    .route("/:id")
    .patch(protect, onlyOwner, updateDownloadLink)
    .delete(protect, onlyOwner, deleteDownloadLink);
export default router;
