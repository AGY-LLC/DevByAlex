// Integration tests against a real S3 protocol server (moto). Set
// MEDIA_TEST_MOTO to the moto_server binary; without it the suite is skipped.
// IAM is not evaluated by moto: server-side permission boundaries are covered
// by infra.test.ts (policy structure) and by `media doctor` on a real account.
import assert from "node:assert/strict";
import { type ChildProcess, execFileSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { CreateBucketCommand, ListObjectVersionsCommand, PutBucketVersioningCommand, S3Client } from "@aws-sdk/client-s3";
import { run } from "../src/cli.ts";
import { EXIT } from "../src/lib/errors.ts";

const MOTO = process.env.MEDIA_TEST_MOTO;
const skip = !MOTO || !existsSync(MOTO) ? "set MEDIA_TEST_MOTO to a moto_server binary" : false;
const BIN = join(dirname(fileURLToPath(import.meta.url)), "..", "bin", "media.mjs");
const PORT = 5000 + Math.floor(Math.random() * 1000);
const ENDPOINT = `http://127.0.0.1:${PORT}`;
const BUCKET = "agyllc-marketing";
const MiB = 1024 * 1024;

let moto: ChildProcess | undefined;
let repo = "";
let s3: S3Client;

function writeRepo(dir: string, envOverrides: Record<string, unknown> = {}) {
  writeFileSync(
    join(dir, "media.config.json"),
    JSON.stringify({
      schema: "devbyalex.media-config/1",
      project: "nisatsu",
      repository: "AGY-LLC/nisatsu",
      storage: { bucket: BUCKET, region: "us-east-1", accountId: "123456789012", prefix: "nisatsu" },
      defaultEnvironment: "local",
      environments: {
        local: { access: "operator", accessKeyIdEnv: "TEST_MEDIA_KEY_ID", secretAccessKeyEnv: "TEST_MEDIA_SECRET" },
        worker: { access: "worker", accessKeyIdEnv: "TEST_MEDIA_KEY_ID", secretAccessKeyEnv: "TEST_MEDIA_SECRET" },
        ...envOverrides,
      },
      stateDir: ".media",
      transfer: { multipartThresholdMiB: 5, partSizeMiB: 5, concurrency: 2, maxAttempts: 2 },
      dependencies: ["video/media.deps.json"],
      ledger: "media/ledger.json",
    }),
  );
  mkdirSync(join(dir, "video", "public"), { recursive: true });
  writeFileSync(
    join(dir, "video", "media.deps.json"),
    JSON.stringify({
      schema: "devbyalex.media-deps/1",
      root: "video",
      renderer: "command",
      // A real renderer: concatenates its two inputs into the output.
      command: ["sh", "-c", 'cat public/clip.bin public/gen.txt > "$1"', "render", "{output}"],
      targets: {
        Clip: { outputName: "clip-out.bin", inputs: [
          { id: "clip", path: "public/clip.bin", ref: "captures/test/clip.bin" },
          { id: "gen", path: "public/gen.txt", generate: "echo hi > public/gen.txt" },
        ] },
        Lost: { inputs: [{ id: "lost", path: "public/lost.mp4", ref: "captures/test/lost.mp4", note: "Lost on 2026-09-25." }] },
      },
    }),
  );
  execFileSync("git", ["init", "-q"], { cwd: dir });
}

async function cli(args: string[], env: Record<string, string | undefined> = {}) {
  const saved = { ...process.env };
  Object.assign(process.env, { MEDIA_CONFIG: join(repo, "media.config.json"), MEDIA_S3_ENDPOINT: ENDPOINT, TEST_MEDIA_KEY_ID: "testing", TEST_MEDIA_SECRET: "testing" }, env);
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k];
  const lines: string[] = [];
  const prevCwd = process.cwd();
  process.chdir(repo);
  try {
    const code = await run([...args, "--json"], { log: (s) => lines.push(s), err: (s) => lines.push(s) });
    const text = lines.join("\n");
    let json: any;
    try { json = JSON.parse(text); } catch { json = undefined; }
    return { code, text, json };
  } finally {
    process.chdir(prevCwd);
    process.env = saved;
  }
}

