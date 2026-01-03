import { Router } from "express";
import {
  meHandler,
  signupHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
} from "./auth.controller.js";
import { authenticate } from "../../src/middleware/auth.middleware.js";

const authRoutes = Router();

authRoutes.get("/me", authenticate, meHandler);
authRoutes.get("/login", loginHandler);
authRoutes.post("/signup", signupHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.get("/refresh", refreshHandler);

export default authRoutes;
