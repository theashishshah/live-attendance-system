import type { NextFunction, Request, Response } from "express";
import { addStudentSchema, createClassSchema } from "./class.schema.js";
import { addStudentToClass, createClass } from "./class.service.js";
import { AppError } from "../../src/core/errors/AppError.js";
import {
  sendFailure,
  sendResponse,
} from "../../src/core/api-response/api-responder.js";

export const createClassHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = createClassSchema.parse(req.body);
    if (!req.user) throw new AppError("VALIDATION_ERROR", 400);

    const cls = await createClass(body.className, req.user.userId);

    return sendResponse(res, cls);
  } catch (error) {
    next(error);
  }
};

export const addStudentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // fix req.params to concrete
    const body = addStudentSchema.parse(req.body);
    if (!req.user || !req.params.id)
      throw new AppError("VALIDATION_ERROR", 400);

    const cls = await addStudentToClass(
      req.params.id,
      req.user.userId,
      body.studentId,
    );

    if (!cls)
      return sendFailure(res, "INVALID", 403, "Forbidden, not class teacher");

    return sendResponse(res, cls);
  } catch (error) {
    next(error);
  }
};
