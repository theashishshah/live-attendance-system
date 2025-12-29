import type { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors/AppError.js";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      throw new AppError("UNAUTHORIZED", 401, "Token missing.");
    }
    const payload = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!,
    ) as JwtPayload & {
      role: string;
    };

    if (!payload.userId)
      throw new AppError("UNAUTHORIZED", 401, "Token expired");

    //TODO: test it
    req.user = {
      userId: payload.userId as string,
      role: payload.role,
    };
    next();
  } catch (err) {
    next(new AppError("UNAUTHORIZED", 401));
  }
};
