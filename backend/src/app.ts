import express from "express";
import type { Request, Response } from "express";
import { failure, success } from "./core/api-response/response.helper.js";

const app = express();

app.get("/healthcheck", (req: Request, res: Response) => {
  return success(
    res,
    {
      name: "Ashish Shah",
      age: 21,
    },
    200,
  );
});

app.get("/failure", (req: Request, res: Response) => {
  try {
    throw new Error("Forced failure to test in /failure route.");
  } catch (err) {
    console.error("Error: ", err);
    if (err instanceof Error) {
      return failure(
        res,
        "FAILURE",
        500,
        err.message,
        "For testing purpose only.",
      );
    }

    return failure(res, "FAILURE", 500, "unknown error.");
  }
});

export default app;
