import { Router } from "express";
import { authenticate } from "../../src/middleware/auth.middleware.js";
import { addStudentHandler, createClassHandler } from "./class.controller.js";
import { requireTeacher } from "../../src/middleware/rbac.middleware.js";

const classRoutes = Router();

classRoutes.post("/", authenticate, requireTeacher, createClassHandler);
classRoutes.post(
  "/:id/attendance",
  authenticate,
  requireTeacher,
  addStudentHandler,
);

export default classRoutes;
