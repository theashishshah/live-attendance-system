import express from "express";
import type { Request, Response } from "express";
import { sendResponse, sendFailure } from "./core/api-response/response.helper.js";
import { requestId } from "./middleware/request-id.middleware.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import router from "./routes.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(requestId);
app.use("/api/v1", router);
app.use(errorHandler);

app.get("/healthcheck", (req: Request, res: Response) => {
    return sendResponse(
        res,
        {
            name: "Ashish Shah",
            age: 21,
        },
        200
    );
});

app.get("/failure", (req: Request, res: Response) => {
    try {
        throw new Error("Forced failure to test in /failure route.");
    } catch (err) {
        console.error("Error: ", err);
        if (err instanceof Error) {
            return sendFailure(res, "FAILURE", 500, err.message, "For testing purpose only.");
        }

        return sendFailure(res, "FAILURE", 500, "unknown error.");
    }
});

export default app;
