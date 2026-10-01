import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { type LoadedConfig, statePath } from "./config.ts";
import { EXIT, MediaError } from "./errors.ts";
import { assertRunId } from "./keys.ts";
import type { MediaInfo } from "./media-info.ts";
import { readJson, writeJsonAtomic } from "./state.ts";
import type { VerifiedRef } from "./transfer.ts";

export interface PinnedInput {
  id: string;
  /** Repo-relative local path the renderer reads. */
  path: string;
  source: "s3" | "generated";
  /** For s3 inputs: the exact version this run used. */
  ref?: { bucket: string; key: string; versionId: string | null };
  size: number;
  sha256: string;
}

export interface RunOutput {
  name: string;
  /** Repo-relative path of the local copy (kept until verified, and after). */
  localPath: string;
  mimeType: string;
  size: number;
  sha256: string;
  media?: MediaInfo;
  upload: "pending" | "verified" | "failed";
  uploadError?: string;
  stored?: VerifiedRef;
  /** Set by promote: the export this output was copied to. */
  exports?: VerifiedRef[];
}

export interface Approval {
  output: string;
  sha256: string;
  approvedBy: string;
  /** Where the approval was given: a PR, issue, message link or ticket. */
  reference: string;
  approvedAt: string;
}

export interface RunManifest {
  schema: "devbyalex.media-run/1";
  project: string;
  environment: string;
  runId: string;
  kind: "render" | "import" | "migration";
  createdAt: string;
  updatedAt: string;
  repo: { repository: string; commit: string | null; dirty: boolean | null };
  command: { tool: string; target?: string; argv: string[]; parameters?: Record<string, unknown> };
  inputs: PinnedInput[];
  outputs: RunOutput[];
  status: {
    processing: "pending" | "running" | "succeeded" | "failed" | "not-applicable";
    processingError?: string;
    upload: "pending" | "partial" | "verified" | "not-applicable";
    /** Drafts until a recorded approval; per-output detail is in approvals. */
    approval: "draft" | "approved";
  };
  approvals: Approval[];
  /** Stable reference to this manifest's own stored copy, once uploaded. */
  stored?: { bucket: string; key: string; versionId: string | null };
  /** Migration records: where each output came from. */
  sources?: Record<string, { kind: string; ref: string; note?: string }>;
}

export const manifestPath = (cfg: LoadedConfig, runId: string) => statePath(cfg, "runs", runId, "manifest.json");
export const outputsDir = (cfg: LoadedConfig, runId: string) => statePath(cfg, "runs", runId, "outputs");

function git(cfg: LoadedConfig, args: string[]): string | null {
  try {
    return execFileSync("git", ["-C", cfg.root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export function repoState(cfg: LoadedConfig): RunManifest["repo"] {
  const commit = git(cfg, ["rev-parse", "HEAD"]);
  const status = git(cfg, ["status", "--porcelain", "--untracked-files=no"]);
  return { repository: cfg.repository, commit, dirty: status === null ? null : status.length > 0 };
}

export function newManifest(
  cfg: LoadedConfig,
  init: { runId: string; environment: string; kind: RunManifest["kind"]; command: RunManifest["command"] },
): RunManifest {
  const now = new Date().toISOString();
  return {
    schema: "devbyalex.media-run/1",
    project: cfg.project,
    environment: init.environment,
    runId: assertRunId(init.runId),
    kind: init.kind,
    createdAt: now,
    updatedAt: now,
    repo: repoState(cfg),
    command: init.command,
    inputs: [],
    outputs: [],
    status: { processing: init.kind === "render" ? "pending" : "not-applicable", upload: "pending", approval: "draft" },
    approvals: [],
  };
}

export function loadManifest(cfg: LoadedConfig, runId: string): RunManifest {
  const m = readJson<RunManifest>(manifestPath(cfg, assertRunId(runId)));
  if (!m) throw new MediaError(EXIT.usage, `No local record of run ${runId} in ${cfg.stateDir}/runs/.`);
  return m;
}

export function saveManifest(cfg: LoadedConfig, m: RunManifest): RunManifest {
  m.updatedAt = new Date().toISOString();
  const outs = m.outputs;
  m.status.upload = !outs.length ? "not-applicable" : outs.every((o) => o.upload === "verified") ? "verified" : outs.some((o) => o.upload === "verified") ? "partial" : "pending";
  m.status.approval = outs.length && outs.every((o) => m.approvals.some((a) => a.output === o.name && a.sha256 === o.sha256)) ? "approved" : "draft";
  writeJsonAtomic(manifestPath(cfg, m.runId), m);
  return m;
}

export function listManifests(cfg: LoadedConfig): RunManifest[] {
  const dir = statePath(cfg, "runs");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .sort()
    .map((d) => readJson<RunManifest>(join(dir, d, "manifest.json")))
    .filter((m): m is RunManifest => Boolean(m));
}
