import { GetBucketVersioningCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getRenderer } from "../adapters/index.ts";
import type { LoadedConfig } from "./config.ts";
import { loadDependencies } from "./deps.ts";
import { classifyAwsError, EXIT, MediaError } from "./errors.ts";
import { SHARED_PREFIX } from "./keys.ts";
import { listManifests } from "./manifest.ts";
import { ffprobeAvailable } from "./media-info.ts";
import { connect, whoAmI } from "./s3.ts";

export interface Check {
  name: string;
  ok: boolean | null; // null = not checked / informational
  detail: string;
  required: boolean;
}

/** Everything a worker needs before touching media, checked in order and
 *  reported without credential material (identity is an ARN, not a key). */
export async function doctor(cfg: LoadedConfig, envName?: string): Promise<{ checks: Check[]; ok: boolean }> {
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);
  add({ name: "config", ok: true, detail: `${cfg.project} -> s3://${cfg.storage.bucket}/${cfg.storage.prefix}/ (${cfg.storage.region})`, required: true });
  try {
    const deps = loadDependencies(cfg);
    for (const d of deps) getRenderer(d.renderer, d.command);
    add({ name: "dependencies", ok: true, detail: deps.map((d) => `${d.file}: ${Object.keys(d.targets).length} target(s)`).join("; ") || "none declared", required: true });
  } catch (e) {
    add({ name: "dependencies", ok: false, detail: (e as Error).message, required: true });
  }
  add({ name: "ffprobe", ok: ffprobeAvailable(), detail: "used for dimensions/duration in manifests", required: false });

  let storage;
  try {
    storage = connect(cfg, envName);
    add({ name: "environment", ok: true, detail: `${storage.envName} (${storage.env.access})${storage.env.roleArn ? `, assumes ${storage.env.roleArn}` : ""}`, required: true });
  } catch (e) {
    add({ name: "environment", ok: false, detail: (e as Error).message, required: true });
    return finish(checks);
  }
  try {
    const id = await whoAmI(storage);
    const expected = cfg.storage.accountId;
    add({
      name: "identity",
      ok: expected === null ? false : id.account === expected,
      detail: expected === null ? `authenticated as ${id.arn}, but storage.accountId is unset (bucket not provisioned)` : id.account === expected ? id.arn : `account ${id.account}, expected ${expected}`,
      required: true,
    });
  } catch (e) {
    add({ name: "identity", ok: false, detail: (e as MediaError).message, required: true });
    return finish(checks);
  }
  const probe = async (name: string, required: boolean, fn: () => Promise<string>, expectDenied = false) => {
    try {
      const detail = await fn();
      add({ name, ok: !expectDenied, detail: expectDenied ? `allowed, but should be denied: ${detail}` : detail, required });
    } catch (e) {
      const m = classifyAwsError(e, name);
      if (expectDenied && m.code === EXIT.denied) add({ name, ok: true, detail: "denied, as intended", required });
      else add({ name, ok: false, detail: m.message, required });
    }
  };
  const s3 = storage.s3;
  const bucket = cfg.storage.bucket;
  // HeadBucket needs an unconditional s3:ListBucket, which project roles do
  // not have (listing is limited to their prefix), so listing the project is
  // the reachability check.
  await probe("list project", true, async () => {
    const r = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${cfg.storage.prefix}/`, MaxKeys: 1 }));
    return `ok (${r.KeyCount ?? 0} key sampled)`;
  });
  await probe("list shared", false, async () => {
    const r = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${SHARED_PREFIX}/`, MaxKeys: 1 }));
    return `ok (${r.KeyCount ?? 0} key sampled)`;
  });
  // Project roles must not see other projects' keys. Skip against emulators,
  // which do not evaluate IAM.
  if (!cfg.storage.endpoint) {
    await probe("list outside project", true, async () => {
      const r = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: "", MaxKeys: 1 }));
      return `bucket root listed (${r.KeyCount ?? 0} key)`;
    }, true);
  }
  await probe("versioning", false, async () => {
    const r = await s3.send(new GetBucketVersioningCommand({ Bucket: bucket }));
    if (r.Status !== "Enabled") throw new MediaError(EXIT.failure, `versioning is ${r.Status ?? "off"}; it must be Enabled`);
    return "enabled";
  });
  const pending = listManifests(cfg).filter((m) => m.status.upload === "pending" || m.status.upload === "partial");
  add({ name: "pending uploads", ok: null, detail: pending.length ? pending.map((m) => m.runId).join(", ") : "none", required: false });
  return finish(checks);
}

function finish(checks: Check[]) {
  return { checks, ok: checks.every((c) => !c.required || c.ok === true) };
}
