import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { CopyObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getRenderer } from "../adapters/index.ts";
import type { LoadedConfig } from "./config.ts";
import { changedInputs, findTarget, resolveInputs } from "./deps.ts";
import { classifyAwsError, EXIT, MediaError } from "./errors.ts";
import { digestFile } from "./hash.ts";
import { assertWritable, newRunId, parseKey, projectKey, runKey, slug } from "./keys.ts";
import {
  type Approval,
  loadManifest,
  manifestPath,
  newManifest,
  outputsDir,
  type RunManifest,
  type RunOutput,
  saveManifest,
} from "./manifest.ts";
import { mimeFor, probe } from "./media-info.ts";
import type { Storage } from "./s3.ts";
import { head, upload, verifyStored } from "./transfer.ts";

/** Reuse a run when the caller passes its id (a retried job), else start one. */
export function openRun(
  cfg: LoadedConfig,
  init: { runId?: string; label?: string; environment: string; kind: RunManifest["kind"]; command: RunManifest["command"] },
): RunManifest {
  if (init.runId && existsSync(manifestPath(cfg, init.runId))) return loadManifest(cfg, init.runId);
  const runId = init.runId ?? newRunId(new Date(), init.label);
  return saveManifest(cfg, newManifest(cfg, { ...init, runId }));
}

/** Add a file as a run output. The same name with the same bytes is a no-op
 *  (retry); the same name with different bytes is refused. */
export async function addOutput(cfg: LoadedConfig, m: RunManifest, src: string, name = basename(src)): Promise<RunOutput> {
  if (name.includes("/") || name === "manifest.json") throw new MediaError(EXIT.usage, `Invalid output name "${name}".`);
  const dir = outputsDir(cfg, m.runId);
  mkdirSync(dir, { recursive: true });
  const dest = join(dir, name);
  const d = await digestFile(src);
  const existing = m.outputs.find((o) => o.name === name);
  if (existing) {
    if (existing.sha256 === d.sha256) return existing;
    throw new MediaError(EXIT.conflict, `Run ${m.runId} already has an output "${name}" with different content.`);
  }
  if (resolve(src) !== resolve(dest)) copyFileSync(src, dest);
  const out: RunOutput = {
    name,
    localPath: relative(cfg.root, dest),
    mimeType: mimeFor(dest),
    size: d.size,
    sha256: d.sha256,
    media: probe(dest),
    upload: "pending",
  };
  m.outputs.push(out);
  saveManifest(cfg, m);
  return out;
}

export interface FileResult {
  manifest: RunManifest;
  failed: { name: string; error: string }[];
}

/** Upload every unverified output of a run to `<project>/runs/<run>/<name>`,
 *  verify each, then store the manifest beside them. Failures are recorded and
 *  the local outputs kept; re-running retries exactly the unfinished ones. */
export async function fileRun(cfg: LoadedConfig, storage: Storage, m: RunManifest): Promise<FileResult> {
  const failed: FileResult["failed"] = [];
  for (const o of m.outputs.filter((x) => x.upload !== "verified")) {
    const key = runKey(cfg.storage.prefix, m.runId, o.name);
    try {
      assertWritable(storage.env.access, parseKey(cfg.storage.prefix, key));
      const r = await upload(storage, join(cfg.root, o.localPath), key, {
        contentType: o.mimeType,
        metadata: { run: m.runId, project: cfg.project },
      });
      const { outcome: _outcome, ...ref } = r;
      o.stored = ref;
      o.upload = "verified";
      delete o.uploadError;
    } catch (e) {
      o.upload = "failed";
      o.uploadError = (e as Error).message;
      failed.push({ name: o.name, error: o.uploadError });
      if (e instanceof MediaError && (e.code === EXIT.credentials || e.code === EXIT.denied)) {
        saveManifest(cfg, m);
        break; // the rest would fail the same way
      }
    }
    saveManifest(cfg, m);
  }
  if (!failed.length) await storeManifest(cfg, storage, m);
  return { manifest: saveManifest(cfg, m), failed };
}

/** The manifest is the one mutable object in a run folder: each upload is a
 *  new S3 version, so its history is kept. */
