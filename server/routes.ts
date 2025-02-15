import { Router } from "express";
import contactRouter from "./routes/contact.js";
import projectsRouter from "./routes/projects.js";
import teamMembersRouter from "./routes/team-members.js";

const router = Router();

// Remove the /api prefix since it's already added in index.ts
router.use("/contact", contactRouter);
router.use("/projects", projectsRouter);
router.use("/team-members", teamMembersRouter);

export default router;
