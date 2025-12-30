import express, { type Request, type Response } from "express";
import {
  loginHandler,
  signupHandler,
} from "../modules/auth/auth.controller.js";
import { authenticate } from "./middleware/auth.middleware.js";

const routes = express.Router();
routes.get("/login", loginHandler);
routes.post("/signup", signupHandler);
routes.get("/test", authenticate, (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "User is authencticated",
  });
});

export default routes;
