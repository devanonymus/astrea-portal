import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalDb = globalThis as unknown as { astreaDb?: PrismaClient };
export function db() {
  if (!globalDb.astreaDb) {
    const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
    if (!connectionString) throw new Error("Database non configurato.");
    globalDb.astreaDb = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 10, connectionTimeoutMillis: 5000 }) });
  }
  return globalDb.astreaDb;
}
