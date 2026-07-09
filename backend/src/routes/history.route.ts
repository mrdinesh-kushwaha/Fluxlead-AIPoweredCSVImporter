import { Router } from "express";
import { getPrisma, isDbEnabled } from "../db/prisma";

export const historyRouter = Router();

/**
 * GET /api/history
 * Returns the most recent import batches. Empty array (not an error) when
 * no database is configured, so the frontend can render an empty state.
 */
historyRouter.get("/", async (_req, res, next) => {
  try {
    if (!isDbEnabled()) {
      return res.status(200).json({ enabled: false, batches: [] });
    }

    const prisma = getPrisma();
    const batches = await prisma!.importBatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        fileName: true,
        totalReceived: true,
        totalImported: true,
        totalSkipped: true,
        durationMs: true,
        aiProvider: true,
        createdAt: true,
      },
    });

    res.status(200).json({ enabled: true, batches });
  } catch (err) {
    next(err);
  }
});
