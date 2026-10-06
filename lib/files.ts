export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export function validatedFile(name: string, type: string, bytes: Uint8Array) {
  if (!bytes.length || bytes.length > MAX_FILE_BYTES) throw new Error("Dimensione non valida: massimo 10 MB.");
  const head = Buffer.from(bytes.subarray(0, 16));
  const extension = name.toLowerCase().split(".").pop();
  const valid = (extension === "pdf" && type === "application/pdf" && head.subarray(0,5).toString() === "%PDF-") ||
    (["jpg", "jpeg"].includes(extension || "") && type === "image/jpeg" && head[0] === 255 && head[1] === 216 && head[2] === 255) ||
    (extension === "png" && type === "image/png" && head.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  if (!valid) throw new Error("Sono ammessi PDF, JPEG e PNG con contenuto e formato corrispondenti.");
  return name.replace(/[\x00-\x1f\x7f/\\]/g, "_").slice(0,180) || "documento";
}
