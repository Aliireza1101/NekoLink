import { Router } from "express";
import {
    getFile,
    uploadFile,
    uploadMiddleware,
    downloadFile,
} from "../controllers/files";
import { optionalAuth } from "../controllers/auth";

const router = Router();

router.post("/", optionalAuth, uploadMiddleware, uploadFile);
router.get("/:token", getFile);
router.route("/:token/download").get(downloadFile).post(downloadFile);

export default router;
