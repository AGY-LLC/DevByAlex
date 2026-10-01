import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  ListPartsCommand,
  PutObjectCommand,
  UploadPartCommand,
  type HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { statePath } from "./config.ts";
import { classifyAwsError, EXIT, MediaError } from "./errors.ts";
import { compositeSha256, digestFile, hexToBase64, partDigests } from "./hash.ts";
import { mimeFor } from "./media-info.ts";
import type { Storage } from "./s3.ts";
import { readJson, removeFile, writeJsonAtomic } from "./state.ts";

const MiB = 1024 * 1024;

/** A stable reference to one stored object version. Never a URL. */
export interface ObjectRef {
  bucket: string;
  key: string;
  versionId: string | null;
  size: number;
  sha256: string;
  /** S3's own checksum as returned by HeadObject: a full-object SHA-256, or
   *  a COMPOSITE one ("<b64>-<parts>") for multipart objects. */
  s3ChecksumSha256: string | null;
  contentType: string;
}

export interface VerifiedRef extends ObjectRef {
  verifiedAt: string;
  /** What the verification compared: S3's checksum against our local
   *  computation, and/or a full re-download hash. */
  verifiedBy: Array<"s3-checksum" | "metadata-sha256" | "size" | "download-sha256">;
}

export interface HeadResult {
  size: number;
  versionId: string | null;
  sha256: string | null;
  s3ChecksumSha256: string | null;
  contentType: string | null;
  /** Part size of a multipart upload made by this toolkit (metadata). */
  partSize: number | null;
}

const isNotFound = (e: unknown) => {
  const x = e as { name?: string; $metadata?: { httpStatusCode?: number } };
  return x?.name === "NotFound" || x?.name === "NoSuchKey" || x?.$metadata?.httpStatusCode === 404;
};

export async function head(storage: Storage, key: string, versionId?: string | null): Promise<HeadResult | null> {
  let r: HeadObjectCommandOutput;
  try {
    r = await storage.s3.send(
      new HeadObjectCommand({ Bucket: storage.bucket, Key: key, ChecksumMode: "ENABLED", ...(versionId ? { VersionId: versionId } : {}) }),
    );
  } catch (e) {
    if (isNotFound(e)) return null;
    throw classifyAwsError(e, `Read metadata of ${key}`);
  }
  return {
    size: Number(r.ContentLength ?? 0),
    versionId: r.VersionId && r.VersionId !== "null" ? r.VersionId : null,
    sha256: r.Metadata?.sha256 ?? null,
    s3ChecksumSha256: r.ChecksumSHA256 ?? null,
    contentType: r.ContentType ?? null,
    partSize: r.Metadata?.partsize ? Number(r.Metadata.partsize) : null,
  };
}

// ── upload ───────────────────────────────────────────────────────────────────

interface MultipartState {
  schema: "devbyalex.media-multipart/1";
  bucket: string;
  key: string;
  uploadId: string;
  partSize: number;
  size: number;
  sha256: string;
  mtimeMs: number;
  startedAt: string;
  parts: Record<string, { etag: string; checksumSha256: string }>;
}

const transferStatePath = (storage: Storage, bucket: string, key: string) =>
  statePath(storage.cfg, "transfers", `${createHash("sha256").update(`${bucket}\n${key}`).digest("hex").slice(0, 32)}.json`);

export interface UploadOptions {
  contentType?: string;
  /** Extra user metadata (lowercase keys). sha256 is always set. */
  metadata?: Record<string, string>;
  onProgress?: (done: number, total: number) => void;
}

export interface UploadResult extends VerifiedRef {
  outcome: "uploaded" | "already-present" | "resumed";
}

/** Upload one file to one key, conditionally (never overwriting a different
 *  object), then verify it. Re-running with the same file and key is a no-op
 *  that re-verifies; a different file at an occupied key is a conflict.
 *  Large files go multipart with their progress persisted after every part,
 *  so a killed process resumes where it stopped. */
