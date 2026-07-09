import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

let prisma: PrismaClient | null = null;

/**
 * The database is optional per the assignment brief ("keep the project
 * stateless" is allowed). We only construct a PrismaClient if DATABASE_URL
 * is configured, so the API works fully without Postgres/Neon connected.
 */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    prisma = new PrismaClient();
    logger.info("Prisma client initialized");
  }
  return prisma;
}

export const isDbEnabled = () => Boolean(process.env.DATABASE_URL);
