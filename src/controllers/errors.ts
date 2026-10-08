import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { MulterError } from "multer";

const sendDevErr = async (err: AppError, res: Response) => {
    console.error(err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};

const sendProdErr = async (err: AppError, res: Response) => {
    if (err instanceof UniqueConstraintError) {
        return sendUniqueConstraintError(err, res);
    } else if (err instanceof ValidationError) {
        return sendValidationError(err, res);
    } else if (err instanceof MulterError) {
        return sendMulterError(err, res);
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "something went wrong",
        });
    }
};

const sendValidationError = (err: ValidationError, res: Response) => {
    res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: err.errors.map((value) => {
            return { field: value.path, message: value.message };
        }),
    });
};

const sendUniqueConstraintError = (
    err: UniqueConstraintError,
    res: Response,
) => {
    res.status(400).json({
        status: "error",
        message: `This ${err.errors[0]?.path} is already being used`,
    });
};

const sendMulterError = (err: MulterError, res: Response) => {
    res.status(400).json({
        status: "error",
        message: err.message,
    });
};

export const globalErrorHandler = async (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // If not already specified, its an error within the program.
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === "development") {
        await sendDevErr(err, res);
    } else if (process.env.NODE_ENV === "production") {
        await sendProdErr(err, res);
    }
};
