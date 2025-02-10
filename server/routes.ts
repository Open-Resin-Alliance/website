import { Router } from "express";
import contactRouter from "./routes/contact.js";
import projectsRouter from "./routes/projects.js";
import teamMembersRouter from "./routes/team-members.js";

const router = Router();

// API routes
router.use("/api/contact", contactRouter);
router.use("/api/projects", projectsRouter);
router.use("/api/team-members", teamMembersRouter);

export default router;
