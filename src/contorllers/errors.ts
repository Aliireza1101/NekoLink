import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { ValidationError } from "sequelize";

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
    if (err.isOperational || err instanceof ValidationError) {
        // Safe to send error details
        res.status(err.statusCode).json({
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
