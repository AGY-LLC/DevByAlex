---
name: init-ai
description: "Initialize or integrate the DevByAlex autonomous build workflow into an app repo. Takes a path to the app folder (or uses cwd), detects the repo's current state (blank, scaffolded, partway, or mature), stamps the docs/ workflow files (SPEC, IMPLEMENTATION_GUIDE, STATUS, feature cards, wireframes, acceptance tests) without clobbering existing work, then reconciles STATUS.md and the TODO/next-action queue against what is actually already done versus not. Routes to the correct next stage. Works on brand-new empty repos and existing codebases alike. Use when the user says 'init-ai', 'set up the DevByAlex workflow', 'initialize this app for the workflow', or points at a folder to bring under the autonomous build process."
argument-hint: "[path to the app folder: defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# init-ai: Bootstrap or integrate the DevByAlex workflow

The entry point for every project. Given a path to an app folder, this skill
makes the repo workflow-ready: it **provisions the workflow into the app's own
project scope** (`<app>/.claude/`), writes the `docs/` control files the rest of
the workflow reads, then sets each stage's status and the next-action queue
**from what the repo has actually done**, so it works the same on a blank repo
or a half-built one.

The workflow is installed **per project, never user-scoped** (`~/.claude`). User
scope would load the workflow into every repo and couldn't keep each app's
`docs/STATUS.md` context pinned to that app. Project scope means the skills load
only inside the target app, and a headless/CI run there carries the app's
own workflow logic and reads the app's own STATUS to know its stage and next
action.

It does **not** build anything. It sets up state and routes you (or the
goal run) to the right next stage. Respect the approval gates: never advance
into the dev stage on your own.

## When to activate

- The user runs `/init-ai <path>` or says "set this app up for the workflow."
- A new folder needs to come under the autonomous build process.
- An existing repo should be integrated (backfill spec/status from code).
- Re-run safely any time to re-reconcile STATUS against the current code.

## Inputs and prerequisites

- **Target path**: the first argument, else the current working directory.
  Confirm it with the user if it's ambiguous.
- The DevByAlex **templates** live at `../../templates/` relative to this skill
  dir. That path resolves both when this skill runs from the source repo
  (`<repo>/skills/init-ai` → `<repo>/templates/`) and when it runs from an app it
  has already provisioned (`<app>/.claude/skills/init-ai` →
  `<app>/.claude/templates/`). Read them from there; copy, don't symlink.
- The **provisioner** is `install.sh` at the source repo root. It copies this
  repo's `skills/`, `agents/`, `templates/`, and `knowledge/` into
  `<app>/.claude/`. Resolve the repo root from this skill's real location
  (`../../` from the skill dir).
- The vendored **best-practice playbooks** live at `../../knowledge/` (same
  dual-path resolution as `../../templates/`): `knowledge/practices/<key>.yaml`,
  `knowledge/stack/*.md`, `knowledge/checklists/*.md`. The later stages read these
  directly: there is no external brain to call.

## Workflow

### Step 1: Resolve and confirm the target
Resolve the path. If it doesn't exist, ask whether to create it. State plainly
which absolute folder you're about to initialize and that you will not
overwrite existing files without asking.

### Step 1.5: Provision the workflow into the app (project scope)
Install the workflow into the target's own `.claude/` so it loads only in that
app and a headless run there is self-sufficient. Run the source repo's provisioner:

```bash
<repo-root>/install.sh <target-app>          # copy (default): self-contained, commit-able
<repo-root>/install.sh <target-app> --symlink # only for dogfooding on this machine
```

This copies `skills/`, `agents/`, `templates/`, and `knowledge/` into
`<app>/.claude/`. Default to **copy**: a copied app survives clone/CI and can
commit its workflow; symlink only when the user explicitly wants a live link back
to the source repo on this machine. It only touches the DevByAlex-managed names,
so the app's own unrelated `.claude` skills are left alone. If a target app
already has these (re-run / integration), this is idempotent: re-copy to update,
don't duplicate.

**No external dependency for a cloud/CI run.** Everything the workflow needs is
vendored into the committed `<app>/.claude/`: the native stage skills, the reused
library skills (`scout`, `fix-errors`, `issue-checker`, `test-suite-developer`,
`staging-smoke-test`, `launch-readiness`, `prose-check`, `seo-audit`,
`accessibility-critique`, `marketer-brand-generation`, `marketer-copywriting`),
and the best-practice `knowledge/`. A committed checkout is fully self-sufficient,
a run on any runner needs no MCP token or network brain. (The wireframe
stage still wants a write-capable Figma MCP, but that's plan-time and human-run,
not part of the autonomous dev loop.)