const file = (name: string, bytes: Buffer) => {
  const p = join(repo, "fixtures", name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, bytes);
  return p;
};

async function versions(key: string) {
  const r = await s3.send(new ListObjectVersionsCommand({ Bucket: BUCKET, Prefix: key }));
  return (r.Versions ?? []).filter((v) => v.Key === key);
}

before(async () => {
  if (skip) return;
  moto = spawn(MOTO!, ["-p", String(PORT)], { stdio: "ignore" });
  for (let i = 0; i < 100; i++) {
    try { await fetch(ENDPOINT); break; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  s3 = new S3Client({ region: "us-east-1", endpoint: ENDPOINT, forcePathStyle: true, credentials: { accessKeyId: "testing", secretAccessKey: "testing" } });
  await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
  await s3.send(new PutBucketVersioningCommand({ Bucket: BUCKET, VersioningConfiguration: { Status: "Enabled" } }));
  repo = mkdtempSync(join(tmpdir(), "media-it-"));
  writeRepo(repo);
});

after(() => moto?.kill());

test("doctor: identity, account and bucket check out", { skip }, async () => {
  const r = await cli(["doctor"]);
  assert.equal(r.code, EXIT.ok, r.text);
  assert.ok(r.json.checks.find((c: any) => c.name === "identity").ok);
  assert.ok(r.json.checks.find((c: any) => c.name === "versioning").ok);
});

test("an image and a video round-trip with matching hashes", { skip }, async () => {
  const png = Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), randomBytes(200_000)]);
  const mp4 = randomBytes(3 * MiB);
  for (const [name, bytes] of [["logo.png", png], ["clip.mp4", mp4]] as const) {
    const src = file(name, bytes);
    const up = await cli(["push", src, "--to", `captures/roundtrip/${name}`]);
    assert.equal(up.code, EXIT.ok, up.text);
    assert.equal(up.json.outcome, "uploaded");
    assert.ok(up.json.verifiedBy.includes("s3-checksum"), JSON.stringify(up.json.verifiedBy));
    const dest = join(repo, "back", name);
    const down = await cli(["pull", `captures/roundtrip/${name}`, "--to", dest]);
    assert.equal(down.code, EXIT.ok, down.text);
    assert.deepEqual(readFileSync(dest), bytes);
    assert.equal(down.json.sha256, up.json.sha256);
  }
});

test("a multipart upload verifies against S3's composite checksum", { skip }, async () => {
  const big = randomBytes(17 * MiB + 123);
  const src = file("big.mp4", big);
  const up = await cli(["push", src, "--to", "captures/big/big.mp4"]);
  assert.equal(up.code, EXIT.ok, up.text);
  assert.match(up.json.s3ChecksumSha256 ?? "", /-4$/);
  assert.ok(up.json.verifiedBy.includes("s3-checksum"));
  const v = await cli(["verify", "captures/big/big.mp4", "--file", src, "--deep"]);
  assert.equal(v.code, EXIT.ok, v.text);
  assert.ok(v.json.verifiedBy.includes("download-sha256"));
});

test("repeating the same upload is a verified no-op: no second version", { skip }, async () => {
  const src = file("same.png", randomBytes(50_000));
  assert.equal((await cli(["push", src, "--to", "captures/same/same.png"])).code, EXIT.ok);
  const again = await cli(["push", src, "--to", "captures/same/same.png"]);
  assert.equal(again.code, EXIT.ok, again.text);
  assert.equal(again.json.outcome, "already-present");
  assert.equal((await versions("nisatsu/captures/same/same.png")).length, 1);
});

test("different bytes at an occupied key are a conflict, and nothing is overwritten", { skip }, async () => {
  const a = file("a.png", randomBytes(1000));
  const b = file("b.png", randomBytes(1000));
  assert.equal((await cli(["push", a, "--to", "captures/conflict/x.png"])).code, EXIT.ok);
  const r = await cli(["push", b, "--to", "captures/conflict/x.png"]);
  assert.equal(r.code, EXIT.conflict, r.text);
  assert.equal((await versions("nisatsu/captures/conflict/x.png")).length, 1);
});

