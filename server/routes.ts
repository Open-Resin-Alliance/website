import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";

export function registerRoutes(app: Express): Server {
  app.get("/api/projects", async (_req, res) => {
    const projects = await storage.getAllProjects();
    res.json(projects);
  });

  app.get("/api/team", async (_req, res) => {
    const team = await storage.getAllTeamMembers();
    res.json(team);
  });

  const httpServer = createServer(app);
  return httpServer;
}
