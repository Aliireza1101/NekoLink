import { Router } from "express";
import { getFile, uploadFile, multerUploader } from "../controllers/files";

const router = Router();

router.post("/", multerUploader, uploadFile);
router.get("/:token", getFile);

export default router;