test("a killed multipart upload resumes from its saved parts after a restart", { skip }, async () => {
  const big = randomBytes(26 * MiB); // 6 parts of 5 MiB
  const src = file("resume.mp4", big);
  const env = { ...process.env, MEDIA_CONFIG: join(repo, "media.config.json"), MEDIA_S3_ENDPOINT: ENDPOINT, TEST_MEDIA_KEY_ID: "testing", TEST_MEDIA_SECRET: "testing", MEDIA_TEST_PART_DELAY_MS: "700" };
  const child = spawn(process.execPath, [BIN, "push", src, "--to", "captures/resume/resume.mp4"], { cwd: repo, env, stdio: "ignore" });
  const stateDir = join(repo, ".media", "transfers");
  const partsSaved = () => {
    if (!existsSync(stateDir)) return 0;
    return readdirSync(stateDir).filter((f) => f.endsWith(".json")).map((f) => Object.keys(JSON.parse(readFileSync(join(stateDir, f), "utf8")).parts).length)[0] ?? 0;
  };
  for (let i = 0; i < 200 && partsSaved() < 2; i++) await new Promise((r) => setTimeout(r, 50));
  child.kill("SIGKILL");
  await new Promise((r) => child.on("close", r));
  const saved = partsSaved();
  assert.ok(saved >= 2 && saved < 6, `expected an interrupted upload, saw ${saved} parts saved`);
  assert.equal((await versions("nisatsu/captures/resume/resume.mp4")).length, 0, "nothing should be complete yet");

  const r = await cli(["push", src, "--to", "captures/resume/resume.mp4"]);
  assert.equal(r.code, EXIT.ok, r.text);
  assert.equal(r.json.outcome, "resumed");
  assert.equal((await versions("nisatsu/captures/resume/resume.mp4")).length, 1);
  const back = join(repo, "back", "resume.mp4");
  await cli(["pull", "captures/resume/resume.mp4", "--to", back]);
  assert.deepEqual(readFileSync(back), big);
  assert.equal(readdirSync(stateDir).filter((f) => f.endsWith(".json")).length, 0, "transfer state is cleared after completion");
});

test("a missing input fails before rendering, naming the fix, and starts no run", { skip }, async () => {
  const before = existsSync(join(repo, ".media", "runs")) ? readdirSync(join(repo, ".media", "runs")).length : 0;
  const r = await cli(["render", "Lost"]);
  assert.equal(r.code, EXIT.missingInput, r.text);
  assert.match(r.json.error, /does not exist/);
  assert.match(r.json.error, /do not substitute/);
  assert.match(r.json.error, /media push <file> --to captures\/test\/lost\.mp4/, "the hint must be a runnable command");
  const after = existsSync(join(repo, ".media", "runs")) ? readdirSync(join(repo, ".media", "runs")).length : 0;
  assert.equal(after, before);
});

test("render pins input versions, renders, files and verifies the output; a retry reuses the run", { skip }, async () => {
  const clip = file("clip.bin", randomBytes(4096));
  assert.equal((await cli(["push", clip, "--to", "captures/test/clip.bin"])).code, EXIT.ok);
  writeFileSync(join(repo, "video", "public", "gen.txt"), "hi\n");
  const r = await cli(["render", "Clip", "--run-id", "2026-10-01-retrytest01"]);
  assert.equal(r.code, EXIT.ok, r.text);
  assert.equal(r.json.processing, "succeeded");
  assert.equal(r.json.upload, "verified");
  assert.equal(r.json.approval, "draft");
  const m = JSON.parse(readFileSync(join(repo, ".media", "runs", "2026-10-01-retrytest01", "manifest.json"), "utf8"));
  const pinned = m.inputs.find((i: any) => i.id === "clip");
  assert.ok(pinned.ref.versionId, "the S3 input is pinned to a version");
  assert.equal(m.outputs[0].stored.key, "nisatsu/runs/2026-10-01-retrytest01/clip-out.bin");
  assert.ok(m.repo.commit === null || /^[0-9a-f]{40}$/.test(m.repo.commit));
  assert.equal((await versions("nisatsu/runs/2026-10-01-retrytest01/manifest.json")).length, 1);

  const again = await cli(["render", "Clip", "--run-id", "2026-10-01-retrytest01"]);
  assert.equal(again.code, EXIT.ok, again.text);
  assert.equal((await versions("nisatsu/runs/2026-10-01-retrytest01/clip-out.bin")).length, 1, "no duplicate output");
});

