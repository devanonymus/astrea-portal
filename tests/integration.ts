// Isolated PostgreSQL-compatible database, SMTP sink and private S3 stand-in.
// No .env is read here; the child web server receives explicit local overrides.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { SMTPServer } from "smtp-server";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";

const database = await PGlite.create();
for (const migration of (await readdir("prisma/migrations")).filter(n=>/^\d/.test(n)).sort()) await database.exec(await readFile(`prisma/migrations/${migration}/migration.sql`,"utf8"));
const pgServer = new PGLiteSocketServer({ db: database, host: "127.0.0.1", port: 55439, maxConnections: 20 });
await pgServer.start();
const connectionString = "postgresql://postgres@127.0.0.1:55439/postgres";
const client = new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 1 }) });
const messages: string[] = [];
const smtp = new SMTPServer({ authOptional: true, disabledCommands: ["STARTTLS"], onData(stream,_session,callback) { let value=""; stream.on("data",chunk=>value+=chunk.toString()); stream.on("end",()=>{messages.push(value);callback();}); } });
await new Promise<void>(resolve=>smtp.listen(55440,"127.0.0.1",resolve));
const objects = new Map<string,Buffer>();
const s3 = createServer(async(req,res)=>{
  const path=new URL(req.url || "/","http://127.0.0.1").pathname;
  if(req.method==="PUT") { const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(chunk); objects.set(path,Buffer.concat(chunks));res.writeHead(200,{ETag:'"test-etag"'});res.end(); }
  else if(req.method==="DELETE") {objects.delete(path);res.writeHead(204);res.end();}
  else if(req.method==="GET" && objects.has(path)) {res.writeHead(200,{"Content-Type":"application/octet-stream"});res.end(objects.get(path));}
  else {res.writeHead(404);res.end();}
});
s3.listen(55441,"127.0.0.1"); await once(s3,"listening");
const origin="https://astrea.test";
const base="http://127.0.0.1:55442";
const password = randomBytes(24).toString("hex");
const passwordHash = await hash(password,{memoryCost:19456,timeCost:2,parallelism:1});
const admin = await client.user.create({data:{email:"admin@example.invalid",role:"ADMIN",passwordHash,firstName:"Admin",lastName:"Test"}});
const professional = await client.user.create({data:{email:"professional@example.invalid",role:"PROFESSIONAL",passwordHash,firstName:"Professional",lastName:"One",professionalProfile:{create:{profession:"Ricercatore",expertise:[],enabled:true}}}});
await client.user.create({data:{email:"other-professional@example.invalid",role:"PROFESSIONAL",passwordHash,professionalProfile:{create:{profession:"Ricercatore",expertise:[],enabled:true}}}});
const app = spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","55442"],{env:{...process.env,NODE_ENV:"production",DATABASE_URL:connectionString,DATABASE_PUBLIC_URL:"",APP_URL:origin,GOOGLE_CLIENT_ID:"",GOOGLE_CLIENT_SECRET:"",SMTP_HOST:"127.0.0.1",SMTP_PORT:"55440",SMTP_USER:"",SMTP_PASSWORD:"",SMTP_FROM:"astrea@example.invalid",S3_ENDPOINT:"http://127.0.0.1:55441",S3_REGION:"us-east-1",S3_BUCKET:"test-private",S3_ACCESS_KEY_ID:randomBytes(16).toString("hex"),S3_SECRET_ACCESS_KEY:randomBytes(32).toString("hex"),S3_FORCE_PATH_STYLE:"true",CONTACT_EMAIL:""},stdio:["ignore","ignore","ignore"]});
type Result = {response: Response; body: {redirect?:string;message?:string;error?:string}; cookie: string};
async function post(path:string, values:Record<string,string|File>, cookie="", requestOrigin=origin):Promise<Result> {
  const form=new FormData(); for(const [key,value]of Object.entries(values))form.set(key,value);
  const response=await fetch(base+path,{method:"POST",headers:{Origin:requestOrigin,...(cookie?{Cookie:cookie}:{})},body:form,redirect:"manual"});
  return {response,body:await response.json(),cookie:(response.headers.get("set-cookie") || "").split(";")[0]};
}
const auth=async(email:string)=>{const r=await post("/api/auth/login",{email,password});assert.equal(r.response.status,200);assert.ok(r.response.headers.get("set-cookie")?.includes("HttpOnly"));assert.ok(r.response.headers.get("set-cookie")?.includes("Secure"));return r.cookie;};
const get=async(path:string,cookie="")=>fetch(base+path,{headers:cookie?{Cookie:cookie}:{},redirect:"manual"});
const mailToken=(message:string)=>message.replace(/=\r?\n/g,"").replace(/=([0-9A-F]{2})/g,(_match,hex)=>String.fromCharCode(parseInt(hex,16))).match(/token=([A-Za-z0-9_-]{43})/)?.[1];
let checks=0;
try {
  let ready=false;
  for(let i=0;i<100;i++){try{if((await get("/api/health")).status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert.ok(ready,"isolated server became ready");
  for(const path of ["/","/chi-siamo","/rete-scientifica","/attivita","/proposte-di-astrea","/le-mie-proposte","/attivita-dei-soci","/contatti","/notizie","/notizie/ambiente","/notizie/technologia","/notizie/energie-rinnovabili","/sportello-tecnologico","/registrazione","/accedi","/privacy","/termini"]){const r=await get(path);assert.equal(r.status,200);assert.ok((await r.text()).includes("<h1"));checks++;}
  for(const path of ["/admin","/professionista","/area-riservata"]){const r=await get(path);assert.ok([307,308].includes(r.status));assert.equal(r.headers.get("location"),"/accedi");checks++;}
  assert.equal((await post("/api/auth/login",{email:"admin@example.invalid",password},"","https://foreign.invalid")).response.status,403);checks++;
  assert.equal((await post("/api/portal/create-ticket",{subject:"Unauthorized",description:"Not allowed to create a case",category:"OTHER"})).response.status,401);checks++;
  const registration={firstName:"Citizen",lastName:"One",email:"citizen@example.invalid",password,accountType:"CITIZEN",privacy:"on",terms:"on",role:"ADMIN"};
  const registered=await post("/api/auth/register",registration);assert.equal(registered.response.status,200);const citizenCookie=registered.cookie;
  const citizen=await client.user.findUniqueOrThrow({where:{email:registration.email}});assert.equal(citizen.role,"USER");assert.ok(citizen.passwordHash?.startsWith("$argon2id$"));checks++;
  const verificationToken=mailToken(messages.at(-1)!);assert.ok(verificationToken);assert.equal((await post("/api/auth/verify",{token:verificationToken!})).response.status,200);assert.ok((await client.user.findUniqueOrThrow({where:{id:citizen.id}})).emailVerified);assert.equal((await post("/api/auth/verify",{token:verificationToken!})).response.status,400);checks++;
  const business=await post("/api/auth/register",{...registration,email:"business@example.invalid",accountType:"BUSINESS",companyName:"Test business",vatNumber:"12345678901"});assert.equal(business.response.status,200);checks++;
  assert.equal((await post("/api/auth/register",{...registration,email:"bad-business@example.invalid",accountType:"BUSINESS"})).response.status,400);checks++;
  const created=await post("/api/portal/create-ticket",{category:"OTHER",subject:"Test richiesta territorio",description:"Descrizione di una richiesta di orientamento per il territorio.",professionalId:professional.id},citizenCookie);assert.equal(created.response.status,200);const ticketId=created.body.redirect!.split("/").pop()!;
  let ticket=await client.ticket.findUniqueOrThrow({where:{id:ticketId}});assert.equal(ticket.status,"NEW");assert.equal(ticket.assignedProfessionalId,null);checks++;
  assert.equal((await post("/api/portal/message",{ticketId,body:"Not mine"},business.cookie)).response.status,404);checks++;
  const denied=await get(`/area-riservata/pratiche/${ticketId}`,business.cookie);assert.equal(denied.status,404);checks++;
  assert.equal((await post("/api/portal/message",{ticketId,body:"Internal attempt",internalOnly:"on"},citizenCookie)).response.status,403);checks++;
  assert.equal((await post("/api/portal/status",{ticketId,status:"IN_PROGRESS"},citizenCookie)).response.status,403);checks++;
  const adminCookie=await auth("admin@example.invalid");const professionalCookie=await auth("professional@example.invalid");const otherProfessionalCookie=await auth("other-professional@example.invalid");
  assert.equal((await post("/api/portal/assign",{ticketId,professionalId:professional.id},adminCookie)).response.status,403);checks++;
  for(const status of ["UNDER_REVIEW","IN_PROGRESS"])assert.equal((await post("/api/portal/status",{ticketId,status},adminCookie)).response.status,200);checks++;
  assert.equal((await post("/api/portal/assign",{ticketId,professionalId:professional.id},adminCookie)).response.status,200);checks++;
  assert.equal((await get(`/professionista/pratiche/${ticketId}`,professionalCookie)).status,200);assert.equal((await get(`/professionista/pratiche/${ticketId}`,otherProfessionalCookie)).status,404);checks++;
  assert.equal((await post("/api/portal/message",{ticketId,body:"PRIVATE-NOTE-MARKER",internalOnly:"on"},adminCookie)).response.status,200);
  assert.ok(!(await(await get(`/area-riservata/pratiche/${ticketId}`,citizenCookie)).text()).includes("PRIVATE-NOTE-MARKER"));assert.ok((await(await get(`/professionista/pratiche/${ticketId}`,professionalCookie)).text()).includes("PRIVATE-NOTE-MARKER"));checks++;
  assert.equal((await post("/api/portal/message",{ticketId,body:"Riscontro pubblico"},professionalCookie)).response.status,200);checks++;
  const document=new File(["%PDF-1.7\nTest document"],"test.pdf",{type:"application/pdf"});assert.equal((await post("/api/portal/upload",{ticketId,file:document},citizenCookie)).response.status,200);
  const attachment=await client.ticketAttachment.findFirstOrThrow({where:{ticketId}});assert.equal((await get(`/api/allegati/${attachment.id}`,business.cookie)).status,404);assert.equal((await get(`/api/allegati/${attachment.id}`)).status,401);
  const authorizedDownload=await get(`/api/allegati/${attachment.id}`,citizenCookie);assert.equal(authorizedDownload.status,302);assert.ok((await(await fetch(authorizedDownload.headers.get("location")!)).text()).includes("Test document"));checks++;
  assert.equal((await post("/api/portal/upload",{ticketId,file:new File(["<html>bad"],"false.pdf",{type:"application/pdf"})},citizenCookie)).response.status,400);checks++;
  assert.equal((await post("/api/portal/priority",{ticketId,priority:"URGENT"},professionalCookie)).response.status,403);assert.equal((await post("/api/portal/assign",{ticketId,professionalId:""},professionalCookie)).response.status,403);checks++;
  assert.equal((await post("/api/portal/status",{ticketId,status:"RESOLVED"},professionalCookie)).response.status,200);assert.equal((await post("/api/portal/status",{ticketId,status:"CLOSED"},professionalCookie)).response.status,403);assert.equal((await post("/api/portal/status",{ticketId,status:"CLOSED"},adminCookie)).response.status,200);checks++;
  assert.equal((await post("/api/portal/message",{ticketId,body:"Closed case"},citizenCookie)).response.status,400);checks++;
  assert.equal((await post("/api/portal/status",{ticketId,status:"UNDER_REVIEW"},adminCookie)).response.status,200);checks++;
  assert.equal((await post("/api/portal/message",{ticketId,body:"No longer assigned"},professionalCookie)).response.status,404);assert.equal((await get(`/api/allegati/${attachment.id}`,professionalCookie)).status,404);checks++;
  assert.equal((await post("/api/portal/toggle-professional",{userId:professional.id,enabled:"false"},adminCookie)).response.status,200);assert.equal((await post("/api/portal/message",{ticketId,body:"Disabled"},professionalCookie)).response.status,401);assert.equal((await post("/api/auth/login",{email:"professional@example.invalid",password})).response.status,401);checks++;
  const before=messages.length;assert.equal((await post("/api/auth/forgot",{email:registration.email})).response.status,200);assert.ok(messages.length>before);
  const resetToken=mailToken(messages.at(-1)!);assert.ok(resetToken);
  const nextPassword=randomBytes(24).toString("hex");assert.equal((await post("/api/auth/reset",{token:resetToken!,password:nextPassword})).response.status,200);assert.equal((await post("/api/auth/reset",{token:resetToken!,password:nextPassword})).response.status,400);assert.equal((await post("/api/portal/message",{ticketId,body:"Old session"},citizenCookie)).response.status,401);checks++;
  assert.equal((await post("/api/auth/login",{email:registration.email,password})).response.status,401);assert.equal((await post("/api/auth/login",{email:registration.email,password:nextPassword})).response.status,200);checks++;
  assert.equal((await post("/api/portal/create-professional",{email:"invited@example.invalid",firstName:"Invited",lastName:"Test",profession:"Esperto"},adminCookie)).response.status,200);const invited=await client.user.findUniqueOrThrow({where:{email:"invited@example.invalid"},include:{professionalProfile:true}});assert.equal(invited.role,"PROFESSIONAL");assert.equal(invited.professionalProfile?.enabled,false);assert.equal(invited.passwordHash,null);checks++;
  const inviteToken=mailToken(messages.at(-1)!);assert.ok(inviteToken);assert.equal((await post("/api/auth/reset",{token:inviteToken!,password})).response.status,200);assert.equal((await post("/api/auth/login",{email:invited.email,password})).response.status,401);assert.equal((await post("/api/portal/toggle-professional",{userId:invited.id,enabled:"true"},adminCookie)).response.status,200);assert.equal((await post("/api/auth/login",{email:invited.email,password})).response.status,200);checks++;
  const currentCitizen=await post("/api/auth/login",{email:registration.email,password:nextPassword});assert.equal(currentCitizen.response.status,200);await client.session.updateMany({where:{userId:citizen.id},data:{expires:new Date(Date.now()-1000)}});assert.equal((await post("/api/portal/message",{ticketId,body:"Expired session"},currentCitizen.cookie)).response.status,401);checks++;
  assert.ok([307,308].includes((await get("/api/auth/google/callback?state=invalid&code=invalid")).status));checks++;
  for(let i=0;i<10;i++)assert.equal((await post("/api/auth/login",{email:"nonexistent@example.invalid",password})).response.status,401);assert.equal((await post("/api/auth/login",{email:"nonexistent@example.invalid",password})).response.status,429);checks++;
  const logs=await client.ticketEvent.findMany({where:{ticketId}});assert.ok(logs.some(e=>e.type==="CREATED"));assert.ok(logs.some(e=>e.type==="ASSIGNED"));assert.ok(logs.some(e=>e.type==="CLOSED"));assert.ok(logs.some(e=>e.type==="REOPENED"));checks++;
  assert.equal((await post("/api/auth/logout",{},adminCookie)).response.status,200);assert.equal((await post("/api/portal/message",{ticketId,body:"Logged out"},adminCookie)).response.status,401);checks++;
  ticket=await client.ticket.findUniqueOrThrow({where:{id:ticketId}});assert.equal(ticket.requesterId,citizen.id);assert.ok(admin.id!==citizen.id);
  console.log(`${checks} integration checks passed: routes, roles, workflow, private notes, storage, recovery, invitations and rate limits.`);
} finally {
  app.kill("SIGTERM");await once(app,"exit").catch(()=>undefined);
  await client.$disconnect();await pgServer.stop();await database.close();await new Promise<void>(resolve=>smtp.close(resolve));await new Promise<void>(resolve=>s3.close(()=>resolve()));
}
