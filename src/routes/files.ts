import { Router } from "express";
import {
    getFile,
    uploadFile,
    multerUploader,
    downloadFile,
} from "../controllers/files";
import { optionalAuth } from "../controllers/auth";

const router = Router();

router.post("/", optionalAuth, multerUploader, uploadFile);
router.get("/:token", getFile);
router.get("/:token/download", downloadFile);

export default router;
