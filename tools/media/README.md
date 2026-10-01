# media: project media in S3

A small TypeScript toolkit (library + CLI) for keeping an app's images, video
and audio in one private S3 bucket shared by every AGY project. It owns the
parts that are specific to us: project configuration, the filing policy,
dependency resolution for renderers, provenance manifests, approvals and
migration records. Transfers use the AWS SDK.

Vendored into an app by DevByAlex: `./install.sh <app> --with-media` copies
this directory to `<app>/tools/media` (and `--update` keeps it current). The
app owns everything outside it: `media.config.json`, its dependency files,
its migration ledger and its operating guide (`templates/MEDIA_HANDLING.md`
is the starting point).

No server, database, dashboard or sync daemon: every command runs on demand,
non-interactively, on a Mac, Linux/WSL, or a cloud worker.

## Layout

```
bin/media.mjs          CLI entry (Node >= 22.18 runs the TypeScript directly; no build)
src/index.ts           library entry: everything the CLI does, for other tools to reuse
src/cli.ts             commands, exit codes, --json output
src/lib/config.ts      media.config.json: project, bucket, environments, transfer tuning
src/lib/keys.ts        filing policy: key layout, run ids, which access level writes where
src/lib/s3.ts          clients and credentials (profile/SSO, default chain, or named keys; then AssumeRole)
src/lib/transfer.ts    conditional, verified uploads; resumable multipart; verified, resumable downloads
src/lib/deps.ts        per-target dependency files: resolve, download, pin versions
src/lib/runs.ts        render -> file -> verify; import; approve; promote
src/lib/manifest.ts    run manifests (provenance)
src/lib/migrate.ts     copy-in from old stores with a hash-deduplicated ledger
src/lib/doctor.ts      identity, account, permissions, pending work
src/adapters/          renderers: remotion, and `command` (any argv template)
infra/                 CloudFormation: the shared bucket, and per-project roles
test/                  unit, S3-protocol (moto) and IAM-policy tests
```

## Storage model

One bucket for all projects (default name `agyllc-marketing`):

| Prefix | Contents |
|---|---|
| `shared/` | AGY-wide media every project may read; written by operators only |
| `<project>/brand/` | the project's brand media and originals |
| `<project>/captures/` | original screenshots and recordings |
| `<project>/campaigns/<c>/working/` | campaign inputs and editable material |
| `<project>/campaigns/<c>/exports/` | approved deliverables, written only by `media promote` |
| `<project>/runs/<YYYY-MM-DD>-<id>/` | one execution's outputs and `manifest.json` |

Rules the code and the IAM policies enforce together:

- **Nothing is overwritten or deleted.** Uploads are conditional
  (`If-None-Match: *`); the same bytes at the same key are a verified no-op,
  different bytes are a conflict (exit 5). No role has `s3:DeleteObject`.
  The run manifest is the one object rewritten in place, and versioning keeps
  every earlier copy.
- **Verification is real.** Every upload carries a SHA-256 the server checks;
  afterwards the stored object's S3 checksum (full, or COMPOSITE for multipart)
  is compared with one recomputed from the local bytes. ETags are never
  treated as content hashes. `--deep` re-downloads and hashes.
- **References are stable**: bucket, key, versionId, sha256. Never a URL.
- **Drafts until approved.** Rendering or uploading approves nothing.
  `media approve` records who approved which exact sha256 and where;
  `media promote` refuses without it and never overwrites an export.
- **Locked down.** Block Public Access, owner-enforced ownership (no ACLs),
  TLS only, and by default the bucket policy denies presigned (query-string)
  requests, so no shareable link can exist. `preview` gives a verified local
  copy. Links need both `AllowPresignedUrls=true` on the bucket stack and
  `storage.allowPresignedUrls: true` in the app config, and then expire in at
  most an hour.

## AWS setup (once per account, then once per project)

The templates are plain CloudFormation, so no tooling beyond the AWS console
or CLI is needed. Use credentials that may create S3 buckets and IAM roles.

