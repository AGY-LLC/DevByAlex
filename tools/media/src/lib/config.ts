import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { EXIT, MediaError } from "./errors.ts";

/** How an environment obtains AWS credentials. Temporary credentials are the
 *  default: a named profile (SSO locally), or the default chain (an instance
 *  or task role on a cloud worker), optionally followed by AssumeRole into the
 *  environment's project role. Static keys are read ONLY from the variable
 *  names below, never from AWS_ACCESS_KEY_ID, so the toolkit cannot pick up an
 *  application's own keys by accident. */
export interface EnvironmentConfig {
  /** AWS shared-config profile (e.g. an IAM Identity Center profile). */
  profile?: string | null;
  /** Role to assume for this environment's project-scoped permissions. */
  roleArn?: string | null;
  /** Static base credentials, by variable NAME (values come from the
   *  environment, e.g. materialized by Passworder). */
  accessKeyIdEnv?: string | null;
  secretAccessKeyEnv?: string | null;
  sessionTokenEnv?: string | null;
  /** Which permission set this environment is expected to have; doctor checks it. */
  access: "operator" | "worker" | "reader";
}

export interface ProjectConfig {
  schema: "devbyalex.media-config/1";
  project: string;
  repository: string;
  storage: {
    bucket: string;
    region: string;
    /** Expected AWS account; doctor refuses any other. Null until provisioned. */
    accountId: string | null;
    /** Key prefix for this project inside the shared bucket. */
    prefix: string;
    /** Test-only: an S3-compatible endpoint. Never set in a committed config. */
    endpoint?: string | null;
    /** Presigned links work for anyone holding them. Off unless the bucket
     *  policy also allows query-string auth (infra parameter). */
    allowPresignedUrls?: boolean;
  };
  defaultEnvironment: string;
  environments: Record<string, EnvironmentConfig>;
  /** Repo-relative directory for run state, transfer state and caches (gitignored). */
  stateDir: string;
  transfer: { multipartThresholdMiB: number; partSizeMiB: number; concurrency: number; maxAttempts: number };
  /** Repo-relative path of the dependency manifest(s) for renderers. */
  dependencies: string[];
  /** Repo-relative, committed migration ledger (old reference -> stored object). */
  ledger?: string;
}

export interface LoadedConfig extends ProjectConfig {
  /** Absolute repo root (the directory holding media.config.json). */
  root: string;
  configPath: string;
}

export const CONFIG_FILE = "media.config.json";

/** Walk up from `from` to the nearest media.config.json. */
export function findConfig(from = process.cwd()): string {
  let dir = resolve(from);
  for (;;) {
    const candidate = join(dir, CONFIG_FILE);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new MediaError(EXIT.usage, `No ${CONFIG_FILE} found from ${from} upward. Run the toolkit inside a configured repository.`);
    }
    dir = parent;
  }
}

const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

export function validateConfig(raw: unknown, where = CONFIG_FILE): ProjectConfig {
  const problems: string[] = [];
  const c = raw as Partial<ProjectConfig> & Record<string, unknown>;
  if (!c || typeof c !== "object") throw new MediaError(EXIT.usage, `${where}: not a JSON object.`);
  if (c.schema !== "devbyalex.media-config/1") problems.push(`schema must be "devbyalex.media-config/1"`);
  if (typeof c.project !== "string" || !SLUG.test(c.project)) problems.push("project must be a lowercase slug");
  if (typeof c.repository !== "string" || !/^[^/\s]+\/[^/\s]+$/.test(c.repository)) problems.push("repository must be owner/name");
  const s = c.storage;
  if (!s || typeof s !== "object") problems.push("storage is required");
  else {
    if (typeof s.bucket !== "string" || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(s.bucket)) problems.push("storage.bucket must be a valid S3 bucket name");
    if (typeof s.region !== "string" || !/^[a-z]{2}(-[a-z]+)+-\d$/.test(s.region)) problems.push("storage.region must be an AWS region");
    if (s.accountId !== null && !(typeof s.accountId === "string" && /^\d{12}$/.test(s.accountId))) problems.push("storage.accountId must be a 12-digit id or null");
    if (typeof s.prefix !== "string" || !SLUG.test(s.prefix)) problems.push("storage.prefix must be a lowercase slug (the project's folder in the bucket)");
    else if (s.prefix === "shared") problems.push(`storage.prefix cannot be "shared": that prefix is the AGY-wide area every project reads`);
  }
  const envs = c.environments;
  if (!envs || typeof envs !== "object" || !Object.keys(envs).length) problems.push("environments needs at least one entry");
  else {
    for (const [name, e] of Object.entries(envs)) {
      if (!["operator", "worker", "reader"].includes(e?.access)) problems.push(`environments.${name}.access must be operator, worker or reader`);
      if (e?.accessKeyIdEnv && /^AWS_/.test(e.accessKeyIdEnv)) problems.push(`environments.${name}.accessKeyIdEnv must not be an AWS_* name (it would collide with an app's own keys)`);
    }
  }
  if (typeof c.defaultEnvironment !== "string" || !envs || !(c.defaultEnvironment in envs)) problems.push("defaultEnvironment must name an environment");
  if (typeof c.stateDir !== "string" || isAbsolute(c.stateDir) || c.stateDir.includes("..")) problems.push("stateDir must be a repo-relative path");
  const t = c.transfer;
  if (!t || !(t.partSizeMiB >= 5) || !(t.multipartThresholdMiB >= t.partSizeMiB) || !(t.concurrency >= 1) || !(t.maxAttempts >= 1)) {
    problems.push("transfer needs partSizeMiB >= 5, multipartThresholdMiB >= partSizeMiB, concurrency >= 1, maxAttempts >= 1");
  }
  if (!Array.isArray(c.dependencies)) problems.push("dependencies must be an array of repo-relative paths");
  if (problems.length) throw new MediaError(EXIT.usage, `${where} is invalid:\n- ${problems.join("\n- ")}`);
  return c as ProjectConfig;
}

export function loadConfig(from?: string): LoadedConfig {
  const configPath = process.env.MEDIA_CONFIG ? resolve(process.env.MEDIA_CONFIG) : findConfig(from);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (e) {
    throw new MediaError(EXIT.usage, `${configPath}: ${(e as Error).message}`);
  }
  const cfg = validateConfig(raw, configPath);
  // Test hook: point at an S3-compatible emulator without editing the file.
  if (process.env.MEDIA_S3_ENDPOINT) cfg.storage.endpoint = process.env.MEDIA_S3_ENDPOINT;
  return { ...cfg, root: dirname(configPath), configPath };
}

export function selectEnvironment(cfg: ProjectConfig, requested?: string): { name: string; env: EnvironmentConfig } {
  const name = requested ?? process.env.MEDIA_ENV ?? cfg.defaultEnvironment;
  const env = cfg.environments[name];
  if (!env) throw new MediaError(EXIT.usage, `Unknown environment "${name}". Configured: ${Object.keys(cfg.environments).join(", ")}.`);
  return { name, env };
}

export const statePath = (cfg: LoadedConfig, ...parts: string[]) => join(cfg.root, cfg.stateDir, ...parts);
