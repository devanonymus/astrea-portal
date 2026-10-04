import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
if (!connectionString) throw new Error("Database non configurato.");
const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
try { const now = new Date(); await client.$transaction([client.session.deleteMany({ where: { expires: { lt: now } } }), client.verificationToken.deleteMany({ where: { expires: { lt: now } } }), client.securityRateLimit.deleteMany({ where: { expires: { lt: now } } })]); process.stdout.write("Record di sicurezza scaduti rimossi.\n"); }
catch { process.stderr.write("Pulizia non riuscita.\n"); process.exitCode = 1; }
finally { await client.$disconnect(); }
