import { NextFunction, Request, Response } from "express";
import multer from "multer";
import AppError, { NotFound } from "../utils/errors";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { DownloadLink, File, Plan } from "../db/models";

const maxFileSize = Math.floor(Number(process.env.MAX_FILE_SIZE) * 2 ** 30);

const diskStorage = multer.diskStorage({
    destination: "uploads/tmp",
    filename(req, file, callback) {
        const ext = path.extname(file.originalname);
        const filename = ext ? `${randomUUID()}${ext}` : randomUUID();
        callback(null, filename);
    },
});

export const uploadMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    let plan: Plan | null;
    if (req.user) {
        plan = await req.user.getPlan();
    } else {
        plan = await Plan.findOne({ where: { title: "free" } });
    }

    if (!plan) {
        console.error(
            `User ${req.user ? req.user.id : "anonymous"} does not have a plan`,
        );
        throw new AppError(
            "Service temporarily unavailable. Please try again later",
            500,
        );
    }

    const fileSizeLimit = plan.maxUploadSize;
    const multerUpload = multer({
        storage: diskStorage,
        limits: { fileSize: fileSizeLimit },
    }).single("file");

    multerUpload(req, res, next);
};

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError("Please upload a file", 400);
    }

    const userId = req.user ? req.user.id : undefined;
    const newFile = await File.create({
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        userId,
    });

    const expiresAt = new Date();
    if (req.user) {
        expiresAt.setDate(expiresAt.getDate() + 1);
    } else {
        expiresAt.setHours(expiresAt.getHours() + 4);
    }

    const downloadLink = await newFile.createDownloadLink({
        expiresAt,
        password: req.body.password,
    });

    const link = `${req.protocol}://${req.host}/api/files/${downloadLink.token}`;

    res.status(200).json({
        status: "success",
        downloadLink: `${link}/download`,
        detail: `${link}`,
    });
};

export const getFile = async (
    req: Request<{ token: string }>,
    res: Response,
) => {
    const link = await DownloadLink.scope("notExpired").findOne({
        where: { token: req.params.token },
        include: [{ model: File, as: "file" }],
    });
    if (!link || !link.isActive) {
        throw new NotFound("File");
    }
    res.status(200).json({
        status: "success",
        file: {
            name: link.file.originalName,
            mimeType: link.file.mimeType,
            size: link.file.size,
            passwordRequired: Boolean(link.password),
        },
        downloadLink: `${req.protocol}://${req.host}/api/files/${link.token}/download`,
    });
};

export const downloadFile = async (
    req: Request<{ token: string }>,
    res: Response,
) => {
    const link = await DownloadLink.scope("notExpired").findOne({
        where: { token: req.params.token },
        include: [{ model: File, as: "file" }],
    });
    if (!link || !link.isActive) {
        throw new NotFound("File");
    }

    if (link.password) {
        if (!req.body || !req.body.password) {
            throw new AppError("Password is required", 403);
        }

        if (!(await link.matchPassword(req.body.password))) {
            throw new AppError("Incorrect password", 403);
        }
    }

    link.downloadCount += 1;
    await link.save();

    res.download(`uploads/tmp/${link.file.filename}`, link.file.originalName);
};
