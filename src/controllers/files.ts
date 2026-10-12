import { Request, Response } from "express";
import multer from "multer";
import AppError from "../utils/appError";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { DownloadLink, File } from "../db/models";

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

    const downloadLink = await newFile.createDownloadLink();
    const link = `${req.protocol}://${req.host}/api/files/${downloadLink.token}`;

    res.status(200).json({
        status: "success",
        file: newFile,
        downloadLink: `${link}/download`,
        detail: `${link}`,
    });
};

export const getFile = async (
    req: Request<{ token: string }>,
    res: Response,
) => {
    const link = await DownloadLink.findOne({
        where: { token: req.params.token },
        include: [{ model: File, as: "file" }],
    });
    if (!link || !link.isActive) {
        throw new AppError("Invalid file", 404);
    }
    res.status(200).json({
        status: "success",
        downloadLink: `${req.protocol}://${req.host}/api/files/${link.token}/download`,
    });
};

export const downloadFile = async (
    req: Request<{ token: string }>,
    res: Response,
) => {
    const link = await DownloadLink.findOne({
        where: { token: req.params.token },
        include: [{ model: File, as: "file" }],
    });
    if (!link || !link.isActive) {
        throw new AppError("Invalid download link", 404);
    }

    link.downloadCount += 1;
    await link.save();

    res.download(`uploads/tmp/${link.file.filename}`, link.file.originalName);
};
