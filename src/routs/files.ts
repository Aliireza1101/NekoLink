import { Router } from "express";
import { getFile, hostFile, uploadSingFile } from "../contorllers/files";

const router = Router();

router.post("/", uploadSingFile, hostFile);
router.get("/:id", getFile);

export default router;
