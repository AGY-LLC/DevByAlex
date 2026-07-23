# Secrets via passworder (the secrets MCP)

**passworder** is a user-scoped MCP server that manages app secrets by NAME
only. Agents never see values: values move server-side between 1Password (the
source of truth) and the places apps run: Vercel env vars, Fly secrets,
GitHub Actions secrets, and git-ignored local env files. Repo:
`~/dev/Startups/AlexOS/passworder`.

**Availability check**: the tools are named `status`, `list_secrets`,
`generate_secret`, `request_secret`, `sync_secrets`, `verify_secrets`,
`write_env_file`, `import_env_file`, `copy_secret`, `delete_secret`,
`register_project`. If they aren't connected in this session, fall back to the
old behavior: a needed secret is a human blocker recorded in STATUS. Never
simulate or hand-roll what the MCP would do.

## The contract (non-negotiable)

- **No agent ever sees, prints, logs, or commits a secret value.** Work with
  names + environments only. Never `cat` a materialized env file, never echo
  env vars, never paste values into code, tests, STATUS, or commits.
- **Three tiers**: `local` (local runs and agent self-testing), `staging`
  (the live QA deploy), `prod`. Only `local` can ever be materialized to disk
  (`write_env_file`); staging/prod values exist solely in 1Password and on the
  deploy platforms. Local testing uses dedicated local-tier keys, never
  staging or prod values.
- **The manifest is the map**: `docs/secrets.manifest.json` (committed,
  value-free) lists every secret's name, class, components, envs, and an
  `obtain` hint for human-provided keys. Maintain it like any other file:
  every new secret gets a manifest entry in the same unit of work.

## Classes → playbook

| Class | Examples | What the agent does |
|---|---|---|
| `generated` | `CRON_SECRET`, signing keys, peppers, admin/service tokens | `generate_secret` per env: fully self-serve, no human involved. `overwrite=true` only for deliberate rotation (then re-sync every target). |
| `provided` | `OPENAI_API_KEY`, `STYTCH_SECRET`, `RESEND_API_KEY`, DSNs | `request_secret` with an `obtain` note (e.g. "resend.com → API Keys"), add the manifest entry, **keep working on units that don't need it**, poll `list_secrets` (state flips `pending_human` → `set` when Alex fills it in 1Password). |
| `public` | `NEXT_PUBLIC_*`, feature flags, model names | Not a secret: lives in committed env files/config; list in the manifest as `public` for completeness only. |

A `provided` secret is a **blocker only for the units that need it, only
until Alex fills it**. File the request the moment the need is known (scaffold
or feature start), so it's usually `set` before the dependent unit runs.

## Standard flows

- **Project onboarding** (scaffold/init): `register_project` with components
  matching the deploy story in `pba.yml`, e.g. `server` → `{type:'vercel',
  project}`, `ai` → `{type:'fly', apps:{staging,prod}}`, `ci` → `{type:'github',
  repo:'owner/name'}`. Stamp `docs/secrets.manifest.json`. Then
  `generate_secret` everything generateable (all three envs) and
  `request_secret` the provided ones.
- **Local validation**: `write_env_file` (local tier, e.g. `web/.env.local`)
  → run the app/tests against it. The file must already be gitignored; the
  tool refuses otherwise. Treat the file as opaque runtime input.
- **Before any staging/prod deploy**: `sync_secrets <project> staging|prod`,
  then `verify_secrets`: the drift report (`missing_on_target` /
  `missing_in_1password` / `on_target_but_unmanaged`) must be clean for the
  names the deploy needs. CI-level secrets (`VERCEL_TOKEN`, `FLY_API_TOKEN`,
  `EXPO_TOKEN`, `ANTHROPIC_API_KEY`) are `provided` + component `ci`, and get
  exactly **one** env in the manifest (GitHub secrets are repo-level).
- **Existing env files** (onboarding a mature repo): `import_env_file` per
  env (the server reads the file from disk; values never enter context).

## Never

- Hardcode, guess, or placeholder a credential to get past a missing secret.
- Read back a materialized env file, or move staging/prod values to disk.
- Put a value in `pba.yml`, workflow YAML, or `.env.example` (names only).
- Delete or rotate without re-syncing every affected target in the same unit.