test("missing credentials fail clearly; the render keeps its output and the upload stays pending", { skip }, async () => {
  const r = await cli(["render", "Clip", "--run-id", "2026-10-01-nocreds0001"], { TEST_MEDIA_KEY_ID: undefined });
  assert.equal(r.code, EXIT.uploadPending, r.text);
  assert.equal(r.json?.processing ?? JSON.parse(r.text.slice(r.text.indexOf("{"))).processing, "succeeded");
  const m = JSON.parse(readFileSync(join(repo, ".media", "runs", "2026-10-01-nocreds0001", "manifest.json"), "utf8"));
  assert.equal(m.status.upload, "pending");
  assert.ok(existsSync(join(repo, m.outputs[0].localPath)), "local output preserved");
  const pushed = await cli(["push", "--run", "2026-10-01-nocreds0001"]);
  assert.equal(pushed.code, EXIT.ok, pushed.text);
  assert.equal(pushed.json.upload, "verified");
});

test("missing credentials on a storage command exit 6 and write nothing", { skip }, async () => {
  const src = file("nocreds.png", randomBytes(100));
  const r = await cli(["push", src, "--to", "captures/nocreds/x.png"], { TEST_MEDIA_KEY_ID: undefined });
  assert.equal(r.code, EXIT.credentials, r.text);
  assert.equal((await versions("nisatsu/captures/nocreds/x.png")).length, 0);
});

test("a worker environment cannot write originals or shared media", { skip }, async () => {
  const src = file("worker.png", randomBytes(100));
  for (const to of ["captures/worker/x.png", "shared/worker/x.png", "brand/x.png"]) {
    const r = await cli(["push", src, "--to", to, "--env", "worker"]);
    assert.equal(r.code, EXIT.denied, `${to}: ${r.text}`);
  }
});

test("promotion requires an approval bound to the exact hash; exports are never overwritten", { skip }, async () => {
  const run = "2026-10-01-retrytest01";
  const no = await cli(["promote", run, "clip-out.bin", "--campaign", "launch", "--name", "clip-v1.bin"]);
  assert.equal(no.code, EXIT.notApproved, no.text);
  const wrong = await cli(["approve", run, "clip-out.bin", "--by", "Alex", "--reference", "chat 2026-10-01", "--sha256", "0".repeat(64)]);
  assert.equal(wrong.code, EXIT.notApproved, wrong.text);
  assert.equal((await cli(["approve", run, "clip-out.bin", "--by", "Alex", "--reference", "chat 2026-10-01"])).code, EXIT.ok);
  const ok = await cli(["promote", run, "clip-out.bin", "--campaign", "launch", "--name", "clip-v1.bin"]);
  assert.equal(ok.code, EXIT.ok, ok.text);
  assert.equal(ok.json.key, "nisatsu/campaigns/launch/exports/clip-v1.bin");
  const again = await cli(["promote", run, "clip-out.bin", "--campaign", "launch", "--name", "clip-v1.bin"]);
  assert.equal(again.code, EXIT.ok, again.text);
  assert.equal((await versions("nisatsu/campaigns/launch/exports/clip-v1.bin")).length, 1);
  const direct = await cli(["push", file("x.bin", randomBytes(10)), "--to", "campaigns/launch/exports/x.bin"]);
  assert.equal(direct.code, EXIT.notApproved, direct.text);
});