### Step 2: Detect repo state (read-only pass)
Inventory the target without changing anything. Capture:
- **VCS**: is it a git repo? current branch, has commits?
- **Stack**: `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` /
  `Gemfile`; framework (Next.js, Expo, Vite, Astro…); package manager;
  TypeScript; ORM (Prisma/Drizzle); test runner; lint/format config; CI under
  `.github/workflows`.
- **Surfaces already built**: `src`/`app` routes, components, API handlers,
  a database schema/migrations, payments (Stripe).
- **Auth**: is there a real auth implementation (next-auth/Clerk/Lucia/Supabase/
  session/jwt/middleware)? Record **presence**, but note you cannot tell from
  code whether it was ever *security-validated*. Auth-present and auth-validated
  are different facts; keep them separate (this drives Step 5).
- **Existing UI / screens**: enumerate the screens that already exist (pages,
  routes, top-level views). If there's real UI, the wireframe artifact should
  later be **captured** from it, not generated from scratch (drives Step 6).
  While enumerating, also scan the UI copy for **decision leakage** (universal
  rule 31, show-don't-tell): descriptive paragraphs under section headers, spec/
  ADR rationale typed into screens, headings phrased like internal docs, empty
  states or settings that read like documentation. List each offending
  screen: this seeds the show-don't-tell sweep in Step 6.
- **Existing tests**: unit/integration/e2e, and whether they pass if cheap to
  check. Note that passing tests don't tell you whether they trace to the spec.
- **Existing DevByAlex docs**: `docs/STATUS.md`, `docs/SPEC.md`,
  `docs/IMPLEMENTATION_GUIDE.md`, `docs/features/`, `docs/adr/`,
  `docs/wireframes/`, `docs/ACCEPTANCE_TESTS.md`. If present, you are
  **integrating**, not bootstrapping: read them and preserve their content.
- **Scattered feature docs**: any pre-existing ad-hoc docs about features or
  decisions that live outside the workflow files: `NOTES.md`, `docs/design-*.md`,
  `ARCHITECTURE.md`, decision writeups in the README, comments-as-docs folders.
  Inventory them; they'll be consolidated into `docs/adr/` (or removed if
  irrelevant) during the ADR backfill, so the repo keeps one source of truth.
  The doc set is **closed** (`knowledge/workflow/doc-maintenance.md`): a
  pre-existing extra doc is either consolidated into its owner file, kept via
  a recorded decision in `docs/DECISIONS.md`, or queued for removal: never
  silently adopted. Bloat inside workflow docs (duplicated facts, superseded
  sections, narration) is inventoried the same way and queued, not kept.
