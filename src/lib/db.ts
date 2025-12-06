import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors in development, nothing in production
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
