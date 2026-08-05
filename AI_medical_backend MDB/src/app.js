import express from "express";
import cookieParser from "cookie-parser";

const app = express();

// ─── Global middleware ────────────────────────────────────────────────

const allowedOrigin = (process.env.CORS_ORIGIN || "http://localhost:5173").trim();

// Manually handle CORS for full Express 5 compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ─── Route mounts ─────────────────────────────────────────────────────

import authRouter from "./routes/auth.routes.js";
import diagnoseRouter from "./routes/diagnose.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/diagnose", diagnoseRouter);

// ─── Health check ─────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "PulseCare AI Medical Backend is running 🚀" });
});

// ─── Global error handler ─────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
});

export { app };
