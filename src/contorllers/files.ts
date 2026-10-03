import { Request, Response } from "express";
import multer from "multer";
import AppError from "../utils/appError";

const upload = multer({
    dest: "uploads/tmp",
    // limits: { fileSize: 0.2 * (2 * 30) },
});

export const uploadSingFile = upload.single("myfile");
export const hostFile = async (req: Request, res: Response) => {
    res.status(200).json({
        status: "success",
        link: `${req.protocol}://${req.host}/api/v1/slug`,
    });
};
