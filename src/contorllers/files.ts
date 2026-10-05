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

export const multerUploader = upload.single("file");

export const uploadFile = async (req: Request, res: Response) => {
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

export const getFile = async (req: Request<{ id: string }>, res: Response) => {
    const file = await File.findOne({ where: { id: req.params.id } });
    if (!file) {
        throw new AppError("File not found", 404);
    }

    res.download(`uploads/tmp/${file.filename}`, file.originalName);
};