- **Orphaned artifacts**: files and code nothing references: dead routes/
  components, unused exports/dependencies, scratch or debug scripts,
  `.bak`/`.old` copies, stale generated artifacts, superseded docs. Inventory
  them (this is a read-only pass: don't delete yet); this seeds the orphan
  sweep in Step 6. Note which look like **substantial work** (a part-built
  feature, a replaced module, real content) versus trivial litter: the two
  get different treatment.
- A `CLAUDE.md` / `README.md`: read for declared conventions and intent.

### Step 3: Classify maturity
Pick one and record it in the summary:
- **blank**: empty or only config/readme, no app code.
- **scaffolded**: project skeleton + tooling exist, no real features yet.
- **partial**: some features/auth built; others missing.
- **mature**: broad feature coverage; mostly needs validation/launch work.

### Step 4: Stamp the workflow files (never clobber)
Copy each template from `../../templates/` into the target's `docs/`, **only if
the destination doesn't already exist**. If a file exists, leave it and note it
in the summary (offer to merge, don't overwrite silently):

| Template | Destination | Notes |
|----------|-------------|-------|
| `STATUS.md` | `docs/STATUS.md` | the control file `dev-goal` reads |
| `BUGS.md` | `docs/BUGS.md` | the bug log the goal run drains before any build unit |
| `TWEAKS.md` | `docs/TWEAKS.md` | the cosmetic light lane (`/dev-tweak`) drained after bugs |
| `TODO.md` | `docs/TODO.md` | the planned-change lane (`/dev-todo`) drained after tweaks; most post-stable iteration lives here |
| `FEEDBACK.md` | `docs/FEEDBACK.md` | the post-launch inbox `/live-triage` converts into bug/tweak/todo entries |
| `DECISIONS.md` | `docs/DECISIONS.md` | the local decision log stages append to (replaces the old brain write-back) |
| `AI_WORKFLOW.md` | `docs/AI_WORKFLOW.md` | per-repo pointer to the process |
| `SPEC.md` | `docs/SPEC.md` | stub if blank; keep if it exists |
| `IMPLEMENTATION_GUIDE.md` | `docs/IMPLEMENTATION_GUIDE.md` | stub if blank |
| `feature-card.md` | `docs/features/_TEMPLATE.md` | copied per-feature later |
| `adr-README.md` | `docs/adr/README.md` | the ADR contract: consult before change, confirm before breaking a decision |
| `adr-feature.md` | `docs/adr/_TEMPLATE.md` | copied per-feature by `/plan-guide` (and during backfill) |
| `wireframes-README.md` | `docs/wireframes/README.md` | screen index (Figma frames or captured-from-code) |
| `ACCEPTANCE_TESTS.md` | `docs/ACCEPTANCE_TESTS.md` | stub if blank |

Fill placeholders (`{{APP_NAME}}`, `{{DATE}}`, stack) from Step 2. Convert any
relative date to an absolute one.

**Additive backfill into files that already exist (never rewrite).** A repo
integrated before a workflow update, or with hand-written `docs/`, will have a
`SPEC.md`/`STATUS.md` that predates newer sections. Do **not** regenerate the
file. Instead, check whether these specific additions are present and **append
only the missing ones**, leaving every existing line and checkbox state exactly
as found:
- `docs/SPEC.md`: the **Legal, privacy & compliance** and **SEO &
  discoverability** sections. Append them as stubs tagged `(needs review)` if
  absent; if present, leave them.
- `docs/STATUS.md`: the two hard gates (`Legal & compliance passed`,
  `Accessibility (WCAG 2.2 AA) passed`), the `Brand foundation (docs/BRAND.md)`
  plan row, the `Feature ADRs seeded (docs/adr/)` plan row, the no-open-bugs/
  tweaks launch row, the `Observability wired` launch row, the four launch rows
  (legal/compliance, accessibility, SEO, prose), and the `## Live (post-launch)`
  section. Add any that are missing **unchecked**; never
  alter the state of a box that's already there.
- `docs/BUGS.md`, `docs/TWEAKS.md`, `docs/FEEDBACK.md`: if the repo predates
  any of these logs, copy the template in (additive new files, so the "don't
  clobber" rule means: create each only if absent, never overwrite an existing
  one).
- `docs/adr/`: if the repo predates the ADR folder, stamp `README.md` +
  `_TEMPLATE.md` in. The per-feature ADR files themselves are **backfilled, not
  stamped**, that's real analysis work (see Step 6): every feature in the table
  needs its ADR written before feature work proceeds.
Note every backfilled item in the summary so the user can fill the new spec
stubs. If unsure whether a section is "really" present (e.g. worded differently),
flag it for the user rather than appending a duplicate.

### Step 5: Reconcile STATUS from reality
This is the part that makes integration work. Walk what you found in Step 2 and
set each checkbox/row in `docs/STATUS.md` to match the code, not the template
defaults:

- **Stage**: choose `plan` / `dev` / `launch` based on maturity. A repo with
  real features sits in `dev`; an empty one sits in `plan`.
- **Gates**: leave approval gates (spec/guide/wireframes approved) **unchecked**
  unless an existing doc explicitly records Alex's approval. Never self-approve.
  The two **hard launch gates** (`Legal & compliance passed`, `Accessibility
  (WCAG 2.2 AA) passed`) also stay **unchecked**: they need a clean
  `/launch-compliance` scan plus Alex's sign-off, neither knowable from code.
- **Plan rows**: check `SPEC.md` / `IMPLEMENTATION_GUIDE.md` / wireframes only
  if those docs exist with real content. Check **Design style chosen** only if
  `docs/DESIGN.md` records a committed "Style choice"; for an existing app with
  UI, note the de-facto style as `(needs review)` rather than checking it,
  changing the look is a `/plan-design restyle`, not an integration checkbox.
- **Dev rows**: check **Scaffold** if tooling/skeleton/CI exist. For
  **Authentication**, the box means *built **and** validated*, so **leave it
  unchecked when auth code exists but has not been through the security loop.**
  Don't reward mere presence: add a note "(auth present: needs validation)" and
  route a validation pass (Step 6). Only check it if an existing doc records that
  auth was actually security-validated.
- **Feature table**: for an existing repo, enumerate the features you can
  identify from routes/modules/nav and add a row per feature. Fill the columns
  honestly from what code can prove and **no more**:
  - **Impl** → ✅ `(needs review)` when the feature's code clearly exists.
  - **Tests** → only ✅ if tests for that feature actually exist (and note you
    can't tell if they trace to the spec).
  - **Feat-Valid / Integ-Valid / E2E / Aligned** → leave **⬜**. These mean
    "passed the validators / golden-path flow ran green / aligned to an
    approved guide+wireframes," none of which can be known from code. A
    shipped-but-never-validated feature is impl-present, validation-pending:
    not done. (E2E: mark `n/a` where the feature clearly has no user-facing
    flow; an existing acceptance flow file alone is not a green run.)
  Mark every inferred value `(needs review)`; keep observed facts and guesses
  separate. Set each feature's **Status** to `in-progress` (validation pending),
  not `done`, unless validation evidence exists.
- **Launch rows**: check only if the corresponding artifact exists and passed.
  The compliance rows (legal/compliance, accessibility, SEO, prose) and the two
  hard gates stay **unchecked** on integration: `/launch-compliance` hasn't run
  yet. Frame this as *not-yet-verified*, **not** *broken*: an existing app isn't
  regressed by mounting the workflow; it simply gains explicit compliance gates it
  must pass (via `/launch-compliance` → `fix-errors`) before it's marked
  ship-ready.

For a blank repo this is trivial (almost everything unchecked). For an existing
repo, this backfills the board so the workflow can pick up mid-stream, and the
honest result is that a working app starts with most validation columns empty.

**Set expectations for `partial`/`mature` repos.** Because validation columns
start empty, the **first phase of the goal run is validate-and-harden, not new
building**: it re-certifies existing auth and features (tests backfilled from the
spec, `scout`/validators run, fixes applied) before adding anything new. Say this
plainly in the summary so "`/dev-goal` will finish my app" maps to "it will
first prove what's there is correct." This is how existing code earns its way to
launch-ready.

### Step 6: Seed the next-action queue and TODO
Set the single `## Next action` line in `STATUS.md` to the correct next step
for this repo's state, and populate `## Blockers / open questions` with
anything that needs a human. The routing rules:

| Repo state | Next action |
|------------|-------------|
| blank, no spec | `/plan-spec`: run the interview |
| existing code, no spec | backfill: `/plan-spec reverse` (infer spec from code), then `/plan-guide`, then re-reconcile |
| has spec, **public-facing, no `docs/BRAND.md`** | `/marketer-brand-generation`: brand foundation (seeds SEO + voice), then `/plan-guide` |
| has spec (+ brand if public-facing), no guide | `/plan-guide`: expand the approved spec |
| has guide, **no UI yet, no design style** | `/plan-design`: pick the named style (PRIMARY × SECONDARY) → `docs/DESIGN.md`, then wireframes |
| has guide + style, no wireframes, **no UI yet** | `/plan-wireframes`: generate (needs Figma MCP), drawn to the chosen style |
| has guide, no wireframes, **UI already exists** | `/plan-wireframes capture`: inventory existing screens (no Figma needed); `/plan-design restyle` only if changing the look |
| guide + wireframes done, **gates unchecked** | Tell Alex to review & approve: dev is blocked |
| gates approved, no scaffold | `/dev-scaffold` |
| scaffolded, no auth at all | `/dev-auth` (build) |
| scaffolded, **auth present but unvalidated** | `/dev-auth validate`: audit + harden the existing auth |
| features identified, **any feature missing its ADR** | `/plan-guide adr-backfill`: write `docs/adr/<NN>-<slug>.md` for **every** feature (and consolidate scattered feature docs) before any feature work |
| auth validated, ADRs complete, features remain | `/dev-goal` (or `/feature-loop <feature>`): validate/harden existing features first, then build missing ones |
| all features built + validated | `/launch-observability` (wire monitoring/analytics) → `/launch-acceptance` → `/launch-verify` (run the suite against staging), then `/launch-compliance` (legal/a11y/SEO/prose: drives the hard gates) + `/launch-readiness` |
| launched, real users in production | `/live-triage`: drain `docs/FEEDBACK.md` into the bug/tweak/todo lanes, then `/dev-goal` to work them |

If integrating a code-first repo with no spec, recommend backfilling the spec
and guide **from the code** before any further building, so the goal run has a
target to validate against.

**Queue the show-don't-tell sweep if Step 2 found decision leakage.** For each
screen flagged in Step 2 (explanatory paragraphs, spec/ADR text in the UI), log
an entry in `docs/BUGS.md`: one per screen, tagged `[show-dont-tell]`, naming
the offending copy and file. The goal run drains these before building
anything new; the fix standard is **restructure the section so layout,
hierarchy, and labels carry the meaning, don't just shorten the paragraph**,
and the reworked screens must pass the design-critic screenshot gate like any
design change. If the leakage is pervasive (most screens read like
documentation), note in the summary that the repo needs a show-don't-tell
redesign pass across its surfaces (`/uiux-audit` if available, else a scoped
sweep through `fix-errors` + design-critic) rather than screen-by-screen bug
fixes.

**Queue the orphan sweep if Step 2 found orphans.** Log one `docs/BUGS.md`
entry tagged `[orphan]` per cluster of trivial orphans (dead files, unused
exports/deps, scratch scripts, stale copies), naming the paths: the goal run
drains these before building anything new, and the fix is removal. Anything
flagged as **substantial orphaned work** goes to STATUS ›
`## Blockers / open questions` as a keep-or-remove question for Alex instead,
never straight to a delete queue. If he keeps it, record the keep (an ADR
`O`-entry or a `docs/DECISIONS.md` line) so later sweeps don't re-flag it.

**The ADR backfill is a hard prerequisite for feature work on an existing repo.**
Bringing the ADR system to a repo with existing features means **every feature
in the table gets its `docs/adr/<NN>-<slug>.md` before the loop touches any of
them**: otherwise the validators have no record of what's intentional and will
flag conscious choices as gaps. The backfill (owned by `/plan-guide
adr-backfill`) infers each feature's decisions and deliberate omissions from
the code and any existing docs, tags every inferred entry `(needs review)`, and
**consolidates scattered feature docs** (design notes, ad-hoc decision writeups)
into the ADRs: deleting the originals once absorbed, or removing them outright
if irrelevant. Note in the summary that the `(needs review)` entries want Alex's
eyes; an unreviewed backfilled ADR still beats no record.

**Pick a working branch for the dev stage.** The dev skills push straight to the
working branch (no PRs). For an existing repo with a real `main`, tell the user
to use a dedicated iteration branch (e.g. `staging`), and to pass
`--branch <name>` to `/dev-goal` when the current branch isn't it, so goal runs
don't push to a protected default. Note this in the summary and
`## Blockers / open questions` if no such branch exists yet.

### Step 7: Make the workflow discoverable + ready to run
The skills are already provisioned into `<app>/.claude/` (Step 1.5), so they load
when the app is opened in Claude Code. To finish wiring it in:
- Offer to add a short `## DevByAlex workflow` section to the repo's
  `CLAUDE.md` pointing at `docs/AI_WORKFLOW.md` and `docs/STATUS.md`.
- Decide whether `<app>/.claude/{skills,agents,templates,knowledge}` should be
  committed (so clones and CI carry the workflow) or gitignored (machine-local
  only). Recommend committing for any repo you'll run unattended on a remote/CI.
- To advance the build, route them to **`/dev-goal`**: hand it the goal and it
  pushes until the goal is met. The committed `.claude/` is fully self-contained:
  skills and best-practice `knowledge/` all travel with it, so any checkout
  (local or CI) needs no MCP token or network brain.

### Step 8: Report
Print a tight summary:
- Absolute path initialized and detected stack + maturity.
- Which files were created vs. already present (and thus left alone).
- The reconciled stage and the **one** next action.
- For an existing repo: **what's present but unvalidated**: auth, and the count
  of features that are impl-present/validation-pending, and the explicit note
  that the goal run's first phase is validate-and-harden, not new building.
- The **ADR ledger**: which features have an ADR vs. need backfill, and any
  scattered feature docs slated for consolidation into `docs/adr/` or removal.
- The working branch to use for the dev stage (and a flag if none exists yet).
- Any blockers/open questions and anything marked `(needs review)`.

## Rules

- **Never overwrite** an existing `docs/*` file without explicit confirmation.
  Bootstrapping is additive.
- **Project scope only.** Install into `<app>/.claude/`, never `~/.claude`. Only
  touch the DevByAlex-managed skill/agent names; leave the app's own unrelated
  `.claude` entries alone. Default to copy, not symlink.
- **Never check an approval gate** yourself. Gates are Alex's to set.
- **Never start building.** This skill only sets up state and routes.
- Keep `STATUS.md` short and current; push detail into feature cards and the
  log: mirror Alex's "status files stay short" rule.
- Separate observed facts from guesses; tag inferences `(needs review)`.
- Re-running must be **idempotent**: re-reconcile, don't duplicate rows or
  re-stamp existing files.

## Output

A workflow-ready app: the DevByAlex skills/agents/templates provisioned into
`<app>/.claude/` (project scope) and a `docs/` directory with a reconciled
`STATUS.md`, plus a summary ending in the single recommended next command.
