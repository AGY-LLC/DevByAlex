# Media handling

<!-- DevByAlex template. Copy to the app (next to its media code, e.g.
video/MEDIA_HANDLING.md), replace <project>, list the app's targets and
known gaps, and link it from the root AGENTS.md / CLAUDE.md with a rule that
agents read it before handling project media. -->

The one authoritative guide for <project>'s images, video and audio. Read it
before you create, retrieve, transform, or upload project media. Design and
voice rules stay in the app's design and brand docs.

## Where media lives

| Where | What |
|---|---|
| Git | source, renderer code, this guide, `media.config.json`, dependency files (`ref` + `versionId` + `sha256`), the migration ledger. No media binaries beyond small assets the build itself needs. |
| `s3://agyllc-marketing/<project>/` | brand, captures, campaign working files and approved exports, run folders. Private: no public access, no presigned links, TLS only, versioned, nothing deletable by any project role. |
| `s3://agyllc-marketing/shared/` | AGY-wide media every project reads. |
| `.media/` (gitignored) | run manifests and outputs awaiting upload, transfer state, previews. Keep until `media verify` passes. |

Filing: originals to `captures/` or `brand/` at once; renders into
`runs/<date>-<id>/` by `media render`; deliverables reach
`campaigns/<c>/exports/` only through `media promote` after a recorded
approval for the exact sha256.

## Setup

```bash
pnpm -C tools/media install
alias media="node tools/media/bin/media.mjs"
media doctor          # must pass before any upload
```

Credentials: an AWS SSO profile on a person's machine; a worker role or the
Passworder-held `AGY_MEDIA_AWS_*` key on workers. Never paste keys anywhere.
AWS provisioning: `tools/media/README.md`.

## Everyday

```bash
media pull <Target>                    # inputs, verified and version-pinned
media render <Target> [-- args]        # render, upload, verify, manifest
media push <file> --to captures/<path> # an original
media push --run <run-id>              # retry pending uploads
media approve <run> <output> --by <name> --reference <where>
media promote <run> <output> --campaign <c> --name <file-v1.ext>
```

Report render, upload and approval status separately. A render with
`upload: pending` is not stored.

## Targets

| Target | Inputs | State |
|---|---|---|
| | | |

## Known gaps

-
