import { DownloadLink, Plan, User } from "../db/models";
import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user: User;
            link: DownloadLink;
            plan: Plan;
        }
    }
}
