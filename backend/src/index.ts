import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { uploadRouter } from "./routes/upload.route";
import { importRouter } from "./routes/import.route";
import { historyRouter } from "./routes/history.route";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { isDbEnabled } from "./db/prisma";
import { logger } from "./utils/logger";

const app = express();
const PORT = Number(process.env.PORT || 4000);

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",").map((o) => o.trim()) : true,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Generous but sane limit — AI extraction is the expensive path.
const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI Mapping Failed — too many import requests. Please wait a few minutes and try again." },
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    dbEnabled: isDbEnabled(),
    aiProvider: process.env.AI_PROVIDER || "openai",
    time: new Date().toISOString(),
  });
});

app.use("/api/csv", uploadRouter);
app.use("/api/csv", importLimiter, importRouter);
app.use("/api/history", historyRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Easy CSV Importer API listening on port ${PORT}`, {
    dbEnabled: isDbEnabled(),
    aiProvider: process.env.AI_PROVIDER || "openai",
  });
});
