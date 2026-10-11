import { NextFunction, Request, Response } from "express";
import { Plan, User } from "../db/models";
import AppError from "../utils/appError";

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await User.findAll({
        include: [{ model: Plan, as: "plan" }],
    });

    res.status(200).json({ status: "success", users });
};

export const getMe = async (req: Request, res: Response) => {
    const plan = await req.user.getPlan();
    let me = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        ...(req.user.role === "ADMIN" && { role: req.user.role }),
        plan,
    };

    res.status(200).json({
        status: "success",
        me,
    });
};

export const deleteMe = async (req: Request, res: Response) => {
    if (!req.body.password) {
        throw new AppError("Please enter your password to proceed", 400);
    }
    const user = req.user;
    if (!user.matchPassword(req.body.password)) {
        throw new AppError("Incorrect password", 401);
    }

    await user.destroy();
    res.status(204).json();
};

// Implement ban , delete user later