export async function storeManifest(cfg: LoadedConfig, storage: Storage, m: RunManifest): Promise<void> {
  const key = runKey(cfg.storage.prefix, m.runId, "manifest.json");
  const { stored: _s, ...body } = m;
  try {
    const r = await storage.s3.send(
      new PutObjectCommand({
        Bucket: storage.bucket,
        Key: key,
        Body: `${JSON.stringify(body, null, 2)}\n`,
        ContentType: "application/json",
        ChecksumAlgorithm: "SHA256",
      }),
    );
    m.stored = { bucket: storage.bucket, key, versionId: r.VersionId ?? null };
  } catch (e) {
    throw classifyAwsError(e, `Store manifest ${key}`);
  }
}

export interface RenderOptions {
  runId?: string;
  name?: string;
  args?: string[];
  environment: string;
  upload?: boolean;
}

export interface RenderResult {
  manifest: RunManifest;
  failed: FileResult["failed"];
}

/** Resolve and pin inputs, render, then file and verify the output. Render
 *  and upload outcomes are recorded separately: an upload failure leaves a
 *  succeeded render with its output on disk and `upload` pending. */
export async function renderTarget(cfg: LoadedConfig, storage: Storage | null, target: string, opts: RenderOptions): Promise<RenderResult> {
  const { deps, spec } = findTarget(cfg, target);
  const renderer = getRenderer(deps.renderer, deps.command);
  const outName = opts.name ?? spec.outputName ?? `${slug(target)}.mp4`;
  const args = opts.args?.length ? opts.args : [...(deps.defaultArgs ?? []), ...(spec.args ?? [])];

  // A retry of a run whose render already succeeded only re-files it.
  if (opts.runId && existsSync(manifestPath(cfg, opts.runId))) {
    const prior = loadManifest(cfg, opts.runId);
    if (prior.status.processing === "succeeded") {
      if (opts.upload === false || !storage) return { manifest: prior, failed: [] };
      return fileRun(cfg, storage, prior);
    }
  }

  const resolution = await resolveInputs(cfg, target, storage, { offline: !storage });
  if (resolution.problems.length) {
    throw new MediaError(EXIT.missingInput, `${target} cannot render; nothing was started:\n- ${resolution.problems.join("\n- ")}`);
  }
  const reqBase = { cwd: join(cfg.root, deps.root), target, args };
  const m = openRun(cfg, {
    runId: opts.runId,
    label: target,
    environment: opts.environment,
    kind: "render",
    command: { tool: renderer.name, target, argv: renderer.describe({ ...reqBase, output: outName }), parameters: { dependencies: deps.file, outputName: outName } },
  });
  m.inputs = resolution.pinned;
  m.status.processing = "running";
  saveManifest(cfg, m);

  const output = join(outputsDir(cfg, m.runId), outName);
  mkdirSync(outputsDir(cfg, m.runId), { recursive: true });
  const { exitCode } = await renderer.render({ ...reqBase, output });
  if (exitCode !== 0 || !existsSync(output) || statSync(output).size === 0) {
    m.status.processing = "failed";
    m.status.processingError = exitCode !== 0 ? `${renderer.name} exited ${exitCode}` : "renderer produced no output";
    saveManifest(cfg, m);
    throw new MediaError(EXIT.renderFailed, `Render failed: ${m.status.processingError}. Run ${m.runId} kept with its pinned inputs.`);
  }
  const changed = await changedInputs(cfg, m.inputs);
  if (changed.length) {
    m.status.processing = "failed";
    m.status.processingError = `inputs changed during the render: ${changed.join(", ")}`;
    saveManifest(cfg, m);
    throw new MediaError(EXIT.renderFailed, `${m.status.processingError}; the output would mix versions, so it is not filed.`);
  }
  await addOutput(cfg, m, output, outName);
  m.status.processing = "succeeded";
  delete m.status.processingError;
  saveManifest(cfg, m);
  if (opts.upload === false || !storage) return { manifest: m, failed: [] };
  return fileRun(cfg, storage, m);
}

