import express, { type Request, Response, NextFunction } from "express";
import router from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
const HOST = process.env.HOST || "127.0.0.1";
const PORT = parseInt(process.env.PORT || "5000", 10);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Routes
app.use(router);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Log error
  log(`Error: ${status} - ${message}`, "error");
  
  // Don't expose internal error details in production
  const response = app.get("env") === "production" 
    ? { message: status === 500 ? "Internal Server Error" : message }
    : { message, stack: err.stack };
  
  res.status(status).json(response);
});

// Graceful shutdown
function gracefulShutdown(signal: string) {
  return () => {
    log(`Received ${signal}. Shutting down gracefully...`);
    process.exit(0);
  };
}

process.on("SIGTERM", gracefulShutdown("SIGTERM"));
process.on("SIGINT", gracefulShutdown("SIGINT"));

// Catch uncaught exceptions
process.on("uncaughtException", (err) => {
  log(`Uncaught Exception: ${err.message}`, "error");
  log(err.stack || "", "error");
  process.exit(1);
});

// Start server
(async () => {
  if (app.get("env") === "development") {
    const server = app.listen(PORT, HOST, () => {
      log(`Development server running on http://${HOST}:${PORT}`);
    });
    await setupVite(app, server);
  } else {
    serveStatic(app);
    app.listen(PORT, HOST, () => {
      log(`Production server running on http://${HOST}:${PORT}`);
    });
  }
})();
