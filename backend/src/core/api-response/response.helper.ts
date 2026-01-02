import type { Response } from "express";

export const sendResponse = <T>(res: Response, data: T, status = 200) => {
  res.status(status).json({
    success: true,
    data,
    meta: res.locals.meta,
  });
};

export const sendFailure = (
  res: Response,
  code: string,
  status = 400,
  message: string,
  details?: unknown,
) => {
  res.status(status).json({
    success: false,
    error: { message, code, details },
    meta: res.locals.meta,
  });
};