export async function upload(storage: Storage, localPath: string, key: string, opts: UploadOptions = {}): Promise<UploadResult> {
  if (!existsSync(localPath)) throw new MediaError(EXIT.missingInput, `No such file: ${localPath}`);
  const local = await digestFile(localPath);
  const contentType = opts.contentType ?? mimeFor(localPath);
  const metadata = { ...(opts.metadata ?? {}), sha256: local.sha256 };
  const { multipartThresholdMiB, partSizeMiB } = storage.cfg.transfer;

  const existing = await head(storage, key);
  if (existing) {
    if (existing.sha256 === local.sha256 && existing.size === local.size) {
      const v = await verifyStored(storage, localPath, key, existing.versionId, { size: local.size, sha256: local.sha256 });
      return { ...v, outcome: "already-present" };
    }
    throw new MediaError(
      EXIT.conflict,
      `${key} already holds different content (sha256 ${existing.sha256 ?? "unknown"}, local ${local.sha256}). Nothing was overwritten; choose a new key or a new run.`,
      { key, existingSha256: existing.sha256, localSha256: local.sha256 },
    );
  }

  let outcome: UploadResult["outcome"] = "uploaded";
  if (local.size <= multipartThresholdMiB * MiB) {
    await putSingle(storage, localPath, key, local, contentType, metadata);
  } else {
    outcome = await putMultipart(storage, localPath, key, local, contentType, metadata, partSizeMiB * MiB, opts.onProgress);
  }
  const v = await verifyStored(storage, localPath, key, null, { size: local.size, sha256: local.sha256 });
  return { ...v, outcome };
}

const isPreconditionFailed = (e: unknown) => {
  const x = e as { name?: string; $metadata?: { httpStatusCode?: number } };
  return x?.name === "PreconditionFailed" || x?.$metadata?.httpStatusCode === 412;
};

/** Another writer created the key between our HEAD and our write. Same bytes
 *  is fine (a concurrent retry of the same logical output); anything else is a
 *  conflict. */
async function raced(storage: Storage, key: string, sha256: string): Promise<void> {
  const now = await head(storage, key);
  if (now?.sha256 === sha256) return;
  throw new MediaError(EXIT.conflict, `${key} was written concurrently with different content; nothing was overwritten.`);
}

async function putSingle(
  storage: Storage,
  path: string,
  key: string,
  local: { size: number; sha256: string },
  contentType: string,
  metadata: Record<string, string>,
): Promise<void> {
  try {
    await storage.s3.send(
      new PutObjectCommand({
        Bucket: storage.bucket,
        Key: key,
        Body: createReadStream(path),
        ContentLength: local.size,
        ContentType: contentType,
        Metadata: metadata,
        ChecksumAlgorithm: "SHA256",
        ChecksumSHA256: hexToBase64(local.sha256),
        IfNoneMatch: "*",
      }),
    );
  } catch (e) {
    if (isPreconditionFailed(e)) return raced(storage, key, local.sha256);
    throw classifyAwsError(e, `Upload ${key}`);
  }
}

