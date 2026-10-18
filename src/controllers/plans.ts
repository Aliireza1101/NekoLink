import { Request, Response } from "express";
import { Plan } from "../db/models";
import AppError, { NotFound } from "../utils/errors";

export const createPlan = async (req: Request, res: Response) => {
    console.log(req.body);
    const newPlan = await Plan.create({
        title: req.body.title,
        maxUploadSize: req.body.maxUploadSize,
        storageSize: req.body.storageSize,
        fileRetentionMinutes: req.body.fileRetentionMinutes,
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
        throw new NotFound("Plan");
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
