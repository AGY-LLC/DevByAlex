import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LoadedConfig } from "./config.ts";
import { EXIT, MediaError } from "./errors.ts";
import { digestFile } from "./hash.ts";
import { projectKey } from "./keys.ts";
import type { PinnedInput } from "./manifest.ts";
import type { Storage } from "./s3.ts";
import { download, head } from "./transfer.ts";

/** One external input a target (e.g. a Remotion composition) reads. */
export interface DependencyInput {
  id: string;
  /** Path the renderer reads, relative to the dependency file's `root`. */
  path: string;
  /** Either an S3 reference (project-relative like `captures/x.mp4`, or
   *  `shared/...`), or a command that regenerates it from the repo. */
  ref?: string;
  /** Optional pin. Without it, a new run resolves the current version and
   *  pins THAT for the rest of the run. */
  versionId?: string;
  sha256?: string;
  generate?: string;
  required?: boolean;
  note?: string;
}

export interface DependencyFile {
  schema: "devbyalex.media-deps/1";
  /** Repo-relative directory the renderer runs in; input paths are relative to it. */
  root: string;
  renderer: string;
  /** For renderer "command": argv template with {target} and {output}. */
  command?: string[];
  /** Renderer arguments shared by every target (e.g. ["--crf=16"]). */
  defaultArgs?: string[];
  targets: Record<string, { inputs: DependencyInput[]; outputName?: string; args?: string[]; status?: string }>;
}

export interface LoadedDeps extends DependencyFile {
  file: string;
}

export function loadDependencies(cfg: LoadedConfig): LoadedDeps[] {
  return cfg.dependencies.map((rel) => {
    const file = join(cfg.root, rel);
    if (!existsSync(file)) throw new MediaError(EXIT.usage, `Dependency file ${rel} (from media.config.json) does not exist.`);
    const d = JSON.parse(readFileSync(file, "utf8")) as DependencyFile;
    if (d.schema !== "devbyalex.media-deps/1" || !d.targets || typeof d.root !== "string") {
      throw new MediaError(EXIT.usage, `${rel}: not a devbyalex.media-deps/1 file.`);
    }
    for (const [t, spec] of Object.entries(d.targets)) {
      for (const i of spec.inputs) {
        if (Boolean(i.ref) === Boolean(i.generate)) throw new MediaError(EXIT.usage, `${rel}: ${t}.${i.id} needs exactly one of "ref" or "generate".`);
        if (i.ref) projectKey(cfg.storage.prefix, i.ref); // validates the filing area
      }
    }
    return { ...d, file: rel };
  });
}

export function findTarget(cfg: LoadedConfig, target: string): { deps: LoadedDeps; spec: DependencyFile["targets"][string] } {
  const all = loadDependencies(cfg);
  for (const deps of all) if (deps.targets[target]) return { deps, spec: deps.targets[target] };
  const known = all.flatMap((d) => Object.keys(d.targets));
  throw new MediaError(EXIT.usage, `Unknown target "${target}". Declared: ${known.join(", ") || "(none)"}. Declare it in a dependency file before rendering it.`);
}

export interface Resolution {
  pinned: PinnedInput[];
  downloaded: string[];
  problems: string[];
}

/** Resolve every input of a target at the START of a run: pick the version to
 *  use (declared pin, else the current version), download it when the local
 *  copy is absent or different, verify the bytes, and pin version + hash.
 *  Generated inputs are checked locally. All problems are reported together. */
export async function resolveInputs(
  cfg: LoadedConfig,
  target: string,
  storage: Storage | null,
  { offline = false }: { offline?: boolean } = {},
): Promise<Resolution> {
  const { deps, spec } = findTarget(cfg, target);
  const pinned: PinnedInput[] = [];
  const downloaded: string[] = [];
  const problems: string[] = [];
  for (const input of spec.inputs) {
    const local = join(cfg.root, deps.root, input.path);
    const rel = join(deps.root, input.path);
    const required = input.required !== false;
    if (input.generate) {
      if (!existsSync(local)) {
        if (required) problems.push(`${rel} (${input.id}) is missing: run \`${input.generate}\` in ${deps.root}/.`);
        continue;
      }
      const d = await digestFile(local);
      if (input.sha256 && d.sha256 !== input.sha256) problems.push(`${rel} (${input.id}) does not match its pinned sha256; re-run \`${input.generate}\`.`);
      else pinned.push({ id: input.id, path: rel, source: "generated", size: d.size, sha256: d.sha256 });
      continue;
    }
    const key = projectKey(cfg.storage.prefix, input.ref!);
    if (offline || !storage) {
      if (!existsSync(local)) {
        if (required) problems.push(`${rel} (${input.id}) is missing and storage is not available; fetch s3://${cfg.storage.bucket}/${key} with \`media pull ${target}\`.${input.note ? ` Note: ${input.note}` : ""}`);
        continue;
      }
      const d = await digestFile(local);
      if (input.sha256 && d.sha256 !== input.sha256) {
        problems.push(`${rel} (${input.id}) does not match its pinned sha256 and storage is not available to fetch the right version.`);
        continue;
      }
      pinned.push({ id: input.id, path: rel, source: "s3", ref: { bucket: cfg.storage.bucket, key, versionId: input.versionId ?? null }, size: d.size, sha256: d.sha256 });
      continue;
    }
    const h = await head(storage, key, input.versionId ?? null);
    if (!h) {
      if (required) {
        problems.push(
          `${rel} (${input.id}): s3://${cfg.storage.bucket}/${key}${input.versionId ? `@${input.versionId}` : ""} does not exist. ` +
            (input.note ? `${input.note} ` : "") +
            `Upload the genuine original with \`media push ${input.ref} --from <file>\`; do not substitute other media.`,
        );
      }
      continue;
    }
    const want = input.sha256 ?? h.sha256;
    if (!want) {
      problems.push(`${rel} (${input.id}): the stored object has no sha256 metadata; re-file it with \`media push\` so it can be verified.`);
      continue;
    }
    let size: number;
    const current = existsSync(local) ? await digestFile(local) : null;
    if (current && current.sha256 === want) size = current.size;
    else {
      const got = await download(storage, key, h.versionId, local, want);
      size = got.size;
      downloaded.push(rel);
    }
    pinned.push({ id: input.id, path: rel, source: "s3", ref: { bucket: cfg.storage.bucket, key, versionId: h.versionId }, size, sha256: want });
  }
  return { pinned, downloaded, problems };
}

/** Re-hash pinned local inputs; returns the paths that changed. */
export async function changedInputs(cfg: LoadedConfig, pinned: PinnedInput[]): Promise<string[]> {
  const changed: string[] = [];
  for (const p of pinned) {
    const abs = join(cfg.root, p.path);
    if (!existsSync(abs) || (await digestFile(abs)).sha256 !== p.sha256) changed.push(p.path);
  }
  return changed;
}
