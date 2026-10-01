import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import type { LoadedConfig } from "./config.ts";
import { EXIT, MediaError } from "./errors.ts";
import { digestFile } from "./hash.ts";
import { assertWritable, parseKey, projectKey } from "./keys.ts";
import type { Storage } from "./s3.ts";
import { readJson, writeJsonAtomic } from "./state.ts";
import { type ObjectRef, upload } from "./transfer.ts";

/** One entry of a migration plan: bytes on disk, where they came from, and
 *  their destination in the filing policy. */
export interface PlanEntry {
  /** Local copy of the bytes to file (downloaded from the old store if needed). */
  file: string;
  /** Destination: project-relative (`captures/...`) or `shared/...`. */
  to: string;
  /** Where the asset lived before, e.g. "drive:1AbC..." or "local:~/Desktop/x.mp4". */
  sources: string[];
  note?: string;
}

export interface LedgerEntry {
  sha256: string;
  size: number;
  stored: ObjectRef & { verifiedAt: string };
  sources: string[];
  note?: string;
}

export interface Ledger {
  schema: "devbyalex.media-ledger/1";
  entries: LedgerEntry[];
}

export function ledgerPath(cfg: LoadedConfig): string {
  if (!cfg.ledger) throw new MediaError(EXIT.usage, `Set "ledger" in ${cfg.configPath} (a committed, repo-relative JSON file) before migrating.`);
  return join(cfg.root, cfg.ledger);
}

export function readLedger(cfg: LoadedConfig): Ledger {
  return readJson<Ledger>(ledgerPath(cfg)) ?? { schema: "devbyalex.media-ledger/1", entries: [] };
}

/** Plan paths may start with `~/` so a plan names files the same way on any
 *  account; anything else resolves against the repo root. */
export const expandPath = (root: string, p: string) => (p === "~" || p.startsWith("~/") ? join(homedir(), p.slice(1)) : resolve(root, p));

export interface MigrateOutcome {
  file: string;
  to: string;
  result: "uploaded" | "already-present" | "resumed" | "duplicate" | "failed";
  key?: string;
  error?: string;
}

/** Copy each planned file into the bucket, verified, and record old -> new.
 *  Content already in the ledger (same sha256) is not uploaded again: the new
 *  source is added to the existing entry. Originals are never touched. */
export async function migrate(cfg: LoadedConfig, storage: Storage, plan: PlanEntry[], { dryRun = false } = {}): Promise<MigrateOutcome[]> {
  const ledger = readLedger(cfg);
  const results: MigrateOutcome[] = [];
  for (const e of plan) {
    const file = expandPath(cfg.root, e.file);
    try {
      if (!existsSync(file)) throw new MediaError(EXIT.missingInput, `No such file: ${e.file}`);
      const key = projectKey(cfg.storage.prefix, e.to);
      assertWritable(storage.env.access, parseKey(cfg.storage.prefix, key));
      const d = await digestFile(file);
      const known = ledger.entries.find((x) => x.sha256 === d.sha256);
      if (known) {
        for (const s of e.sources) if (!known.sources.includes(s)) known.sources.push(s);
        results.push({ file: e.file, to: e.to, result: "duplicate", key: known.stored.key });
        continue;
      }
      if (dryRun) {
        results.push({ file: e.file, to: e.to, result: "uploaded", key });
        continue;
      }
      const r = await upload(storage, file, key, { metadata: { project: cfg.project, migrated: "1" } });
      const { outcome, verifiedBy: _v, ...stored } = r;
      ledger.entries.push({ sha256: d.sha256, size: d.size, stored, sources: [...e.sources], ...(e.note ? { note: e.note } : {}) });
      writeJsonAtomic(ledgerPath(cfg), ledger); // after every file, so a crash loses nothing recorded
      results.push({ file: e.file, to: e.to, result: outcome, key });
    } catch (err) {
      results.push({ file: e.file, to: e.to, result: "failed", error: (err as Error).message });
      if (err instanceof MediaError && (err.code === EXIT.credentials || err.code === EXIT.denied)) break;
    }
  }
  if (!dryRun) writeJsonAtomic(ledgerPath(cfg), ledger);
  return results;
}
