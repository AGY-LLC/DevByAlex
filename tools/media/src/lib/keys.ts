import { randomBytes } from "node:crypto";
import { EXIT, MediaError } from "./errors.ts";

/** The filing policy. The bucket is shared by every AGY project. Each
 *  project works under its own `<project>/` prefix, and `shared/` holds
 *  AGY-wide media any project may read:
 *
 *    shared/...                                  AGY-wide media (logos, fonts, licensed audio)
 *    <project>/brand/...                         shared brand media and originals
 *    <project>/captures/...                      original screenshots and recordings
 *    <project>/campaigns/<campaign>/working/...  campaign inputs and editable material
 *    <project>/campaigns/<campaign>/exports/...  approved deliverables (via `promote` only)
 *    <project>/runs/<UTC-date>-<id>/...          one execution's outputs and manifest
 */
export type Area = "shared" | "brand" | "captures" | "working" | "exports" | "runs";

export interface ParsedKey {
  area: Area;
  campaign?: string;
  runId?: string;
  /** Path inside the area (after the campaign/run segment). */
  rest: string;
}

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._ -]{0,199}$/;
const CAMPAIGN = /^[a-z0-9][a-z0-9-]{0,62}$/;
export const RUN_ID = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]{5,62})$/;

/** `2026-10-01-7f3a9c2e41`: the UTC date of the run's start plus a random id,
 *  so concurrent workers never collide and keys sort by day. */
export function newRunId(now = new Date(), label?: string): string {
  const date = now.toISOString().slice(0, 10);
  const id = randomBytes(5).toString("hex");
  const suffix = label ? `-${slug(label)}`.slice(0, 40) : "";
  return `${date}-${id}${suffix}`;
}

export function assertRunId(runId: string): string {
  const m = RUN_ID.exec(runId);
  if (!m || Number.isNaN(Date.parse(`${m[1]}T00:00:00Z`))) {
    throw new MediaError(EXIT.usage, `Invalid run id "${runId}": expected <YYYY-MM-DD>-<id>, lowercase, e.g. 2026-10-01-7f3a9c2e41.`);
  }
  return runId;
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function assertRest(rest: string): string {
  const parts = rest.split("/");
  if (!rest || parts.some((p) => !SEGMENT.test(p) || p === "." || p === "..")) {
    throw new MediaError(EXIT.usage, `Invalid object path "${rest}": use plain path segments (letters, digits, . _ - space), no "..", no empty segments.`);
  }
  return rest;
}

export const SHARED_PREFIX = "shared";

/** Build a full bucket key from a reference: `shared/...` addresses the
 *  AGY-wide area as-is; anything else is project-relative
 *  (`captures/promo/x.mp4` becomes `<project>/captures/promo/x.mp4`). */
export function projectKey(prefix: string, ref: string): string {
  const rel = ref.replace(/^\/+/, "");
  if (rel.startsWith(`${SHARED_PREFIX}/`)) {
    assertRest(rel.slice(SHARED_PREFIX.length + 1));
    return rel;
  }
  parseRelative(rel); // validates
  return `${prefix}/${rel}`;
}

/** Parse a project-relative path (no project prefix) into its area. */
export function parseRelative(rel: string): ParsedKey {
  const [head, ...tail] = rel.split("/");
  switch (head) {
    case "brand":
    case "captures":
      return { area: head, rest: assertRest(tail.join("/")) };
    case "campaigns": {
      const [campaign, kind, ...rest] = tail;
      if (!campaign || !CAMPAIGN.test(campaign)) throw new MediaError(EXIT.usage, `Invalid campaign "${campaign ?? ""}" in "${rel}": lowercase slug.`);
      if (kind !== "working" && kind !== "exports") throw new MediaError(EXIT.usage, `"${rel}": a campaign path is campaigns/<campaign>/working/... or .../exports/...`);
      return { area: kind, campaign, rest: assertRest(rest.join("/")) };
    }
    case "runs": {
      const [runId, ...rest] = tail;
      assertRunId(runId ?? "");
      return { area: "runs", runId, rest: assertRest(rest.join("/")) };
    }
    default:
      throw new MediaError(EXIT.usage, `"${rel}" is outside the filing policy: it must start with shared/, brand/, captures/, campaigns/<c>/working/, campaigns/<c>/exports/ or runs/<run-id>/.`);
  }
}

/** Split a full key into its area; refuses other projects' keys. */
export function parseKey(prefix: string, key: string): ParsedKey {
  if (key.startsWith(`${SHARED_PREFIX}/`)) return { area: "shared", rest: assertRest(key.slice(SHARED_PREFIX.length + 1)) };
  if (!key.startsWith(`${prefix}/`)) throw new MediaError(EXIT.usage, `Key "${key}" is not under this project's prefix "${prefix}/".`);
  return parseRelative(key.slice(prefix.length + 1));
}

export const runKey = (prefix: string, runId: string, name: string) => projectKey(prefix, `runs/${assertRunId(runId)}/${name}`);

/** Which areas each access level may write directly. Exports are written only
 *  by `promote`, which demands a recorded approval for the exact hash. The IAM
 *  policies in infra/ enforce the same split server-side. */
export const WRITABLE: Record<"operator" | "worker" | "reader", Area[]> = {
  operator: ["shared", "brand", "captures", "working", "runs"],
  worker: ["runs"],
  reader: [],
};

export function assertWritable(access: keyof typeof WRITABLE, parsed: ParsedKey, via: "push" | "promote" = "push"): void {
  if (parsed.area === "exports") {
    if (via !== "promote") throw new MediaError(EXIT.notApproved, "Exports are written only by `media promote`, which requires an approval for the exact content hash.");
    if (access !== "operator") throw new MediaError(EXIT.denied, `Access level "${access}" cannot promote to exports.`);
    return;
  }
  if (!WRITABLE[access].includes(parsed.area)) {
    throw new MediaError(EXIT.denied, `Access level "${access}" may not write to ${parsed.area}/ (allowed: ${WRITABLE[access].join(", ") || "nothing"}).`);
  }
}
