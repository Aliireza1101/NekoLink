import { Request, Response } from "express";
import { Plan } from "../db/models";
import AppError from "../utils/appError";

export const createPlan = async (req: Request, res: Response) => {
    console.log(req.body);
    const newPlan = await Plan.create({
        title: req.body.title,
        maxUploadSize: req.body.maxUploadSize,
        price: req.body.price,
    });
    res.status(200).json({ status: "success", plan: newPlan });
};

export const getPlans = async (req: Request, res: Response) => {
    const plans = await Plan.findAll();
    res.status(200).json({ status: "success", plans });
};

export const getPlan = async (req: Request<{ id: string }>, res: Response) => {
    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
        throw new AppError("Plan does not exist", 404);
    }
    res.status(200).json({ status: "success", plan });
};

export const deletePlan = async (
    req: Request<{ id: string }>,
    res: Response,
) => {
    await Plan.destroy({ where: { id: req.params.id } });
    res.status(204).json();
};
