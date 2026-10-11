import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { type StringValue } from "ms";
import crypto from "crypto";

import { Op } from "sequelize";
import { User } from "../db/models";
import AppError from "../utils/appError";
import { sendForgotPasswordEmail } from "../emails/email";

const signToken = async (id: number, res: Response): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { id },
            process.env.JWT_SECRET_KEY as string,
            {
                expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
            },
            (err, token) => {
                if (token) {
                    res.cookie("jwt", token, {
                        httpOnly: true,
                        secure: false, // for development environment
                        sameSite: "lax",
                        maxAge: Number(process.env.JWT_COOKIE_MAX_AGE),
                    });
                    return resolve(token);
                }
                reject(err);
            },
        );
    });
};

const verifyToken = async (token: string): Promise<jwt.JwtPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET_KEY as string,
            {},
            (err, decoded) => {
                if (decoded && typeof decoded === "object")
                    return resolve(decoded);
                reject(err || new AppError("Invalid authorization token", 401));
            },
        );
    });
};

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token =
        req.cookies.jwt ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization?.split(" ")[1]
            : undefined);

    if (!token) {
        throw new AppError("Authorization required", 401);
    }

    const payload = await verifyToken(token);
    const user = await User.unscoped().findByPk(Number(payload.id));

    if (!user || user.hasPasswordChanged(payload.iat!)) {
        throw new AppError("Invalid authorization token", 401);
    }

    req.user = user;
    next();
};

export const signup = async (req: Request, res: Response) => {
    const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    });

    const token = await signToken(newUser.id, res);

    res.status(201).json({
        status: "success",
        token,
        me: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
        },
    });
};

export const login = async (req: Request, res: Response) => {
    if (!req.body.password || !req.body.email) {
        throw new AppError("Email or password is missing", 400);
    }
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user || !user.matchPassword(req.body.password)) {
        throw new AppError("Incorrect email or password", 401);
    }

    const token = await signToken(user.id, res);

    res.status(200).json({
        status: "success",
        token,
        me: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        },
    });
};

export const forgotPassword = async (req: Request, res: Response) => {
    if (!req.body.email) {
        throw new AppError("Please provide email", 400);
    }
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
        throw new AppError("Invalid email", 400);
    }

    const passwordResetToken = user.generatePasswordResetToken();
    await user.save({ hooks: false, validate: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${passwordResetToken}`;
    try {
        await sendForgotPasswordEmail(user.email, user.firstName, resetURL);
        res.status(200).json({
            status: "success",
            message: "Token was sent to your email",
        });
    } catch (err) {
        console.error(err);
        user.passwordResetToken = null;
        user.passwordTokenExpiresAt = null;
        await user.save();
        throw new AppError(
            "Something went wrong during sending the email, please try again later!",
            500,
        );
    }
};

export const resetPassword = async (
    req: Request<{ token: string }>,
    res: Response,
) => {
    if (!req.params.token || !req.body.password) {
        throw new AppError("Please provide both token and password", 400);
    }

    const hashedToken = crypto.hash("sha256", req.params.token);
    const user = await User.findOne({
        where: {
            passwordResetToken: hashedToken,
            passwordTokenExpiresAt: { [Op.gt]: new Date() },
        },
    });

    if (!user) {
        throw new AppError("Invalid or expired token", 404);
    }

    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordTokenExpiresAt = null;
    await user.save();

    const token = await signToken(user.id, res);
    res.status(200).json({ status: "success", token });
};
