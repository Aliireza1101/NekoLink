import { NextFunction, Request, Response } from "express";
import { DownloadLink, File } from "../db/models";
import AppError, { NotFound } from "../utils/errors";

const filterObj = (obj: Record<string, string>, fields: string[]) => {
    const result: Record<string, string> = {};
    Object.keys(obj).forEach((field) => {
        if (fields.includes(field)) {
            result[field] = obj[field] as string;
        }
    });
    return result;
};

export const onlyOwner = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
) => {
    const link = await DownloadLink.findByPk(req.params.id);

    if (!link) {
        throw new NotFound("Download Link");
    }

    const file = await File.findOne({
        where: {
            id: link.fileId,
            userId: req.user.id,
        },
    });
    if (!file) {
        throw new NotFound("Download Link");
    }

    req.link = link;
    next();
};

export const updateDownloadLink = async (
    req: Request<{ id: string }>,
    res: Response,
) => {
    if (
        !req.body ||
        (!req.body.isActive === undefined &&
            !req.body.expiresAt === undefined &&
            !req.body.maxDownloads === undefined &&
            !req.body.downloadCount === undefined)
    ) {
        throw new AppError(
            "Please provide a field to update on download link",
            400,
        );
    }

    const link = req.link;

    const updateFields = filterObj(req.body, [
        "isActive",
        "expiresAt",
        "maxDownloads",
        "downloadCount",
    ]);
    await link.update(updateFields);

    res.status(200).json({
        status: "success",
        data: {
            downloadLink: link,
        },
    });
};

export const deleteDownloadLink = async (
    req: Request<{ id: string }>,
    res: Response,
) => {
    await req.link.destroy();
    res.status(204).json();
};
