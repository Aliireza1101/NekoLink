import { NextFunction, Request, Response } from "express";
import { Plan, User } from "../db/models";
import AppError from "../utils/errors";

// Me control for user

const getMeData = async (user: User) => {
    const plan = await user.getPlan();

    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        ...(user.role === "ADMIN" && { role: user.role }),
        plan,
    };
};

export const getMe = async (req: Request, res: Response) => {
    const me = await getMeData(req.user);

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

export const updateMe = async (req: Request, res: Response) => {
    await req.user.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    });

    const me = await getMeData(req.user);

    res.status(200).json({
        status: "success",
        me,
    });
};

// User control for admin

const findUser = async (id: string) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

export const getUser = async (req: Request<{ id: string }>, res: Response) => {
    const user = await findUser(req.params.id);
    res.status(200).json({ status: "success", user });
};

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await User.findAll({
        include: [{ model: Plan, as: "plan" }],
    });

    res.status(200).json({ status: "success", users });
};

export const deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
) => {
    const user = await findUser(req.params.id);
    await user.destroy();
    res.status(204).json();
};

export const editUser = async (req: Request<{ id: string }>, res: Response) => {
    const user = await findUser(req.params.id);
    await user.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        planId: req.body.planId,
    });
    res.status(200).json({ status: "success", user });
};
