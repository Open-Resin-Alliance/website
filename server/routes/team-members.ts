import { Router } from "express";
import { storage } from "../storage.js";

const router = Router();

router.get("/", async (_req, res) => {
  const members = await storage.getAllTeamMembers();
  res.json(members);
});

export default router;