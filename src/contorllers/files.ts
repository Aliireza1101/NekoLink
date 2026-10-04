import { Request, Response } from "express";
import multer from "multer";
import AppError from "../utils/appError";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { File } from "../db/models";

const maxFileSize = Math.floor(Number(process.env.MAX_FILE_SIZE) * 2 ** 30);

const diskStorage = multer.diskStorage({
    destination: "uploads/tmp",
    filename(req, file, callback) {
        const ext = path.extname(file.originalname);
        const filename = ext ? `${randomUUID()}${ext}` : randomUUID();
        callback(null, filename);
    },
});

const upload = multer({
    limits: { fileSize: maxFileSize },
    storage: diskStorage,
});

export const uploadSingFile = upload.single("myfile");

export const hostFile = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError("Please upload a file", 400);
    }

    const newFile = await File.create({
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
    });

    res.status(200).json({
        status: "success",
        size: newFile.size,
        link: `${req.protocol}://${req.host}/api/files/${newFile.id}`,
    });
};