async function putMultipart(
  storage: Storage,
  path: string,
  key: string,
  local: { size: number; sha256: string },
  contentType: string,
  metadata: Record<string, string>,
  partSize: number,
  onProgress?: (done: number, total: number) => void,
): Promise<"uploaded" | "resumed"> {
  const statePathFor = transferStatePath(storage, storage.bucket, key);
  const mtimeMs = statSync(path).mtimeMs;
  let state = readJson<MultipartState>(statePathFor);
  let resumed = false;

  if (state && (state.sha256 !== local.sha256 || state.size !== local.size || state.partSize !== partSize)) {
    // The file changed since the interrupted attempt: that upload can never
    // complete with these bytes. Start fresh; lifecycle rules reap the orphan.
    state = undefined;
  }
  if (state) {
    try {
      const remote = await listAllParts(storage, key, state.uploadId);
      state.parts = Object.fromEntries(remote.map((p) => [String(p.n), { etag: p.etag, checksumSha256: p.checksumSha256 }]));
      resumed = true;
    } catch (e) {
      const name = (e as { name?: string }).name;
      if (name !== "NoSuchUpload" && (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 404) {
        throw classifyAwsError(e, `Resume upload of ${key}`);
      }
      state = undefined; // aborted or expired: begin again
    }
  }
  if (!state) {
    try {
      const r = await storage.s3.send(
        new CreateMultipartUploadCommand({
          Bucket: storage.bucket,
          Key: key,
          ContentType: contentType,
          Metadata: { ...metadata, partsize: String(partSize) },
          ChecksumAlgorithm: "SHA256",
        }),
      );
      state = {
        schema: "devbyalex.media-multipart/1",
        bucket: storage.bucket,
        key,
        uploadId: r.UploadId!,
        partSize,
        size: local.size,
        sha256: local.sha256,
        mtimeMs,
        startedAt: new Date().toISOString(),
        parts: {},
      };
      writeJsonAtomic(statePathFor, state);
    } catch (e) {
      throw classifyAwsError(e, `Start upload of ${key}`);
    }
  }

  const digests = await partDigests(path, partSize);
  const total = digests.length;
  const s = state;
  // A part S3 already holds is kept only if its checksum matches our bytes.
  for (const [n, p] of Object.entries(s.parts)) {
    if (p.checksumSha256 !== digests[Number(n) - 1]?.toString("base64")) delete s.parts[n];
  }
  const todo = digests.map((_, i) => i + 1).filter((n) => !s.parts[String(n)]);
  let done = total - todo.length;
  onProgress?.(done, total);
  const delay = Number(process.env.MEDIA_TEST_PART_DELAY_MS ?? 0); // test hook: widen the kill window

  const worker = async () => {
    for (let n = todo.shift(); n !== undefined; n = todo.shift()) {
      const start = (n - 1) * partSize;
      const end = Math.min(start + partSize, local.size);
      const checksum = digests[n - 1].toString("base64");
      if (delay) await new Promise((r) => setTimeout(r, delay));
      try {
        const r = await storage.s3.send(
          new UploadPartCommand({
            Bucket: storage.bucket,
            Key: key,
            UploadId: s.uploadId,
            PartNumber: n,
            Body: createReadStream(path, { start, end: end - 1 }),
            ContentLength: end - start,
            ChecksumAlgorithm: "SHA256",
            ChecksumSHA256: checksum,
          }),
        );
        s.parts[String(n)] = { etag: r.ETag!, checksumSha256: r.ChecksumSHA256 ?? checksum };
        writeJsonAtomic(statePathFor, s); // progress survives a crash
        onProgress?.(++done, total);
      } catch (e) {
        throw classifyAwsError(e, `Upload part ${n}/${total} of ${key}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(storage.cfg.transfer.concurrency, Math.max(todo.length, 1)) }, worker));

  try {
    await storage.s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: storage.bucket,
        Key: key,
        UploadId: s.uploadId,
        MultipartUpload: {
          Parts: digests.map((_, i) => ({ PartNumber: i + 1, ETag: s.parts[String(i + 1)].etag, ChecksumSHA256: s.parts[String(i + 1)].checksumSha256 })),
        },
        IfNoneMatch: "*",
      }),
    );
  } catch (e) {
    if (isPreconditionFailed(e)) {
      await raced(storage, key, local.sha256);
      removeFile(statePathFor);
      return resumed ? "resumed" : "uploaded";
    }
    throw classifyAwsError(e, `Complete upload of ${key}`);
  }
  removeFile(statePathFor);
  return resumed ? "resumed" : "uploaded";
}

async function listAllParts(storage: Storage, key: string, uploadId: string) {
  const out: { n: number; etag: string; checksumSha256: string }[] = [];
  let marker: string | undefined;
  for (;;) {
    const r = await storage.s3.send(
      new ListPartsCommand({ Bucket: storage.bucket, Key: key, UploadId: uploadId, ...(marker ? { PartNumberMarker: marker } : {}) }),
    );
    for (const p of r.Parts ?? []) out.push({ n: p.PartNumber!, etag: p.ETag!, checksumSha256: p.ChecksumSHA256 ?? "" });
    if (!r.IsTruncated) return out;
    marker = r.NextPartNumberMarker;
  }
}

// ── verification ─────────────────────────────────────────────────────────────

/** Verify the stored object against what we hashed locally. The strong check
 *  is S3's own SHA-256 (full or composite), which S3 computed from the bytes it
 *  received; we recompute the same value from the local file. When the store
 *  returns no checksum (some S3-compatible servers), `deep` re-downloads and
 *  hashes instead; without either, verification fails rather than guessing. */
export async function verifyStored(
  storage: Storage,
  localPath: string | null,
  key: string,
  versionId: string | null,
  expected: { size: number; sha256: string },
  { deep = false }: { deep?: boolean } = {},
): Promise<VerifiedRef> {
  const h = await head(storage, key, versionId);
  if (!h) throw new MediaError(EXIT.verification, `${key}${versionId ? `@${versionId}` : ""} is not in the bucket.`);
  const by: VerifiedRef["verifiedBy"] = [];
  const fail = (what: string) => {
    throw new MediaError(EXIT.verification, `${key}: ${what}. The stored object does not match; it is not marked verified.`);
  };
  if (h.size !== expected.size) fail(`size ${h.size}, expected ${expected.size}`);
  by.push("size");
  if (h.sha256 !== null) {
    if (h.sha256 !== expected.sha256) fail(`metadata sha256 ${h.sha256}, expected ${expected.sha256}`);
    by.push("metadata-sha256");
  }
  let recordedChecksum = h.s3ChecksumSha256;
  if (h.s3ChecksumSha256) {
    // A multipart object (this toolkit records its part size) carries S3's
    // COMPOSITE checksum, "<b64>-<parts>"; some S3-compatible servers omit the
    // "-<parts>" suffix. A single-part object carries the full-object SHA-256.
    let want: string;
    let got = h.s3ChecksumSha256;
    if (h.partSize) {
      if (!localPath) fail("composite checksum needs the local file to recompute");
      const parts = await partDigests(localPath!, h.partSize);
      want = compositeSha256(parts);
      if (!/-\d+$/.test(got)) got = `${got}-${parts.length}`;
    } else {
      if (/-\d+$/.test(got)) fail("multipart object without a recorded part size (not uploaded by this toolkit); use --deep");
      want = hexToBase64(expected.sha256);
    }
    if (got !== want) fail(`S3 checksum ${h.s3ChecksumSha256}, expected ${want}`);
    recordedChecksum = got;
    by.push("s3-checksum");
  }
  if (deep || !by.includes("s3-checksum")) {
    const got = await hashRemote(storage, key, h.versionId);
    if (got !== expected.sha256) fail(`downloaded sha256 ${got}, expected ${expected.sha256}`);
    by.push("download-sha256");
  }
  return {
    bucket: storage.bucket,
    key,
    versionId: h.versionId,
    size: h.size,
    sha256: expected.sha256,
    s3ChecksumSha256: recordedChecksum,
    contentType: h.contentType ?? "application/octet-stream",
    verifiedAt: new Date().toISOString(),
    verifiedBy: by,
  };
}

async function hashRemote(storage: Storage, key: string, versionId: string | null): Promise<string> {
  try {
    const r = await storage.s3.send(new GetObjectCommand({ Bucket: storage.bucket, Key: key, ...(versionId ? { VersionId: versionId } : {}) }));
    const h = createHash("sha256");
    for await (const chunk of r.Body as Readable) h.update(chunk as Buffer);
    return h.digest("hex");
  } catch (e) {
    throw classifyAwsError(e, `Download ${key} for verification`);
  }
}

// ── download ─────────────────────────────────────────────────────────────────

/** Download one pinned version to `dest`, verifying its SHA-256 before the
 *  file appears at `dest`. An interrupted download resumes from its `.part`
 *  file with a ranged GET of the SAME version, so bytes never mix versions. */
export async function download(
  storage: Storage,
  key: string,
  versionId: string | null,
  dest: string,
  expectedSha256: string | null,
): Promise<{ size: number; sha256: string; versionId: string | null }> {
  const h = await head(storage, key, versionId);
  if (!h) throw new MediaError(EXIT.missingInput, `${key}${versionId ? `@${versionId}` : ""} is not in the bucket.`);
  const want = expectedSha256 ?? h.sha256;
  const pinned = versionId ?? h.versionId;
  mkdirSync(dirname(dest), { recursive: true });
  const part = `${dest}.part`;
  const hasher = createHash("sha256");
  let offset = 0;
  if (existsSync(part)) {
    offset = statSync(part).size;
    if (offset > h.size) offset = 0;
    else for await (const c of createReadStream(part)) hasher.update(c as Buffer);
  }
  if (offset < h.size) {
    try {
      const r = await storage.s3.send(
        new GetObjectCommand({
          Bucket: storage.bucket,
          Key: key,
          ...(pinned ? { VersionId: pinned } : {}),
          ...(offset ? { Range: `bytes=${offset}-` } : {}),
        }),
      );
      const body = r.Body as Readable;
      body.on("data", (c: Buffer) => hasher.update(c));
      await pipeline(body, createWriteStream(part, { flags: offset ? "a" : "w" }));
    } catch (e) {
      throw classifyAwsError(e, `Download ${key}`);
    }
  }
  const sha256 = hasher.digest("hex");
  const size = statSync(part).size;
  if (size !== h.size || (want && sha256 !== want)) {
    removeFile(part);
    throw new MediaError(EXIT.verification, `Downloaded ${key} does not match (sha256 ${sha256}, expected ${want ?? "n/a"}); the partial file was discarded.`);
  }
  renameSync(part, dest);
  return { size, sha256, versionId: pinned };
}

// ── listing ──────────────────────────────────────────────────────────────────

export interface Listed {
  key: string;
  size: number;
  lastModified: string | null;
  versionId?: string | null;
  isLatest?: boolean;
}

export async function list(storage: Storage, prefix: string, { versions = false, limit = 1000 } = {}): Promise<Listed[]> {
  const out: Listed[] = [];
  try {
    if (versions) {
      let keyMarker: string | undefined;
      let versionMarker: string | undefined;
      do {
        const r = await storage.s3.send(
          new ListObjectVersionsCommand({ Bucket: storage.bucket, Prefix: prefix, KeyMarker: keyMarker, VersionIdMarker: versionMarker }),
        );
        for (const v of r.Versions ?? []) {
          out.push({ key: v.Key!, size: Number(v.Size ?? 0), lastModified: v.LastModified?.toISOString() ?? null, versionId: v.VersionId ?? null, isLatest: v.IsLatest ?? false });
        }
        keyMarker = r.IsTruncated ? r.NextKeyMarker : undefined;
        versionMarker = r.IsTruncated ? r.NextVersionIdMarker : undefined;
      } while (keyMarker && out.length < limit);
    } else {
      let token: string | undefined;
      do {
        const r = await storage.s3.send(new ListObjectsV2Command({ Bucket: storage.bucket, Prefix: prefix, ContinuationToken: token }));
        for (const o of r.Contents ?? []) out.push({ key: o.Key!, size: Number(o.Size ?? 0), lastModified: o.LastModified?.toISOString() ?? null });
        token = r.IsTruncated ? r.NextContinuationToken : undefined;
      } while (token && out.length < limit);
    }
  } catch (e) {
    throw classifyAwsError(e, `List ${prefix}`);
  }
  return out.slice(0, limit);
}
