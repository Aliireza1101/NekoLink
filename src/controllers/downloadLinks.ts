import { Request, Response } from "express";
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

export const updateDownloadLink = async (
    req: Request<{ id: string }>,
    res: Response,
) => {
    console.log(
        !req.body.isActive &&
            !req.body.expiresAt &&
            !req.body.maxDownloads &&
            !req.body.downloadCount,
    );
    console.log(req.body.isActive);
    if (
        !req.body ||
        (!req.body.isActive &&
            !req.body.expiresAt &&
            !req.body.maxDownloads &&
            !req.body.downloadCount)
    ) {
        throw new AppError(
            "Please provide a field to update on download link",
            400,
        );
    }
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
