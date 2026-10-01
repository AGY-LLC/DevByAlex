import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { validateConfig } from "../src/lib/config.ts";
import { EXIT, MediaError } from "../src/lib/errors.ts";
import { compositeSha256, digestFile, partDigests } from "../src/lib/hash.ts";
import { assertRunId, assertWritable, newRunId, parseKey, projectKey, runKey } from "../src/lib/keys.ts";

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as MediaError).code;
  }
  return EXIT.ok;
};

export const baseConfig = () => ({
  schema: "devbyalex.media-config/1",
  project: "nisatsu",
  repository: "AGY-LLC/nisatsu",
  storage: { bucket: "agyllc-marketing", region: "us-east-1", accountId: "123456789012", prefix: "nisatsu" },
  defaultEnvironment: "local",
  environments: { local: { access: "operator", profile: "agy-media" }, worker: { access: "worker", roleArn: "arn:aws:iam::123456789012:role/x" } },
  stateDir: ".media",
  transfer: { multipartThresholdMiB: 64, partSizeMiB: 16, concurrency: 4, maxAttempts: 5 },
  dependencies: [],
});

test("filing policy: project areas map under the project prefix", () => {
  assert.equal(projectKey("nisatsu", "captures/promo/reading.mp4"), "nisatsu/captures/promo/reading.mp4");
  assert.equal(projectKey("nisatsu", "campaigns/launch/working/script.md"), "nisatsu/campaigns/launch/working/script.md");
  assert.equal(projectKey("nisatsu", "brand/logo.png"), "nisatsu/brand/logo.png");
  assert.equal(parseKey("nisatsu", "nisatsu/campaigns/launch/exports/ad-v1.mp4").area, "exports");
});

test("filing policy: shared/ is bucket-wide and readable from any project", () => {
  assert.equal(projectKey("nisatsu", "shared/fonts/NotoSansJP.ttf"), "shared/fonts/NotoSansJP.ttf");
  assert.equal(parseKey("nisatsu", "shared/fonts/NotoSansJP.ttf").area, "shared");
});

test("filing policy: anything outside the areas, traversal, or another project is refused", () => {
  for (const bad of ["misc/x.mp4", "captures/../brand/x", "captures//x", "campaigns/Launch/working/x", "campaigns/launch/drafts/x", "runs/notarun/x", "captures/"]) {
    assert.equal(code(() => projectKey("nisatsu", bad)), EXIT.usage, bad);
  }
  assert.equal(code(() => parseKey("nisatsu", "otherapp/captures/x.mp4")), EXIT.usage);
});

test("run ids: UTC date plus random id, unique, validated", () => {
  const a = newRunId(new Date("2026-10-01T23:59:59Z"));
  assert.match(a, /^2026-10-01-[0-9a-f]{10}$/);
  assert.notEqual(a, newRunId(new Date("2026-10-01T23:59:59Z")));
  assert.match(newRunId(new Date("2026-10-01T00:00:00Z"), "Ad Kinetic"), /^2026-10-01-[0-9a-f]{10}-ad-kinetic$/);
  assert.equal(code(() => assertRunId("2026-13-45-abcdef")), EXIT.usage);
  assert.equal(code(() => assertRunId("20261001-abcdef")), EXIT.usage);
  assert.equal(runKey("nisatsu", "2026-10-01-abcdef1234", "out.mp4"), "nisatsu/runs/2026-10-01-abcdef1234/out.mp4");
});

test("permissions: workers write runs only; nobody pushes straight to exports", () => {
  const key = (rel: string) => parseKey("nisatsu", projectKey("nisatsu", rel));
  assert.equal(code(() => assertWritable("worker", key("runs/2026-10-01-abcdef/x.mp4"))), EXIT.ok);
  assert.equal(code(() => assertWritable("worker", key("captures/x.mp4"))), EXIT.denied);
  assert.equal(code(() => assertWritable("worker", key("shared/x.mp4"))), EXIT.denied);
  assert.equal(code(() => assertWritable("reader", key("runs/2026-10-01-abcdef/x.mp4"))), EXIT.denied);
  assert.equal(code(() => assertWritable("operator", key("captures/x.mp4"))), EXIT.ok);
  assert.equal(code(() => assertWritable("operator", key("campaigns/launch/exports/x.mp4"))), EXIT.notApproved);
  assert.equal(code(() => assertWritable("operator", key("campaigns/launch/exports/x.mp4"), "promote")), EXIT.ok);
  assert.equal(code(() => assertWritable("worker", key("campaigns/launch/exports/x.mp4"), "promote")), EXIT.denied);
});

test("config: a valid config passes; every problem is reported at once", () => {
  validateConfig(baseConfig());
  const bad = { ...baseConfig(), project: "Nisatsu", storage: { bucket: "Bad_Bucket", region: "mars", accountId: "12", prefix: "shared" }, stateDir: "/abs" };
  assert.throws(() => validateConfig(bad), (e: MediaError) => e.code === EXIT.usage && /project/.test(e.message) && /bucket/.test(e.message) && /region/.test(e.message) && /accountId/.test(e.message) && /"shared"/.test(e.message) && /stateDir/.test(e.message));
});

test("config: static keys may not reuse AWS_* names (they would pick up an app's own keys)", () => {
  const c = baseConfig();
  (c.environments as Record<string, unknown>).ci = { access: "worker", accessKeyIdEnv: "AWS_ACCESS_KEY_ID", secretAccessKeyEnv: "AWS_SECRET_ACCESS_KEY" };
  assert.throws(() => validateConfig(c), /AWS_\* name/);
});

test("config: transfer sizes must be S3-legal", () => {
  const c = baseConfig();
  c.transfer.partSizeMiB = 4;
  assert.throws(() => validateConfig(c), /partSizeMiB >= 5/);
});

test("hashing: streamed sha256 matches a one-shot hash; composite matches S3's definition", async () => {
  const dir = mkdtempSync(join(tmpdir(), "media-unit-"));
  const f = join(dir, "x.bin");
  const body = Buffer.alloc(11 * 1024 * 1024 + 7, 0x5a);
  writeFileSync(f, body);
  const d = await digestFile(f);
  assert.equal(d.size, body.length);
  assert.equal(d.sha256, createHash("sha256").update(body).digest("hex"));
  const parts = await partDigests(f, 5 * 1024 * 1024);
  assert.equal(parts.length, 3);
  const manual = [body.subarray(0, 5 << 20), body.subarray(5 << 20, 10 << 20), body.subarray(10 << 20)].map((b) => createHash("sha256").update(b).digest());
  assert.equal(compositeSha256(parts), `${createHash("sha256").update(Buffer.concat(manual)).digest("base64")}-3`);
});
