import { createHash } from "node:crypto";
import { createReadStream, statSync } from "node:fs";

export interface FileDigest {
  size: number;
  sha256: string; // hex
}

/** Stream a file once, returning its size and SHA-256. */
export async function digestFile(path: string): Promise<FileDigest> {
  const h = createHash("sha256");
  let size = 0;
  for await (const chunk of createReadStream(path)) {
    h.update(chunk as Buffer);
    size += (chunk as Buffer).length;
  }
  return { size, sha256: h.digest("hex") };
}

/** SHA-256 of each `partSize` slice of the file, as raw digests. These are
 *  what S3 validates per UploadPart (x-amz-checksum-sha256), and what its
 *  composite object checksum is built from. */
export async function partDigests(path: string, partSize: number): Promise<Buffer[]> {
  const total = statSync(path).size;
  const out: Buffer[] = [];
  for (let start = 0; start < total; start += partSize) {
    const h = createHash("sha256");
    for await (const chunk of createReadStream(path, { start, end: Math.min(start + partSize, total) - 1 })) h.update(chunk as Buffer);
    out.push(h.digest());
  }
  return out;
}

/** S3's COMPOSITE SHA-256 for a multipart object: base64(sha256(concat(part
 *  digests))) + "-" + part count. Matching it proves S3 holds exactly the
 *  bytes we hashed, without downloading them again. (An ETag is NOT a content
 *  hash for multipart objects and is never used as one.) */
export function compositeSha256(parts: Buffer[]): string {
  return `${createHash("sha256").update(Buffer.concat(parts)).digest("base64")}-${parts.length}`;
}

export const hexToBase64 = (hex: string) => Buffer.from(hex, "hex").toString("base64");
export const base64ToHex = (b64: string) => Buffer.from(b64, "base64").toString("hex");
