// The CloudFormation templates are the server-side half of the filing policy,
// so they are tested as policies: resolve the template with real parameters,
// then evaluate concrete requests against each role with IAM's rules (explicit
// deny wins, then any allow, else implicit deny). The evaluator covers exactly
// the policy features the templates use: action and resource wildcards, and
// StringLike/StringEquals/Bool conditions.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const load = (f: string) => JSON.parse(readFileSync(join(here, "..", "infra", f), "utf8"));
const PARAMS: Record<string, string> = { ProjectPrefix: "nisatsu", BucketName: "agyllc-marketing", "AWS::Partition": "aws", "AWS::AccountId": "123456789012", AllowPresignedUrls: "false", CreateExternalWorkerUser: "true", AbortIncompleteMultipartDays: "7", NoncurrentVersionDays: "365", NewerNoncurrentVersionsKept: "5" };

function resolve(node: any, params = PARAMS): any {
  if (Array.isArray(node)) return node.map((n) => resolve(n, params)).filter((n) => n !== NO_VALUE);
  if (node && typeof node === "object") {
    if ("Fn::Sub" in node) return String(node["Fn::Sub"]).replace(/\$\{([^}]+)\}/g, (_, k) => params[k] ?? (k === "MediaBucket.Arn" ? `arn:aws:s3:::${params.BucketName}` : `<${k}>`));
    if ("Ref" in node) return node.Ref === "AWS::NoValue" ? NO_VALUE : node.Ref === "MediaBucket" ? params.BucketName : params[node.Ref] ?? `<${node.Ref}>`;
    if ("Fn::GetAtt" in node) return node["Fn::GetAtt"][0] === "MediaBucket" ? `arn:aws:s3:::${params.BucketName}` : `<${node["Fn::GetAtt"].join(".")}>`;
    if ("Fn::If" in node) {
      const [cond, a, b] = node["Fn::If"];
      const truth = cond === "DenyPresigned" ? params.AllowPresignedUrls === "false" : false;
      return resolve(truth ? a : b, params);
    }
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolve(v, params)]).filter(([, v]) => v !== NO_VALUE));
  }
  return node;
}
const NO_VALUE = Symbol("NoValue");

