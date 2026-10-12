import { Router } from "express";
import {
    getFile,
    uploadFile,
    multerUploader,
    downloadFile,
} from "../controllers/files";

const router = Router();

router.post("/", multerUploader, uploadFile);
router.get("/:token", getFile);
router.get("/:token/download", downloadFile);

export default router;
