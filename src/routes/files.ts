import { Router } from "express";
import { getFile, uploadFile, multerUploader } from "../contorllers/files";

const router = Router();

router.post("/", multerUploader, uploadFile);
router.get("/:id", getFile);

export default router;
