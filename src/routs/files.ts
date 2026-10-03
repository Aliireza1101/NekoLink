import { Router } from "express";
import { hostFile, uploadSingFile } from "../contorllers/files";

const router = Router();

router.post("/", uploadSingFile, hostFile);

export default router