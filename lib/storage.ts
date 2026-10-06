import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export function storageConfigured() { return !!(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY); }
function storage() {
  if (!storageConfigured()) throw new Error("Storage non configurato.");
  return new S3Client({ region: process.env.S3_REGION || "auto", endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! } });
}
export async function upload(key: string, bytes: Uint8Array, type: string) {
  await storage().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: bytes, ContentType: type }));
}
export async function remove(key: string) { await storage().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key })); }
export async function download(key: string, name: string) {
  return getSignedUrl(storage(), new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, ResponseContentType: "application/octet-stream", ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(name)}` }), { expiresIn: 60 });
}
