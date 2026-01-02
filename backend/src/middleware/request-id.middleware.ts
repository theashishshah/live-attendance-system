import { randomUUID } from "crypto";
import type { Response, Request, NextFunction } from "express";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  res.locals.meta = {
    requestId: randomUUID(),
    timestamp: new Date().toISOString(),
  };
  next();
};
