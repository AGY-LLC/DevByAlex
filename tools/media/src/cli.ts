import { readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type LoadedConfig, loadConfig, selectEnvironment, statePath } from "./lib/config.ts";
import { findTarget, loadDependencies, resolveInputs } from "./lib/deps.ts";
import { doctor } from "./lib/doctor.ts";
import { EXIT, MediaError } from "./lib/errors.ts";
import { digestFile } from "./lib/hash.ts";
import { assertWritable, parseKey, projectKey, SHARED_PREFIX } from "./lib/keys.ts";
import { listManifests, loadManifest, type RunManifest } from "./lib/manifest.ts";
import { migrate, type PlanEntry } from "./lib/migrate.ts";
import { probe } from "./lib/media-info.ts";
import { approve, fileRun, importFiles, promote, renderTarget } from "./lib/runs.ts";
import { assertAccount, connect, type Storage } from "./lib/s3.ts";
import { download, list, upload, verifyStored } from "./lib/transfer.ts";

const HELP = `media: project media in S3 (see MEDIA_HANDLING.md)

Usage: media <command> [options]          global: --env <name>  --json

  doctor                                   identity, account, bucket, permissions, pending uploads
  list [area-or-prefix] [--versions]       e.g. captures/, campaigns/launch/, runs/2026-10-01, shared/
  pull <target> [--offline]                resolve, download and verify a target's declared inputs
  pull <ref> --to <path> [--version id]    download one object (verified) to a path
  push <file> --to <ref>                   file an original (captures/..., brand/..., campaigns/<c>/working/..., shared/...)
  push --run <run-id>                      upload and verify a run's unfinished outputs, then its manifest
  verify --run <run-id> [--deep]           re-check a run's stored outputs against its manifest
  verify <ref> --file <path> [--deep]      check one stored object against a local file
  preview <ref> [--version id] [--url]     verified local copy (default); --url only if presigned links are enabled
  render <target> [--run-id id] [--name f] [--no-upload] [-- renderer args]
                                           pin inputs, render, upload + verify the output
  import <files...> --label slug [--run-id id] [--note text]
                                           register existing files as a run, then \`push --run\`
  approve <run-id> <output> --by name --reference where [--sha256 hash]
  promote <run-id> <output> --campaign c --name file-v1.mp4
  migrate --plan plan.json [--dry-run]     copy planned files in, record old -> new in the ledger
  runs [--pending]                         local run records
  status <run-id>                          one run manifest

Exit codes: 0 ok, 2 usage/config, 3 missing input, 4 verification, 5 conflict,
6 credentials, 7 denied, 8 render failed, 9 upload pending, 10 not approved.`;

type Out = { json: boolean; print: (human: string, data?: unknown) => void };

function storageFor(cfg: LoadedConfig, env?: string): Storage {
  return connect(cfg, env);
}

async function ready(cfg: LoadedConfig, env?: string): Promise<Storage> {
  const s = storageFor(cfg, env);
  await assertAccount(s);
  return s;
}

function summary(m: RunManifest) {
  return {
    runId: m.runId,
    processing: m.status.processing,
    upload: m.status.upload,
    approval: m.status.approval,
    outputs: m.outputs.map((o) => ({ name: o.name, size: o.size, sha256: o.sha256, upload: o.upload, key: o.stored?.key, versionId: o.stored?.versionId, error: o.uploadError })),
  };
}

