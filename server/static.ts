import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const clientDistPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(clientDistPath)) {
    throw new Error(
      `Could not find the client build directory: ${clientDistPath}, make sure to build the client first`,
    );
  }

  // Serve static files with cache headers
  app.use(express.static(clientDistPath, {
    maxAge: '30d',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        // Don't cache HTML files
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
      }
    }
  }));

  // SPA fallback - must come after API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}