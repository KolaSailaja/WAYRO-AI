/**
 * src/lib/db/client.ts
 *
 * Prisma ORM Client singleton (Prisma 6).
 *
 * The client is created lazily on first use so that importing this
 * module during Next.js builds or unit tests does not open a database
 * connection.
 *
 * Usage:
 *   import { getDb } from "@/lib/db/client";
 *   const users = await getDb().user.findMany();
 *
 * Run `npm run db:generate` after schema changes.
 * DATABASE_URL is required only when a query is actually executed.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lazy proxy matching the documented `db` import.
 * Property access constructs the client; module import does not.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
