import type { Request, Response, NextFunction } from "express";
import { sendFailure } from "../core/api-response/api-responder.js";

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role !== "teacher")
        return sendFailure(res, "FORBIDDEN", 401, "Forbidden, teacher access required");

    next();
};

export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role !== "student")
        return sendFailure(res, "FORBIDDEN", 401, "Forbidden, student access required");

    next();
};
