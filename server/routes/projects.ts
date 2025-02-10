import { Router } from "express";
import { storage } from "../storage.js";

const router = Router();

router.get("/", async (_req, res) => {
  const projects = await storage.getAllProjects();
  res.json(projects);
});

export default router;