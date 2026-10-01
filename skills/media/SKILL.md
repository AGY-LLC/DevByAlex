---
name: media
description: >-
  Handle an app's project media (images, video, audio) through the vendored media toolkit and its private S3 bucket: find and pull inputs, render with provenance, file verified outputs, record approvals, promote approved deliverables, and migrate media from old locations. Use whenever a task creates, retrieves, transforms, uploads, approves or moves project media (Remotion renders, demo recordings, screenshots, store assets, generated or licensed audio), or when the user says "upload the video", "where is the footage", "render and file it", "approve this cut", or "move our media to S3".
---

# Project media

The app's own guide is authoritative: read the file its root `AGENTS.md` /
`CLAUDE.md` names (usually `video/MEDIA_HANDLING.md` or `MEDIA_HANDLING.md`)
before acting. This skill is the generic procedure behind it.

## Preconditions

- `tools/media/` exists (installed by DevByAlex `./install.sh <app> --with-media`)
  and `media.config.json` sits at the repo root. If either is missing, stop
  and say so; do not improvise another storage location.
- `pnpm -C tools/media install`, then `node tools/media/bin/media.mjs doctor`.
  Every required check must pass before any upload. A failing `identity` or
  `list outside project` check means wrong credentials or loose permissions:
  stop and report, never work around it.

## Rules (hard)

1. **Never commit media binaries** except small assets the app build itself
   needs and already tracks. Media lives in S3; the repo holds references.
2. **Never delete or overwrite.** The toolkit refuses conflicts (exit 5);
   resolve by choosing a new key or run, not by forcing. Local copies stay
   until `media verify` passes for their stored version.
3. **Originals are irreplaceable.** Raw recordings and source screenshots go
   to `captures/` (or `brand/`, `shared/`) the moment they exist, with
   `media push <file> --to captures/<path>`. Never substitute other footage
   for a missing original, and never call something recovered without its
   key, versionId and sha256 as evidence.
4. **Rendered or uploaded is not approved.** Only the human approves, naming
   the output. Record it with `media approve` (exact sha256, `--by`,
   `--reference` to where it was said), then `media promote`.
5. **Report statuses separately**: processing (render), upload, approval. A
   successful render with `upload: pending` is not stored; say so.
6. **No links.** The bucket is private and refuses presigned URLs by default.
   Use `media preview <ref>` for a verified local copy.
7. **Credentials never appear** in output, manifests, docs or chat. If they
   are missing, `doctor` names the variable or profile; ask the human to
   provision it (Passworder for keys), do not request values in chat.

## Procedures

- **Find**: `media list <area>/` (`--versions` for history), `media status <run>`.
- **Inputs for a render**: `media pull <Target>` resolves every declared
  input, downloads by pinned version, verifies sha256. Exit 3 lists exactly
  what is missing and how to fix it.
- **Render and file**: `media render <Target> [-- renderer args]`. It pins
  inputs, renders, uploads to `<project>/runs/<date>-<id>/`, verifies, and
  stores the manifest. Exit 9 means the render is kept and the upload is
  pending: retry with `media push --run <run-id>` (idempotent).
- **A new target**: declare it in the app's dependency file (every external
  input with `ref` or `generate`) before rendering it.
- **Existing files** (a hand-made export, a recording session):
  `media import <files> --label <slug>` then `media push --run <run-id>`.
- **Migration**: write a plan (file, destination, old references), run
  `media migrate --plan <plan> --dry-run`, report size and count to the
  human before a substantial migration, then run it. The ledger dedups by
  sha256 and records old -> new; commit it.

## Reporting

End with: run id(s), each output's key + versionId + sha256 and its upload
status, approval status, anything left pending and the exact command that
retries it. State what was verified and how (`verifiedBy`).