/** Register existing files (captures, hand-made exports, migrations) as a run. */
export async function importFiles(
  cfg: LoadedConfig,
  files: string[],
  opts: { runId?: string; label: string; environment: string; kind?: "import" | "migration"; note?: string; sources?: Record<string, { kind: string; ref: string; note?: string }> },
): Promise<RunManifest> {
  if (!files.length) throw new MediaError(EXIT.usage, "Nothing to import.");
  for (const f of files) if (!existsSync(f)) throw new MediaError(EXIT.missingInput, `No such file: ${f}`);
  const m = openRun(cfg, {
    runId: opts.runId,
    label: opts.label,
    environment: opts.environment,
    kind: opts.kind ?? "import",
    command: { tool: "import", argv: [], parameters: { note: opts.note ?? null, files: files.map((f) => basename(f)) } },
  });
  // Two files in one import with the same basename keep their parent
  // directory in the name. Deterministic, so a retried import maps the same
  // files to the same output names.
  const used = new Set<string>();
  for (const f of files) {
    let name = basename(f);
    if (used.has(name)) name = `${slug(basename(resolve(f, "..")))}--${name}`;
    used.add(name);
    await addOutput(cfg, m, f, name);
    if (opts.sources?.[f]) (m.sources ??= {})[name] = opts.sources[f];
  }
  return saveManifest(cfg, m);
}

/** Record an approval for one output's exact bytes. Approval never moves a file. */
export function approve(cfg: LoadedConfig, runId: string, output: string, a: { by: string; reference: string; sha256?: string }): RunManifest {
  const m = loadManifest(cfg, runId);
  const o = m.outputs.find((x) => x.name === output);
  if (!o) throw new MediaError(EXIT.usage, `Run ${runId} has no output "${output}".`);
  if (!a.by || !a.reference) throw new MediaError(EXIT.usage, "approve needs --by and --reference (where the approval was given).");
  if (a.sha256 && a.sha256 !== o.sha256) {
    throw new MediaError(EXIT.notApproved, `The approval names sha256 ${a.sha256}, but ${output} is ${o.sha256}; it approves different bytes.`);
  }
  const approval: Approval = { output, sha256: o.sha256, approvedBy: a.by, reference: a.reference, approvedAt: new Date().toISOString() };
  m.approvals = m.approvals.filter((x) => !(x.output === output && x.sha256 === o.sha256)).concat(approval);
  return saveManifest(cfg, m);
}

/** Copy an approved, verified run output into a campaign's exports. Requires
 *  an approval for the exact hash; never overwrites an existing export. */
export async function promote(
  cfg: LoadedConfig,
  storage: Storage,
  runId: string,
  output: string,
  dest: { campaign: string; name: string },
): Promise<RunManifest> {
  const m = loadManifest(cfg, runId);
  const o = m.outputs.find((x) => x.name === output);
  if (!o) throw new MediaError(EXIT.usage, `Run ${runId} has no output "${output}".`);
  const approval = m.approvals.find((a) => a.output === output && a.sha256 === o.sha256);
  if (!approval) throw new MediaError(EXIT.notApproved, `${output} (sha256 ${o.sha256}) has no recorded approval. Record one with \`media approve\` first.`);
  if (o.upload !== "verified" || !o.stored) throw new MediaError(EXIT.notApproved, `${output} is not verified in storage yet; run \`media push --run ${runId}\` first.`);
  const key = projectKey(cfg.storage.prefix, `campaigns/${dest.campaign}/exports/${dest.name}`);
  assertWritable(storage.env.access, parseKey(cfg.storage.prefix, key), "promote");
  const source = await verifyStored(storage, join(cfg.root, o.localPath), o.stored.key, o.stored.versionId, { size: o.size, sha256: o.sha256 });
  const existing = await head(storage, key);
  if (existing) {
    if (existing.sha256 === o.sha256) return m; // already promoted
    throw new MediaError(EXIT.conflict, `${key} already exists with different content. Exports are never overwritten; use a new versioned name.`);
  }
  try {
    await storage.s3.send(
      new CopyObjectCommand({
        Bucket: storage.bucket,
        Key: key,
        CopySource: `${storage.bucket}/${encodeURIComponent(source.key).replaceAll("%2F", "/")}${source.versionId ? `?versionId=${source.versionId}` : ""}`,
        MetadataDirective: "REPLACE",
        ContentType: o.mimeType,
        Metadata: {
          sha256: o.sha256,
          approvedby: approval.approvedBy,
          approvalref: approval.reference,
          sourcekey: source.key,
          sourceversion: source.versionId ?? "",
        },
        ChecksumAlgorithm: "SHA256",
      }),
    );
  } catch (e) {
    throw classifyAwsError(e, `Promote to ${key}`);
  }
  const v = await verifyStored(storage, join(cfg.root, o.localPath), key, null, { size: o.size, sha256: o.sha256 });
  (o.exports ??= []).push(v);
  saveManifest(cfg, m);
  await storeManifest(cfg, storage, m);
  return saveManifest(cfg, m);
}
