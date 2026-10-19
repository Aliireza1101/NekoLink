import { NextFunction, Request, Response } from "express";
import multer from "multer";
import AppError, { NotFound, PlanUnavailable } from "../utils/errors";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { DownloadLink, File, Plan } from "../db/models";

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
    let fileSizeLimit: number | undefined = undefined;

    if (req.user) {
        plan = await req.user.getPlan();
        const usedStorage = await File.sum("size", {
            where: { userId: req.user.id },
        });
        fileSizeLimit = plan.storageSize
            ? Math.min(plan.maxUploadSize, plan.storageSize - usedStorage)
            : plan.maxUploadSize;
    } else {
        plan = await Plan.findOne({ where: { title: "free" } });
    }

    if (!plan) {
        throw new PlanUnavailable(req.user ? req.user.id : "anonymous");
    }

    req.plan = plan;
    // require a plan to upload a file ('free' plan for anonymous users)

    const multerUpload = multer({
        storage: diskStorage,
        limits: { fileSize: fileSizeLimit || plan.maxUploadSize },
    }).single("file");

    multerUpload(req, res, next);
};

const validateExpDate = (
    expDate: Date,
    fileRetentionMinutes: number | null,
) => {
    // Check all the wrong possibilities and if wrong raise error
    if (Number.isNaN(expDate.getTime())) {
        throw new AppError("Invalid expiration date", 400);
    }
    if (expDate < new Date()) {
        throw new Error("Expiration must be in future");
    }

    if (!fileRetentionMinutes) {
        return;
    }

    const fileRetentionLimit = new Date();
    fileRetentionLimit.setMinutes(
        fileRetentionLimit.getMinutes() + fileRetentionMinutes,
    );

    if (fileRetentionLimit < expDate) {
        throw new AppError(
            "Expiration time exceeds your account's limits, pick a lower expiration",
            400,
        );
    }
};

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError("Please upload a file", 400);
    }

    let expiresAt: Date | undefined;

    if (req.body.expiresAt && req.user) {
        // If user passed custom exp date
        expiresAt = new Date(req.body.expiresAt);
        validateExpDate(expiresAt, req.plan.fileRetentionMinutes);
    } else {
        // Setting exp date based on user's plan
        expiresAt = new Date();
        if (req.plan.fileRetentionMinutes) {
            expiresAt.setMinutes(
                expiresAt.getMinutes() + req.plan.fileRetentionMinutes!,
            );
        } else {
            expiresAt = undefined;
        }
    }

    const userId = req.user ? req.user.id : undefined;
    const newFile = await File.create({
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        expiresAt,
        size: req.file.size,
        userId,
    });

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