1. **Bucket** (once for all projects). Console: CloudFormation, Create stack,
   upload `infra/media-bucket.json`, stack name `agy-media-bucket`. Or:

   ```bash
   aws cloudformation deploy --stack-name agy-media-bucket \
     --template-file tools/media/infra/media-bucket.json \
     --capabilities CAPABILITY_NAMED_IAM --region us-east-1 \
     --parameter-overrides CreateExternalWorkerUser=true
   ```

   `CreateExternalWorkerUser=true` adds `agy-media-external-worker`, one IAM
   user for every project's workers outside AWS; leave it `false` if no such
   worker exists yet.

   Bucket names are global: if `agyllc-marketing` is taken, the stack fails
   cleanly; pass `--parameter-overrides BucketName=<another>` and put that name
   in each app's config.

2. **Project roles** (once per project):

   ```bash
   aws cloudformation deploy --stack-name agy-media-nisatsu \
     --template-file tools/media/infra/project-roles.json \
     --capabilities CAPABILITY_NAMED_IAM --region us-east-1 \
     --parameter-overrides ProjectPrefix=nisatsu \
       OperatorPrincipals=<your SSO role ARN, or arn:aws:iam::<account>:root>
   ```

   Outputs: `OperatorRoleArn`, `WorkerRoleArn`, `ReaderRoleArn`.

3. **Your machine**: an IAM Identity Center (SSO) profile, e.g. `agy-media`
   (`aws configure sso`), allowed to assume the operator role. No long-lived
   key is stored anywhere.

4. **Workers outside AWS** (only if `CreateExternalWorkerUser=true`): create
   one access key for `agy-media-external-worker` (IAM console, Security
   credentials) and store it ONCE as a shared Passworder secret
   (`"scope": "shared"` rows named `AGY_MEDIA_AWS_ACCESS_KEY_ID` /
   `AGY_MEDIA_AWS_SECRET_ACCESS_KEY`, kept in the global `alexos/shared`
   item). That user can do nothing except assume a project's worker role, and
   each worker role only reads its project and writes its run folders. The
   trade-off of one key: if it leaks, every project's media is readable and
   every project's run folders writable, but nothing can be deleted or
   overwritten and originals and exports are out of reach. Workers inside AWS
   use their own role instead (grant it `sts:AssumeRole` on the worker role).

5. Fill the app's `media.config.json`: `storage.accountId`, and each
   environment's `roleArn`. Then `media doctor` must pass, including
   `list outside project: denied, as intended`.

## Everyday commands

```bash
pnpm -C tools/media install           # once per checkout
alias media="node tools/media/bin/media.mjs"

media doctor                          # always first
media list captures/                  # discover (add --versions for history)
media pull <Target>                   # fetch + verify a target's declared inputs
media render <Target>                 # pin inputs, render, upload + verify, manifest
media push <file> --to captures/<path>
media push --run <run-id>             # retry a pending run's uploads
media verify --run <run-id> --deep
media approve <run-id> <output> --by Alex --reference <where>
media promote <run-id> <output> --campaign <c> --name <file-v1.mp4>
media preview <ref>                   # verified local copy
```

Every command takes `--env <name>` and `--json`. Exit codes: 0 ok, 2 usage or
config, 3 missing input, 4 verification, 5 conflict, 6 credentials, 7 denied,
8 render failed, 9 upload pending (render kept), 10 not approved.

## Tests

```bash
pnpm test                             # unit + IAM policy + (skipped) S3 tests
MEDIA_TEST_MOTO=$(which moto_server) pnpm test   # with a moto server (pip install 'moto[server]')
pnpm typecheck
```

moto speaks the S3 protocol (versioning, multipart, checksums, conditional
writes) but does not evaluate IAM, so permission boundaries are tested
against the templates themselves (`test/infra.test.ts`) and confirmed on a
real account by `media doctor`.
