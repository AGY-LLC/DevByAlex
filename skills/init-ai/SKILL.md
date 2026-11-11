---
name: init-ai
description: "Initialize or integrate the DevByAlex autonomous build workflow into an app repo. Takes a path to the app folder (or uses cwd), detects the repo's current state (blank, scaffolded, partway, or mature), stamps the docs/ workflow files (SPEC, IMPLEMENTATION_GUIDE, STATUS, feature cards, wireframes, acceptance tests) without clobbering existing work, then reconciles STATUS.md and the TODO/next-action queue against what is actually already done versus not. Routes to the correct next stage. Works on brand-new empty repos and existing codebases alike. Use when the user says 'init-ai', 'set up the DevByAlex workflow', 'initialize this app for the workflow', or points at a folder to bring under the autonomous build process."
argument-hint: "[path to the app folder: defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# init-ai: Bootstrap or integrate the DevByAlex workflow

## Goal

The app repo is workflow-ready: DevByAlex is provisioned into the app's own
`.claude/`, the `docs/` control files exist without any existing work
overwritten, `docs/STATUS.md` says what the repo has actually proven (not
template defaults), and the user gets the one next command. It works the same
on a blank repo or a half-built one, sets up state only and builds nothing.

The target is the first argument, else the cwd; confirm the absolute folder
when ambiguous, and ask before creating one that doesn't exist. Templates and
knowledge resolve at `../../templates/` and `../../knowledge/` from this skill,
which works both from the source repo and from an app it already provisioned;
the provisioner is `install.sh` at the source repo root (`../../`).

## Done when

- **Provisioned:** `<repo-root>/install.sh <app>` copied `skills/`, `agents/`,
  `templates/` and `knowledge/` into `<app>/.claude/` (`--symlink` only when
  the user wants a live link for dogfooding on this machine). Re-runs re-sync
  instead of duplicating.
- **Inventoried** (read-only): VCS state; stack (manifest, framework, package
  manager, TypeScript, ORM, test runner, lint, CI); built surfaces (routes,
  components, API, schema, payments); auth presence, kept separate from
  validation, which code can't show; existing screens; UI copy with decision
  leakage (universal rule 31: explanatory paragraphs, spec or ADR text,
  doc-style headings); existing tests; existing DevByAlex docs (present means
  integrating: read and preserve them); scattered feature or decision docs
  outside the workflow files; orphans (dead routes and exports, unused deps,
  scratch scripts, `.bak` copies, superseded docs), split into substantial
  work and trivial litter; `CLAUDE.md` and `README.md` conventions.
- **Classified** as blank (no app code), scaffolded (skeleton and tooling, no
  features), partial (some features or auth) or mature (broad coverage, mostly
  validation and launch work left).
- **Stamped:** each template below is copied into `docs/` only where the
  destination is absent, with `{{APP_NAME}}`, `{{DATE}}` and stack filled and
  dates absolute:

  | Template | Destination |
  |----------|-------------|
  | `STATUS.md`, `BUGS.md`, `TWEAKS.md`, `TODO.md`, `FEEDBACK.md`, `DECISIONS.md`, `AI_WORKFLOW.md`, `SPEC.md`, `IMPLEMENTATION_GUIDE.md`, `ACCEPTANCE_TESTS.md`, `secrets.manifest.json` | same name in `docs/` |
  | `auth-feature-card.md` | `docs/features/authentication.md` |
  | `feature-card.md` | `docs/features/_TEMPLATE.md` |
  | `adr-README.md`, `adr-feature.md` | `docs/adr/README.md`, `docs/adr/_TEMPLATE.md` |
  | `wireframes-README.md` | `docs/wireframes/README.md` |

- **Backfilled additively** into files that already exist, appending only
  what is missing and leaving every line and checkbox as found: in
  `SPEC.md`, the **Auth & access**, **Legal, privacy & compliance** and **SEO &
  discoverability** sections as `(needs review)` stubs; in `STATUS.md`, the two
  hard gates, the brand and feature-ADR plan rows, the no-open-bugs/tweaks,
  observability, legal, accessibility, SEO and prose launch rows and
  `## Live (post-launch)`, all unchecked. A section that may exist under
  other wording is flagged, not duplicated.
- **Secrets:** a repo without a real `docs/secrets.manifest.json` gets the
  one-time passworder migration when that MCP is connected
  (`register_project` with components matching `pba.yml`, the manifest from
  `.env.example` and env usage, values onboarded with `import_env_file` or the
  human-run `scripts/migrate-environment.sh`; values never enter context), else
  a pending STATUS note (`knowledge/stack/secrets-passworder.md`).