const glob = (pattern: string, value: string) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`).test(value);
const list = <T,>(x: T | T[]) => (Array.isArray(x) ? x : [x]);

interface Req {
  action: string;
  resource: string;
  context?: Record<string, string>;
}

function matches(stmt: any, req: Req): boolean {
  if (!list(stmt.Action).some((a: string) => glob(a, req.action))) return false;
  if (!list(stmt.Resource).some((r: string) => glob(r, req.resource))) return false;
  for (const [op, conds] of Object.entries<Record<string, string | string[]>>(stmt.Condition ?? {})) {
    for (const [key, want] of Object.entries(conds)) {
      const got = req.context?.[key];
      if (got === undefined) return false;
      const ok = op === "StringLike" ? list(want).some((w) => glob(w, got)) : op === "StringEquals" || op === "Bool" ? list(want).includes(got) : false;
      if (!ok) return false;
    }
  }
  return true;
}

function decide(statements: any[], req: Req): "allow" | "deny" {
  if (statements.some((s) => s.Effect === "Deny" && matches(s, req))) return "deny";
  return statements.some((s) => s.Effect === "Allow" && matches(s, req)) ? "allow" : "deny";
}

const roles = resolve(load("project-roles.json")).Resources;
const bucketTpl = resolve(load("media-bucket.json"));
const bucketPolicy = bucketTpl.Resources.MediaBucketPolicy.Properties.PolicyDocument.Statement;
const policy = (role: string) => roles[role].Properties.Policies[0].PolicyDocument.Statement;
const B = "arn:aws:s3:::agyllc-marketing";
const obj = (key: string) => `${B}/${key}`;

/** Identity policy AND bucket policy, as S3 evaluates a same-account request. */
function can(role: string, req: Req): boolean {
  const ctx = { "aws:SecureTransport": "true", "s3:authType": "REST-HEADER", ...req.context };
  const r = { ...req, context: ctx };
  if (bucketPolicy.some((s: any) => s.Effect === "Deny" && matches({ ...s, Principal: undefined }, r))) return false;
  return decide(policy(role), r) === "allow";
}

test("bucket: private, versioned, encrypted, owner-enforced, lifecycle-managed", () => {
  const p = bucketTpl.Resources.MediaBucket.Properties;
  assert.deepEqual(p.PublicAccessBlockConfiguration, { BlockPublicAcls: true, BlockPublicPolicy: true, IgnorePublicAcls: true, RestrictPublicBuckets: true });
  assert.equal(p.OwnershipControls.Rules[0].ObjectOwnership, "BucketOwnerEnforced");
  assert.equal(p.VersioningConfiguration.Status, "Enabled");
  assert.equal(p.BucketEncryption.ServerSideEncryptionConfiguration[0].ServerSideEncryptionByDefault.SSEAlgorithm, "AES256");
  const rules = Object.fromEntries(p.LifecycleConfiguration.Rules.map((r: any) => [r.Id, r]));
  assert.equal(rules["abort-incomplete-multipart"].AbortIncompleteMultipartUpload.DaysAfterInitiation, "7");
  assert.ok(rules["superseded-versions"].NoncurrentVersionExpiration.NewerNoncurrentVersions);
  assert.ok(!JSON.stringify(p.LifecycleConfiguration).includes("Transition"), "no transitions: active media stays immediately retrievable");
  assert.equal(load("media-bucket.json").Resources.MediaBucket.DeletionPolicy, "Retain");
});

test("bucket policy: plain HTTP and presigned links are refused, even for the operator", () => {
  assert.equal(can("OperatorRole", { action: "s3:GetObject", resource: obj("nisatsu/captures/a.mp4"), context: { "aws:SecureTransport": "false" } }), false);
  assert.equal(can("OperatorRole", { action: "s3:GetObject", resource: obj("nisatsu/captures/a.mp4"), context: { "s3:authType": "REST-QUERY-STRING" } }), false);
  assert.equal(can("OperatorRole", { action: "s3:GetObject", resource: obj("nisatsu/captures/a.mp4") }), true);
  const open = resolve(load("media-bucket.json"), { ...PARAMS, AllowPresignedUrls: "true" }).Resources.MediaBucketPolicy.Properties.PolicyDocument.Statement;
  assert.ok(!open.some((s: any) => s.Sid === "DenyPresignedUrls"), "the deny exists only while presigned links are off");
});

test("listing is limited to the project's prefix and shared/", () => {
  for (const role of ["OperatorRole", "WorkerRole", "ReaderRole"]) {
    const ls = (prefix: string) => can(role, { action: "s3:ListBucket", resource: B, context: { "s3:prefix": prefix } });
    assert.equal(ls("nisatsu/captures/"), true, role);
    assert.equal(ls("shared/"), true, role);
    assert.equal(ls(""), false, `${role} must not list the bucket root`);
    assert.equal(ls("otherapp/"), false, `${role} must not list another project`);
    assert.equal(ls("nisatsu-evil/"), false, `${role}: a prefix that merely starts with the project name`);
    assert.equal(can(role, { action: "s3:ListBucket", resource: B }), false, `${role}: unconditional listing`);
  }
});

test("reads: own project and shared/, never another project", () => {
  for (const role of ["OperatorRole", "WorkerRole", "ReaderRole"]) {
    assert.equal(can(role, { action: "s3:GetObject", resource: obj("nisatsu/brand/logo.png") }), true);
    assert.equal(can(role, { action: "s3:GetObjectVersion", resource: obj("shared/fonts/a.ttf") }), true);
    assert.equal(can(role, { action: "s3:GetObject", resource: obj("otherapp/brand/logo.png") }), false);
  }
});

test("writes follow the filing policy per role", () => {
  const put = (role: string, key: string) => can(role, { action: "s3:PutObject", resource: obj(key) });
  // operator
  for (const k of ["nisatsu/brand/a.png", "nisatsu/captures/a.mp4", "nisatsu/campaigns/launch/working/a.psd", "nisatsu/campaigns/launch/exports/a-v1.mp4", "nisatsu/runs/2026-10-01-abcdef/a.mp4", "shared/fonts/a.ttf"]) {
    assert.equal(put("OperatorRole", k), true, k);
  }
  for (const k of ["nisatsu/misc/a.png", "otherapp/captures/a.mp4", "a.mp4"]) assert.equal(put("OperatorRole", k), false, k);
  // worker: runs only
  assert.equal(put("WorkerRole", "nisatsu/runs/2026-10-01-abcdef/a.mp4"), true);
  for (const k of ["nisatsu/captures/a.mp4", "nisatsu/brand/a.png", "nisatsu/campaigns/launch/exports/a.mp4", "shared/a.png", "otherapp/runs/2026-10-01-abcdef/a.mp4"]) {
    assert.equal(put("WorkerRole", k), false, k);
  }
  // reader: nothing
  assert.equal(put("ReaderRole", "nisatsu/runs/2026-10-01-abcdef/a.mp4"), false);
});

test("nobody can delete objects, versions, or loosen the bucket", () => {
  for (const role of ["OperatorRole", "WorkerRole", "ReaderRole"]) {
    for (const action of ["s3:DeleteObject", "s3:DeleteObjectVersion"]) assert.equal(can(role, { action, resource: obj("nisatsu/runs/2026-10-01-abcdef/a.mp4") }), false, `${role} ${action}`);
    for (const action of ["s3:PutBucketPolicy", "s3:PutLifecycleConfiguration", "s3:PutBucketVersioning", "s3:DeleteBucket"]) assert.equal(can(role, { action, resource: B }), false, `${role} ${action}`);
  }
});

test("the account-wide external worker user can only assume project worker roles", () => {
  const user = bucketTpl.Resources.ExternalWorkerUser;
  assert.equal(user.Condition, "WorkerUser");
  const stmts = user.Properties.Policies[0].PolicyDocument.Statement;
  assert.deepEqual(stmts.flatMap((s: any) => list(s.Action)).sort(), ["sts:AssumeRole", "sts:TagSession"]);
  const assume = (role: string) => decide(stmts, { action: "sts:AssumeRole", resource: `arn:aws:iam::123456789012:role/${role}` }) === "allow";
  assert.equal(assume("agy-media-nisatsu-worker"), true);
  assert.equal(assume("agy-media-otherapp-worker"), true);
  assert.equal(assume("agy-media-nisatsu-operator"), false);
  assert.equal(assume("agy-media-nisatsu-reader"), false);
  assert.equal(assume("some-other-role"), false);
  assert.ok(!("ExternalWorkerUser" in roles), "no per-project worker user");
});

test("the optional operator key user can only assume its project's operator role", () => {
  const user = roles.OperatorKeyUser;
  assert.equal(user.Condition, "OperatorKeyUser");
  assert.equal(user.Properties.UserName, "agy-media-nisatsu-operator-key");
  const stmts = user.Properties.Policies[0].PolicyDocument.Statement;
  assert.deepEqual(stmts.flatMap((s: any) => list(s.Action)).sort(), ["sts:AssumeRole", "sts:TagSession"]);
  assert.equal(stmts[0].Resource, "<OperatorRole.Arn>");
});
