import "server-only";

import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const generatePrismaClient = () =>
  process.env.NODE_ENV === "production"
    ? new PrismaClient()
    : new PrismaClient({
        log: ["query", "info", "warn", "error"],
      });

export const prisma = globalForPrisma.prisma || generatePrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
