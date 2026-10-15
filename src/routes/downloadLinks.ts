import { Router } from "express";
import { requiredAuth, restrictTo } from "../controllers/auth";
import {
    deleteDownloadLink,
    updateDownloadLink,
    onlyOwner,
} from "../controllers/downloadLinks";

const router = Router();
router
    .route("/:id")
    .patch(requiredAuth, onlyOwner, updateDownloadLink)
    .delete(requiredAuth, onlyOwner, deleteDownloadLink);
export default router;
