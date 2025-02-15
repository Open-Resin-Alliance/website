import express from "express";
import fs from "fs";
import path from "path";
import router from "./routes.js";

const app = express();
const HOST = process.env.HOST || "127.0.0.1";
const PORT = parseInt(process.env.PORT || "5000", 10);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

// API routes
app.use("/api", router);

// Serve static files
const clientDistPath = path.resolve(process.cwd(), "dist", "public");
if (!fs.existsSync(clientDistPath)) {
  throw new Error(
    `Could not find the client build directory: ${clientDistPath}, make sure to build the client first`,
  );
}

app.use(express.static(clientDistPath, {
  maxAge: '30d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
  }
}));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  log(`Error: ${status} - ${message}`, "error");
  
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
app.listen(PORT, HOST, () => {
  log(`Production server running on http://${HOST}:${PORT}`);
});

export default app;
