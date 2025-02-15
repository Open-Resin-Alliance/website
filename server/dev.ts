import express from "express";
import router from "./routes.js";
import { setupVite } from "./vite.js";

const app = express();
const HOST = process.env.HOST || "127.0.0.1";
const PORT = parseInt(process.env.PORT || "5000", 10);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
app.use("/api", router);

// Start development server with Vite
const server = app.listen(PORT, HOST, () => {
  console.log(`Development server running on http://${HOST}:${PORT}`);
});

// Setup Vite middleware
setupVite(app, server).catch((err) => {
  console.error("Failed to start Vite:", err);
  process.exit(1);
});

export default app;