- **STATUS reconciled from reality** per the rules under Decisions.
- **Next action and queues seeded:** `## Next action` is the one step from the
  routing table; `## Blockers / open questions` holds whatever needs a human;
  `docs/BUGS.md` has one `[show-dont-tell]` entry per leaking screen (or the
  summary calls for a redesign pass, `/uiux-audit` or a scoped `fix-errors`
  plus design-critic sweep, when leakage is pervasive) and one `[orphan]`
  entry per cluster of trivial orphans; substantial orphaned work is a
  keep-or-remove question for Alex in blockers, and a keep is recorded (ADR
  `O`-entry or `docs/DECISIONS.md` line) so sweeps don't re-flag it.
- **Wired in:** the user was offered a `## DevByAlex workflow` section in
  `CLAUDE.md` pointing at `docs/AI_WORKFLOW.md` and `docs/STATUS.md`, and a
  recommendation to commit `<app>/.claude/{skills,agents,templates,knowledge}`
  for any repo run unattended or in CI.
- **Reported:** path, stack and maturity; files created vs. left alone;
  backfilled stubs; stage and the one next action; what is present but
  unvalidated (auth, count of validation-pending features) with the note that
  the goal run starts by validating and hardening, not building; the ADR
  ledger and scattered docs slated for consolidation; the working branch (or
  that none exists); blockers and `(needs review)` items.

## Decisions (and why)

- **Project scope, never `~/.claude`, and copy by default.** Why: user scope
  would load the workflow into every repo and can't pin each app's STATUS; a
  copy survives clone and CI, so any checkout needs no MCP token or network
  brain (only plan-time wireframing wants Penpot). Only DevByAlex-managed names
  are touched.
- **Presence is not validation.** Authentication is checked only when a doc
  records it was security-validated; otherwise it gets "(auth present: needs
  validation)". Feature rows: Impl ✅ `(needs review)` when code exists, Tests ✅
  only when tests exist, Feat-Valid, Integ-Valid, E2E and Aligned stay ⬜
  (E2E `n/a` only for features with no user-facing flow), and Status is
  `in-progress`, not `done`. Why: a shipped but never validated feature is not
  done, and the board must not reward mere presence.
- **Stage from maturity:** `plan` for an empty repo, `dev` for real features.
  Plan rows are checked only for docs with real content; **Design style
  chosen** only when `docs/DESIGN.md` records a style (an existing app's
  de-facto style is `(needs review)`; changing it is `/plan-design restyle`).
  Scaffold is checked when tooling, skeleton and CI exist. Launch rows only
  when the artifact exists and passed; on integration the compliance rows and
  hard gates stay unchecked as not yet verified, not broken.
- **The ADR backfill comes before any feature work on an existing repo**
  (`/plan-guide adr-backfill`: every feature gets `docs/adr/<NN>-<slug>.md`,
  inferred entries `(needs review)`, scattered docs consolidated or removed).
  Why: without a record of what's intentional, validators flag conscious
  choices as gaps. The doc set is closed
  (`knowledge/workflow/doc-maintenance.md`): an extra doc is consolidated,
  kept by a recorded decision, or queued for removal.
- **A dedicated working branch** (for example `staging`, passed to
  `/dev-goal --branch` when it isn't the current one). Why: dev skills push
  straight to the working branch, never a protected `main`.
- **Routing**, first match wins:

  | Repo state | Next action |
  |------------|-------------|
  | blank, no spec | `/plan-spec` |
  | code, no spec | `/plan-spec reverse`, then `/plan-guide`, then re-run |
  | spec, public-facing, no `docs/BRAND.md` | `/marketer-brand-generation`, then `/plan-guide` |
  | spec, no guide | `/plan-guide` |
  | guide, no UI, no design style | `/plan-design` |
  | guide and style, no wireframes, no UI | `/plan-wireframes` (needs Penpot MCP) |
  | guide, no wireframes, UI exists | `/plan-wireframes capture` |
  | guide and wireframes, gates unchecked | Alex reviews and approves; dev is blocked |
  | gates approved, no scaffold | `/dev-scaffold` |
  | scaffolded, no auth | `/dev-auth` |
  | auth present, unvalidated | `/dev-auth validate` |
  | any feature missing its ADR | `/plan-guide adr-backfill` |
  | auth validated, ADRs complete, features remain | `/dev-goal` (validate existing features first, then build) |
  | all features built and validated | `/launch-observability`, `/launch-acceptance`, `/launch-verify`, then `/launch-compliance` and `/launch-readiness` |
  | launched with real users | `/live-triage`, then `/dev-goal` |

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Never overwrite an existing `docs/*` file without explicit confirmation.
- Never check an approval gate or a hard launch gate; they are Alex's.
- Never build anything or delete anything here; this sets up state and
  routes.
- Re-runs are idempotent: re-reconcile, never duplicate rows or re-stamp.
- Keep observed facts apart from guesses; tag every inference `(needs
  review)`, and keep STATUS short, with detail in cards and the log.