export async function run(argv: string[], io: { log?: (s: string) => void; err?: (s: string) => void } = {}): Promise<number> {
  const log = io.log ?? ((s: string) => console.log(s));
  const err = io.err ?? ((s: string) => console.error(s));
  const dash = argv.indexOf("--");
  const passthrough = dash >= 0 ? argv.slice(dash + 1) : [];
  const args = dash >= 0 ? argv.slice(0, dash) : argv;
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        env: { type: "string" }, json: { type: "boolean" }, help: { type: "boolean", short: "h" },
        to: { type: "string" }, run: { type: "string" }, "run-id": { type: "string" }, version: { type: "string" },
        versions: { type: "boolean" }, deep: { type: "boolean" }, url: { type: "boolean" }, offline: { type: "boolean" },
        file: { type: "string" }, name: { type: "string" }, label: { type: "string" }, note: { type: "string" },
        by: { type: "string" }, reference: { type: "string" }, sha256: { type: "string" }, campaign: { type: "string" },
        plan: { type: "string" }, "dry-run": { type: "boolean" }, "no-upload": { type: "boolean" }, pending: { type: "boolean" },
        expires: { type: "string" },
      },
    });
  } catch (e) {
    err(`media: ${(e as Error).message}\n\n${HELP}`);
    return EXIT.usage;
  }
  const { values: o, positionals } = parsed;
  const [cmd, ...pos] = positionals;
  const out: Out = {
    json: Boolean(o.json),
    print: (human, data) => log(o.json ? JSON.stringify(data ?? { message: human }, null, 2) : human),
  };
  if (!cmd || o.help || cmd === "help") {
    log(HELP);
    return cmd || o.help ? EXIT.ok : EXIT.usage;
  }
  try {
    const cfg = loadConfig();
    const envName = selectEnvironment(cfg, o.env).name;
    switch (cmd) {
      case "doctor": {
        const r = await doctor(cfg, o.env);
        out.print(r.checks.map((c) => `${c.ok === null ? "-" : c.ok ? "ok " : "FAIL"} ${c.name}: ${c.detail}`).join("\n"), r);
        return r.ok ? EXIT.ok : r.checks.find((c) => c.required && !c.ok && /credential/i.test(c.detail)) ? EXIT.credentials : EXIT.failure;
      }
      case "list": {
        const s = await ready(cfg, o.env);
        const sub = pos[0] ?? "";
        const prefix = sub.startsWith(`${SHARED_PREFIX}/`) || sub === SHARED_PREFIX ? sub.replace(/\/?$/, "/") : `${cfg.storage.prefix}/${sub}`;
        const items = await list(s, prefix, { versions: Boolean(o.versions) });
        out.print(items.map((i) => `${i.key}${i.versionId ? `@${i.versionId}${i.isLatest ? " (latest)" : ""}` : ""}  ${i.size}  ${i.lastModified ?? ""}`).join("\n") || "(empty)", { prefix, items });
        return EXIT.ok;
      }
      case "pull": {
        if (!pos[0]) throw new MediaError(EXIT.usage, "pull needs a target or a ref.");
        if (o.to) {
          const s = await ready(cfg, o.env);
          const key = projectKey(cfg.storage.prefix, pos[0]);
          const r = await download(s, key, o.version ?? null, resolve(o.to), o.sha256 ?? null);
          out.print(`pulled ${key}${r.versionId ? `@${r.versionId}` : ""} -> ${o.to} (sha256 ${r.sha256})`, { key, ...r, path: o.to });
          return EXIT.ok;
        }
        findTarget(cfg, pos[0]);
        const s = o.offline ? null : await ready(cfg, o.env);
        const r = await resolveInputs(cfg, pos[0], s, { offline: Boolean(o.offline) });
        if (r.problems.length) throw new MediaError(EXIT.missingInput, `${pos[0]}: ${r.problems.length} input problem(s):\n- ${r.problems.join("\n- ")}`, { pinned: r.pinned });
        out.print(`${pos[0]}: ${r.pinned.length} input(s) ready; downloaded ${r.downloaded.length}.`, r);
        return EXIT.ok;
      }
      case "push": {
        const s = await ready(cfg, o.env);
        if (o.run) {
          const r = await fileRun(cfg, s, loadManifest(cfg, o.run));
          out.print(`${r.manifest.runId}: upload ${r.manifest.status.upload}${r.failed.length ? `\n${r.failed.map((f) => `  failed ${f.name}: ${f.error}`).join("\n")}` : ""}`, summary(r.manifest));
          return r.failed.length ? EXIT.uploadPending : EXIT.ok;
        }
        if (!pos[0] || !o.to) throw new MediaError(EXIT.usage, "push needs <file> --to <ref>, or --run <run-id>.");
        const key = projectKey(cfg.storage.prefix, o.to.endsWith("/") ? `${o.to}${basename(pos[0])}` : o.to);
        const parsedKey = parseKey(cfg.storage.prefix, key);
        if (parsedKey.area === "runs") throw new MediaError(EXIT.usage, "Run folders are written by `render`, `import` and `push --run`, never by a direct push.");
        assertWritable(s.env.access, parsedKey);
        const r = await upload(s, pos[0], key, { metadata: { project: cfg.project } });
        out.print(`${r.outcome}: s3://${r.bucket}/${r.key}${r.versionId ? `@${r.versionId}` : ""} sha256 ${r.sha256} (verified: ${r.verifiedBy.join(", ")})`, r);
        return EXIT.ok;
      }
      case "verify": {
        const s = await ready(cfg, o.env);
        if (o.run) {
          const m = loadManifest(cfg, o.run);
          const results = [];
          for (const x of m.outputs) {
            if (!x.stored) { results.push({ name: x.name, ok: false, detail: "not uploaded" }); continue; }
            try {
              await verifyStored(s, join(cfg.root, x.localPath), x.stored.key, x.stored.versionId, { size: x.size, sha256: x.sha256 }, { deep: Boolean(o.deep) });
              results.push({ name: x.name, ok: true, detail: `${x.stored.key}@${x.stored.versionId}` });
            } catch (e) {
              results.push({ name: x.name, ok: false, detail: (e as Error).message });
            }
          }
          out.print(results.map((r) => `${r.ok ? "ok  " : "FAIL"} ${r.name}: ${r.detail}`).join("\n"), { runId: m.runId, results });
          return results.every((r) => r.ok) ? EXIT.ok : EXIT.verification;
        }
        if (!pos[0] || !o.file) throw new MediaError(EXIT.usage, "verify needs --run <id>, or <ref> --file <path>.");
        const d = await digestFile(o.file);
        const key = projectKey(cfg.storage.prefix, pos[0]);
        const v = await verifyStored(s, o.file, key, o.version ?? null, d, { deep: Boolean(o.deep) });
        out.print(`ok: ${key}@${v.versionId} matches ${o.file} (${v.verifiedBy.join(", ")})`, v);
        return EXIT.ok;
      }
      case "preview": {
        if (!pos[0]) throw new MediaError(EXIT.usage, "preview needs a ref.");
        const s = await ready(cfg, o.env);
        const key = projectKey(cfg.storage.prefix, pos[0]);
        if (o.url) {
          if (!cfg.storage.allowPresignedUrls) {
            throw new MediaError(EXIT.denied, "Presigned links are disabled for this bucket (locked down: a link works for anyone who holds it). Use `media preview <ref>` for a verified local copy.");
          }
          const expiresIn = Math.min(Number(o.expires ?? 900), 3600);
          const url = await getSignedUrl(s.s3, new GetObjectCommand({ Bucket: s.bucket, Key: key, ...(o.version ? { VersionId: o.version } : {}) }), { expiresIn });
          out.print(url, { url, expiresIn, key, note: "temporary; never store it as a reference" });
          return EXIT.ok;
        }
        const dest = statePath(cfg, "preview", key.replaceAll("/", "__"));
        const r = await download(s, key, o.version ?? null, dest, null);
        out.print(`${dest}`, { path: dest, key, ...r, media: probe(dest) });
        return EXIT.ok;
      }
      case "render": {
        if (!pos[0]) throw new MediaError(EXIT.usage, "render needs a target.");
        const wantsUpload = !o["no-upload"];
        let s: Storage | null = null;
        if (wantsUpload || !o.offline) {
          try {
            s = await ready(cfg, o.env);
          } catch (e) {
            if (!(e instanceof MediaError) || o.offline) throw e;
            // Storage is unavailable: render may still run from local inputs,
            // and the output stays pending for a later `push --run`.
            err(`media: storage unavailable (${e.message}); rendering from local inputs, upload will stay pending.`);
          }
        }
        const r = await renderTarget(cfg, s, pos[0], { runId: o["run-id"], name: o.name, args: passthrough, environment: envName, upload: wantsUpload && s !== null });
        const m = r.manifest;
        out.print(
          `render: ${m.status.processing}\nupload: ${m.status.upload}\nrun: ${m.runId}${r.failed.length ? `\n${r.failed.map((f) => `failed ${f.name}: ${f.error}`).join("\n")}` : ""}`,
          summary(m),
        );
        return m.status.upload === "verified" ? EXIT.ok : EXIT.uploadPending;
      }
      case "import": {
        if (!o.label) throw new MediaError(EXIT.usage, "import needs --label <slug>.");
        const m = await importFiles(cfg, pos, { runId: o["run-id"], label: o.label, environment: envName, note: o.note });
        out.print(`run: ${m.runId}\noutputs: ${m.outputs.length}\nnext: media push --run ${m.runId}`, summary(m));
        return EXIT.ok;
      }
      case "approve": {
        const [runId, output] = pos;
        if (!runId || !output) throw new MediaError(EXIT.usage, "approve needs <run-id> <output>.");
        const m = approve(cfg, runId, output, { by: o.by ?? "", reference: o.reference ?? "", sha256: o.sha256 });
        out.print(`approved ${output} (sha256 ${m.outputs.find((x) => x.name === output)!.sha256}); run approval: ${m.status.approval}`, summary(m));
        return EXIT.ok;
      }
      case "promote": {
        const [runId, output] = pos;
        if (!runId || !output || !o.campaign || !o.name) throw new MediaError(EXIT.usage, "promote needs <run-id> <output> --campaign <c> --name <file>.");
        const s = await ready(cfg, o.env);
        const m = await promote(cfg, s, runId, output, { campaign: o.campaign, name: o.name });
        const ex = m.outputs.find((x) => x.name === output)?.exports?.at(-1);
        out.print(`promoted to ${ex?.key ?? `campaigns/${o.campaign}/exports/${o.name}`}${ex?.versionId ? `@${ex.versionId}` : ""}`, ex);
        return EXIT.ok;
      }
      case "migrate": {
        if (!o.plan) throw new MediaError(EXIT.usage, "migrate needs --plan <file.json>.");
        const plan = JSON.parse(readFileSync(o.plan, "utf8")) as PlanEntry[];
        const s = await ready(cfg, o.env);
        const results = await migrate(cfg, s, plan, { dryRun: Boolean(o["dry-run"]) });
        out.print(results.map((r) => `${r.result.padEnd(15)} ${r.to}${r.error ? `: ${r.error}` : ""}`).join("\n"), results);
        return results.some((r) => r.result === "failed") ? EXIT.uploadPending : EXIT.ok;
      }
      case "runs": {
        const ms = listManifests(cfg).filter((m) => !o.pending || m.status.upload === "pending" || m.status.upload === "partial");
        out.print(ms.map((m) => `${m.runId}  ${m.kind}  processing=${m.status.processing} upload=${m.status.upload} approval=${m.status.approval}`).join("\n") || "(none)", ms.map(summary));
        return EXIT.ok;
      }
      case "status": {
        if (!pos[0]) throw new MediaError(EXIT.usage, "status needs a run id.");
        const m = loadManifest(cfg, pos[0]);
        log(JSON.stringify(m, null, 2));
        return EXIT.ok;
      }
      case "deps": {
        const all = loadDependencies(cfg);
        out.print(JSON.stringify(all, null, 2), all);
        return EXIT.ok;
      }
      default:
        throw new MediaError(EXIT.usage, `Unknown command "${cmd}".\n\n${HELP}`);
    }
  } catch (e) {
    if (e instanceof MediaError) {
      if (o.json) log(JSON.stringify({ error: e.message, code: e.code, ...(e.details ? { details: e.details } : {}) }, null, 2));
      else err(`media: ${e.message}`);
      return e.code;
    }
    err(`media: unexpected error: ${(e as Error).stack ?? e}`);
    return EXIT.failure;
  }
}
