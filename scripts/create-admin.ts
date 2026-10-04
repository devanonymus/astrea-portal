// Operational bootstrap: password is read from a hidden terminal prompt, never an argument or an environment file.
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import { createInterface } from "node:readline/promises";
import { emailSchema, passwordSchema } from "../lib/validation";
const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
if (!connectionString) throw new Error("Database non configurato.");
if (!process.stdin.isTTY) throw new Error("Esegui il bootstrap da un terminale interattivo.");
const terminal = createInterface({ input: process.stdin, output: process.stdout });
const email = emailSchema.parse(await terminal.question("Email amministratore: "));
terminal.close();
process.stdout.write("Password (almeno 12 caratteri, input nascosto): ");
process.stdin.setRawMode(true); process.stdin.resume();
const password = await new Promise<string>((resolve, reject) => {
  let value = "";
  const onData = (data: Buffer) => { for (const char of data.toString()) {
    if (char === "\u0003") { process.stdin.off("data",onData); reject(new Error("Annullato.")); return; }
    if (char === "\r" || char === "\n") { process.stdin.off("data",onData); resolve(value); return; }
    if (char === "\u007f") value = value.slice(0,-1); else value += char;
  } };
  process.stdin.on("data",onData);
}).finally(()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write("\n");});
const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
try {
  if (await client.user.findUnique({ where: { email } })) throw new Error("Indirizzo già registrato. Il bootstrap non cambia il ruolo degli account esistenti.");
  await client.user.create({ data: { email, role: "ADMIN", firstName: "Amministratore", lastName: "ASTREA", passwordHash: await hash(passwordSchema.parse(password), { memoryCost: 19456, timeCost: 2, parallelism: 1 }) } });
  process.stdout.write("Account amministratore creato.\n");
} catch { process.stderr.write("Creazione non riuscita. Verifica configurazione e unicità dell'account.\n"); process.exitCode = 1; }
finally { await client.$disconnect(); }
