import { Request, Response } from "express";
import { User } from "../db/models";
import jwt from "jsonwebtoken";
import { type StringValue } from "ms";
import { UniqueConstraintError } from "sequelize";

const signToken = async (id: number) => {
    // This is not async and might cause problems
    return jwt.sign({ id }, process.env.JWT_SECRET_TOKEN as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
    });
};

export const signup = async (req: Request, res: Response) => {
    const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    });

    const token = await signToken(newUser.id);
    res.status(200).json({
        status: "success",
        token,
        me: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
        },
    });
};