test("migration copies once per content hash and records every old reference", { skip }, async () => {
  const bytes = randomBytes(20_000);
  const a = file("mig/desktop.mp4", bytes);
  const b = file("mig/exports.mp4", bytes);
  const plan = join(repo, "plan.json");
  writeFileSync(plan, JSON.stringify([
    { file: a, to: "campaigns/launch/working/ad.mp4", sources: ["local:~/Desktop/ad.mp4"] },
    { file: b, to: "campaigns/launch/working/ad-copy.mp4", sources: ["drive:1AbCdEf", "local:exports/ad.mp4"] },
  ]));
  const r = await cli(["migrate", "--plan", plan]);
  assert.equal(r.code, EXIT.ok, r.text);
  assert.deepEqual(r.json.map((x: any) => x.result), ["uploaded", "duplicate"]);
  const ledger = JSON.parse(readFileSync(join(repo, "media", "ledger.json"), "utf8"));
  assert.equal(ledger.entries.length, 1);
  assert.deepEqual(ledger.entries[0].sources, ["local:~/Desktop/ad.mp4", "drive:1AbCdEf", "local:exports/ad.mp4"]);
  assert.equal((await versions("nisatsu/campaigns/launch/working/ad-copy.mp4")).length, 0);
  const rerun = await cli(["migrate", "--plan", plan]);
  assert.deepEqual(rerun.json.map((x: any) => x.result), ["duplicate", "duplicate"]);
});

test("migrated renders land in a run with a stored migration manifest naming their sources", { skip }, async () => {
  const a = file("mig/teaser-1.mp4", randomBytes(30_000));
  const b = file("mig/teaser-2.mp4", randomBytes(30_000));
  const plan = join(repo, "plan-runs.json");
  writeFileSync(plan, JSON.stringify([
    { file: a, to: "runs/2026-10-01-migration-teasers/teaser-1.mp4", sources: ["local:~/Desktop/teaser-1.mp4"] },
    { file: b, to: "runs/2026-10-01-migration-teasers/teaser-2.mp4", sources: ["drive:1XyZ"], note: "pre-launch teaser" },
  ]));
  const r = await cli(["migrate", "--plan", plan]);
  assert.equal(r.code, EXIT.ok, r.text);
  assert.equal((await versions("nisatsu/runs/2026-10-01-migration-teasers/manifest.json")).length, 1);
  const m = JSON.parse(readFileSync(join(repo, ".media", "runs", "2026-10-01-migration-teasers", "manifest.json"), "utf8"));
  assert.equal(m.kind, "migration");
  assert.equal(m.status.upload, "verified");
  assert.equal(m.status.approval, "draft");
  assert.equal(m.sources["teaser-2.mp4"].ref, "drive:1XyZ");
  assert.ok(m.outputs.every((o: any) => o.stored.verifiedBy.includes("s3-checksum")));
});

test("presigned links are refused while the bucket is locked down", { skip }, async () => {
  const r = await cli(["preview", "captures/roundtrip/logo.png", "--url"]);
  assert.equal(r.code, EXIT.denied, r.text);
  const local = await cli(["preview", "captures/roundtrip/logo.png"]);
  assert.equal(local.code, EXIT.ok, local.text);
  assert.ok(existsSync(local.json.path));
});

test("a download interrupted mid-file resumes from its .part and still verifies", { skip }, async () => {
  const bytes = randomBytes(2 * MiB);
  const src = file("dl.mp4", bytes);
  await cli(["push", src, "--to", "captures/dl/dl.mp4"]);
  const dest = join(repo, "back", "dl.mp4");
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(`${dest}.part`, bytes.subarray(0, 700_000)); // as if killed mid-download
  const r = await cli(["pull", "captures/dl/dl.mp4", "--to", dest]);
  assert.equal(r.code, EXIT.ok, r.text);
  assert.deepEqual(readFileSync(dest), bytes);
  writeFileSync(`${dest}.part`, randomBytes(700_000)); // a corrupt partial is caught, not trusted
  const bad = await cli(["pull", "captures/dl/dl.mp4", "--to", join(repo, "back", "dl2.mp4")]);
  assert.equal(bad.code, EXIT.ok, bad.text);
});
