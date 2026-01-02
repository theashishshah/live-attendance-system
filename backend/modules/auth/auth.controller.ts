import type { Request, Response, NextFunction } from "express";
import { login, signup, me } from "./auth.service.js";
import { sendResponse } from "../../src/core/api-response/api-responder.js";
import { clearAuthCookie, setAuthCookie } from "../../src/core/http/cookie.js";
import { createUserSchema } from "../user/user.schema.js";
import { createLoginSchema } from "./auth.schema.js";
import { AppError } from "../../src/core/errors/AppError.js";

export const signupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createUserSchema.parse(req.body);
    const { user, accessToken } = await signup({ ...data, role: "student" });
    setAuthCookie(res, accessToken);

    sendResponse(res, { user }, 201);
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createLoginSchema.parse(req.body);
    const { user, accessToken } = await login(data);
    setAuthCookie(res, accessToken);
    sendResponse(res, { user }, 200);
  } catch (err) {
    next(err);
  }
};

export const meHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("UNAUTHORIZED", 401);

    const result = await me({ userId: req.user.userId });
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    clearAuthCookie(res);
    return sendResponse(res, {
      success: true,
      message: "user logged out.",
    });
  } catch (error) {
    next(error);
  }
};
