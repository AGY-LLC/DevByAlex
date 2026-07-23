# DevByAlex: the workflow

An autonomous, stage-gated pipeline that takes an app from a one-line idea to
launch-ready and keeps improving it after. It has four macro stages: **plan**,
**dev**, **launch**, **live**: with human
approval gates between plan and dev, and before the `staging → main` promotion to
production. Staging itself deploys automatically via Pipeline by Alex on push to
`staging` (`main` = protected production).
`init-ai` brings any repo (blank or existing) under the workflow; `docs/STATUS.md`
is the live control file every skill reads and writes.

## Map of the stages

```
                         ┌──────────────────────────── PLAN (human-gated) ───────────────────────────┐
  /init-ai  ──────────►  │  /plan-spec ──► /plan-guide ──► /plan-design ──► /plan-wireframes           │
  (bootstrap STATUS)     │   SPEC.md        GUIDE.md +      DESIGN.md        Penpot boards +           │
                         │   (+legal+SEO)   cards + ADRs    (style pick)     wireframes/README + design/RESOURCES.md │
                         │   └► /marketer-brand-generation → BRAND.md (if public-facing, before guide)  │
                         └───────────────────────────────┬───────────────────────────────────────────┘
                                      Alex approves spec + guide + wireframes  (3 gates)
                                                          │
                         ┌────────────────────────────── DEV (autonomous) ──────────────────────────┐
                         │  /dev-scaffold ──► /dev-auth ──►  ┌──── /feature-loop  (per feature) ───┐ │
                         │   (once)            (security      │ 1. test-author ∥ feature-implementer│ │
                         │                      first)        │ 2. feature-validator   (loop on ✗)  │ │
                         │                                    │ 3. integration-validator (loop on ✗)│ │
                         │   driven to the goal by            │ 4. align to guide+wireframes;       │ │
                         │                                    │    UI ⇒ screenshots + design-critic │ │
                         │                                    │    pass (loop on ✗); STATUS         │ │
                         │   /dev-goal (push until met) ◄─────┴─────────────────────────────────────┘ │
                         │   ▲ a slim orchestrator: each unit runs in a subagent (one green commit   │
                         │     per unit), looping until the goal is reached. Before building it      │
                         │     DRAINS docs/BUGS.md (human-logged bugs), then docs/TWEAKS.md via      │
                         │     /dev-tweak (cosmetic light lane), then docs/TODO.md via /dev-todo     │
                         │     (planned changes), and every UI-changing unit leaves a visual pulse   │
                         │     (staging URL + screenshots) in the STATUS log                          │
                         └───────────────────────────────┬───────────────────────────────────────────┘
                             all features done  AND  BUGS.md + TWEAKS.md + TODO.md have no open entries
                                                          │
                         ┌──────────────────────────── LAUNCH READINESS ────────────────────────────┐
                         │  (staging deploys via PBA) ─► /launch-observability (errors · consent-gated │
                         │   analytics · uptime: proven on staging) ─► /launch-acceptance ─►           │
                         │   /launch-verify ─►                                                          │
                         │   ACCEPTANCE_TESTS.md   Playwright(web)+Maestro(iOS/Android)  RUN vs staging │
                         │   ─► /launch-visual-qa (screenshot) ─► /launch-compliance ─►                 │
                         │   /staging-smoke-test ─► /launch-readiness                                   │
                         │   ⮡ Legal & Accessibility = HARD gates (block ship)                          │
                         │   ─► /launch-store-assets (App Store + Play) ─► /launch-submit ⮕ TestFlight  │
                         │      + Play internal  (HUMAN-TRIGGERED publish; never auto/cron)             │
                         └──────────────────────────────┬───────────────────────────────────────────┘
                                                        │  shipped: real users
                         ┌───────────────────────────── LIVE (post-launch) ─────────────────────────┐
                         │  production errors + user feedback ─► docs/FEEDBACK.md ─► /live-triage ─►   │
                         │  BUGS.md [prod] / TWEAKS.md / TODO.md / STATUS blockers (features → Alex)   │
                         │  …which the next /dev-goal run drains: the same verified build loop, now    │
                         │  running on production signal (triage routes, never fixes). Post-stable,    │
                         │  most iteration is exactly this: jot changes into the lanes, drain them     │
                         └──────────────────────────────────────────────────────────────────────────┘
```

## The pieces this plugin ships

### Skills (the stages)

| Skill | Stage | Does |
|-------|-------|------|
| `init-ai` | entry | Bootstraps/integrates the workflow into a repo; reconciles STATUS from what's already done. |
| `plan-spec` | plan | Interviews to a complete spec; collects **visual references as images** (screenshots of apps the user likes → `docs/design/references/`, each with a "what I like about it" line) as first-class design inputs; `reverse` mode backfills from code. |
| `plan-guide` | plan | Expands the spec into a granular, ordered guide + feature cards + per-feature ADRs (`adr-backfill` mode writes the missing ADRs for an existing repo's features). |
| `plan-design` | plan | Picks the app's named visual style, PRIMARY (structure, 1 of 12 product directions) × SECONDARY (feeling, 1 of 50 named styles from `knowledge/design/design-styles.md`), then **web-searches 3–5 real-world references** of the confirmed style (live products/galleries) to seed the tokens, and records pick + references + reason in `docs/DESIGN.md` before wireframes. `restyle` mode re-picks for an existing app, records the supersession, and hands off to `uiux-redesign` to apply it. |
| `uiux-redesign` | plan/dev | The application half of a `restyle`: sweeps a confirmed new style across an existing app's every customer-facing screen: rewrites the `docs/DESIGN.md` token system, then conforms the diverging surfaces (web + mobile) via token/shared-component changes, **leaving already-aligned surfaces alone** (change is justified by divergence, not by the sweep). Runs as code change through the validate loop, re-verifies WCAG 2.2 AA, and routes regressions to an `RSTY-xxx` queue → `fix-errors`. Owns the rollout, not the taste call. |
| `plan-wireframes` | plan | Wireframe each feature: GENERATE via Penpot MCP (greenfield) or CAPTURE existing screens from code (existing app, no Penpot). Reads the committed style from `docs/DESIGN.md`. The boards are the **living** source of truth for layout/design: later design/layout changes go Penpot-first (`knowledge/workflow/penpot-source-of-truth.md`). |
| `dev-scaffold` | dev | One-time baseline: monorepo topology (`marketing/` apex + `web/` full-stack app on app.domain + optional `app/` mobile), branch model (protected `main` = production, `staging` = working line), skeleton, tooling, tests, and CI + deploy via Pipeline by Alex (`pba.yml` + thin caller). |
| `dev-auth` | dev | Authentication first, security & privacy prioritized. Validate-existing mode audits + hardens auth an existing repo already has. |
| `feature-loop` | dev | The per-feature 4-step build/validate engine; accretes each feature's golden-path E2E flow via the e2e gate. |
| `dev-tweak` | dev | The cosmetic light lane, drains `docs/TWEAKS.md` (copy, tokens, spacing, asset swaps) behind a hard qualification test (no logic/data/API/auth/dependency/test changes, heavier entries get reclassified, never forced through) and a proportional gate: suite green, prose pass on copy, screenshot + design-critic pass on anything visual. ADRs still govern. |
| `dev-todo` | dev | The planned-change lane, drains `docs/TODO.md` (deliberate improvements heavier than a tweak, smaller than a feature) after bugs and tweaks. Routes every entry first (broken → BUGS, cosmetic → TWEAKS, feature-sized → a proposal for Alex, never silently into scope), then applies the qualified batch: failing test first where behavior changes, suite green, prose/screenshot gates as applicable. Post-stable, most iteration lives here. |
| `dev-goal` | dev | The driver: give it a goal (default: dev stage complete) and it pushes until the goal is met or only human-blocked work remains. A slim orchestrator: every unit (drain, scaffold, auth, feature) runs in a subagent returning a bounded report, one green commit per unit, so a multi-feature rollout never drowns the main context and the run is safe to interrupt and resume. Every UI-changing unit ends its STATUS log entry with a **visual pulse** (staging URL + screenshots, reusing the unit's own captures). |
| `dev-update` | dev/ops | Re-vendors the latest DevByAlex skills/agents/templates into the current app (`install.sh --update`); the manual update path that keeps the local committed copies current. |
| `launch-observability` | launch | Wires the app so production can be heard: error monitoring (client + server, PII scrubbed from events), consent-gated product analytics (never fired before cookie consent, same posture `/launch-compliance` audits), a health endpoint + uptime ping, and alert routing, each signal **proven end-to-end on staging** before its box is checked. The prerequisite for `/live-triage`. |
| `launch-acceptance` | launch | Reconciles the staging acceptance pass: maps the flows the feature loop accreted to a scenario doc and backfills the gaps (cross-feature journeys, pre-gate features), Playwright (web) + Maestro (iOS/Android). |
| `launch-verify` | launch | Runs the `launch-acceptance` suites against the live staging environment, triages failures into an `ACC-xxx` queue → `fix-errors`, re-runs to green, and checks the "acceptance suite passed against staging" gate `launch-submit` reads. The runner half of the author/run split. |
| `launch-compliance` | launch | Legal (ToS / privacy policy / cookie consent), accessibility (WCAG 2.2 AA), SEO, and prose scans; drives the two hard launch gates + a fix queue. Reuses `launch-readiness`, `accessibility-critique`, `seo-audit`, `prose-check`. |
| `launch-visual-qa` | launch | The cross-platform screenshot loop (build → boot → screenshot → critique → fix): boots iOS sim + Android emulator, drives the Maestro flows to capture every key screen/state, the `design-critic` agent vets them (against wireframes, `docs/DESIGN.md`, and the universal design rules) and emits a `VIS-xxx` queue → `fix-errors`, re-screenshots to confirm. Reuses the `launch-acceptance` Maestro flows + `fix-errors`. |
| `launch-store-assets` | launch | The "App Store tab," doubled: icon, device-framed screenshots (iOS sizes + Android phone/tablet), Play feature graphic, and per-field listing copy for **both** App Store Connect and Play Console, from the real running app. Reuses `create-demo`, `marketer-copywriting`, `ios-audit`. |
| `launch-submit` | launch | Dual-store delivery lane: detects Expo→EAS / bare→Fastlane, builds, and submits to **TestFlight + Play internal testing**. Gated on readiness/compliance/hard-gates; **human-triggered only**, never auto-promotes to production. Reuses `launch-readiness`, `ios-audit`. |
| `live-triage` | live | The post-launch loop, converts the `docs/FEEDBACK.md` inbox (user emails, reviews, error-tracker signal) into workflow state: functional problems → `docs/BUGS.md` tagged `[prod]`, cosmetic misses → `docs/TWEAKS.md`, feature requests → STATUS blockers for Alex (scope stays human). **Routes, never fixes**, `dev-goal`'s drain loops do the fixing, so production feedback flows through the same verified pipeline that built the app. |

### Agents (the specialists the feature loop deploys)

| Agent | Tier (model) | Role |
|-------|--------------|------|
| `feature-builder` | router (`inherit`) | Owns one feature; deploys the four steps and routes work between the tiers. |
| `explorer` | 1 fast (`haiku`) | Discovery + evidence collection + test running: returns a compact evidence package so stronger tiers verify instead of re-searching. Never decides architecture/security/product. |
| `feature-implementer` | 2 capable (`sonnet`) | Writes the feature code (not its tests); escalates by reporting when evidence, trust boundaries, or architecture demand it. |
| `test-author` | 2 capable (`sonnet`) | Writes tests from the spec, blind to the code. |
| `feature-validator` | 3 strong (`inherit`) | Runs tests + reviews feature code; reports, doesn't fix. Verification always runs strong. |
| `integration-validator` | 3 strong (`inherit`) | Runs full suite + reviews whole repo; reports, doesn't fix. Verification always runs strong. |
| `design-critic` | 2 capable (`sonnet`) | Vets screenshots of design changes against `docs/DESIGN.md` (style + references), the wireframes, and the universal design rules; emits a `CRIT-xxx` queue. Design work isn't done until it passes; judges, doesn't fix. |

The tiers come from the **model routing and verification policy**
(`knowledge/workflow/model-routing.md`, vendored like the rest of the
knowledge): use the fastest model that can reliably perform each stage, route
each subtask by the reasoning difficulty of that step (not the importance of
the project), and have stronger models **verify concise evidence packages and
diffs** rather than repeat completed mechanical work. Fast discovery
(`explorer`) feeds capable implementation, the strong tier is reserved for
ambiguity, trust boundaries, and independent verification of high-risk
changes, and automated tests stay the final objective gate. Escalation is
mandatory at the policy's boundaries (ambiguity, architecture, security/data,
concurrency, verification) and covers only the uncertain portion of a task,
never the mechanical work around it.

### Existing skills it reuses (not reinvented)

The workflow leans on skills that already exist rather than duplicating them.
These supporting skills live in `skills/` alongside the workflow stages: they're
all native to this repo now, and `install.sh` **vendors** the whole `skills/`
folder into each app's `.claude/skills` so any runner has them. Every skill is a
full copy committed into the repo: there are no live-served skills and nothing is
loaded over the network at run time. Improve one and re-vendor with
`./install.sh <app> --update` (or `/dev-update`) to refresh the committed copies.
The supporting skills (`scout`, `fix-errors`, `issue-checker`,
`test-suite-developer`, `staging-smoke-test`, `launch-readiness`, `prose-check`,
`seo-audit`, `accessibility-critique`, `ios-audit`, `create-demo`,
`marketer-brand-generation`, `marketer-copywriting`):

- `test-suite-developer`: the test-author's engine.
- `scout`: the validators' adversarial review (feature-scoped and whole-repo).
- `issue-checker`: confirms a finding is real before it's fixed.
- `fix-errors`: drives a findings queue to zero during the validation loops.
- `staging-smoke-test`: human-walkable config/integration check at launch.
- `launch-readiness`: codebase go/no-go audit at launch (incl. legal/policy).
- `prose-check`: strips AI tells from copy (plan wireframes + launch prose pass).
- `seo-audit`: code-level SEO audit at launch (needs `docs/BRAND.md`).
- `accessibility-critique`: WCAG 2.2 AA audit at launch → `A11Y-xxx` fix queue.
- `marketer-brand-generation`: writes `docs/BRAND.md` in the plan stage (seeds
  SEO + voice; required by `seo-audit`).
- `marketer-copywriting`: on-brand copy when wireframe/launch prose needs more
  than a cleanup pass; also writes the store listing copy in `launch-store-assets`.
- `ios-audit`: App Store Review / Play policy audit; used by `launch-submit`
  (rejection preflight) and `launch-store-assets` (metadata/age-rating compliance).
- `create-demo`: Maestro-driven capture of the real running app; `launch-store-assets`
  reuses it to pull real screenshots for the store listing.
- `uiux-init` / `uiux-audit`: optional external design-doc + UI alignment
  alongside wireframes: `uiux-init` expands a fresh pick into the full token
  system + component rules, and `uiux-audit` aligns screens to `docs/DESIGN.md`.
  The native `plan-design` owns the **style decision** (the named PRIMARY ×
  SECONDARY pick), and the native `uiux-redesign` owns the **rollout**: sweeping
  a confirmed new style across an existing app's screens when `plan-design
  restyle` re-picks. (`uiux-audit` is the fallback for the screen sweep if
  `uiux-redesign` isn't present.)

And it reads Alex's encoded conventions from the **vendored `knowledge/`**
(copied into `<app>/.claude/knowledge/` by `install.sh`; skills read it directly
at `../../knowledge/...`, the same idiom as `../../templates/`):
`knowledge/practices/<key>.yaml`: `project-kickoff` (spec), `auth`,
`data-modeling`, `payments`, `testing`, `code-review`, `launch-readiness`,
`uiux`, plus `knowledge/stack/*.md` and `knowledge/checklists/*.md`. Best
practices are read from these files, not fetched from a brain; decisions are
recorded in the repo: feature-scoped ones in `docs/adr/` (the governing
per-feature records), cross-cutting ones appended to `docs/DECISIONS.md` (the
chronological log). A committed checkout is fully self-sufficient: no MCP
token or network brain.

## The control file: `docs/STATUS.md`

Every skill reads it first and writes it last. It holds: the macro stage, the
approval gates (Alex-only), the plan/dev/launch checkboxes, the **feature table**
(per-feature per-step status), the single `## Next action` line `dev-goal`
keys off, the blockers list, and a log. Keep it short; detail lives in feature
cards and the log.

## The bug log: `docs/BUGS.md`

The human-written counterpart to STATUS. You drop bugs you hit into its `## Open`
section; `dev-goal` drains it **before any build unit**: fixing every open bug
through its verify loop and moving each to `## Fixed`, worst-first, before it
touches tweaks, todos, or new build work. Open bugs are also a **soft launch
gate**: the loop won't enter `/launch-acceptance` while any remain. The whole
log drains before anything else, because known-broken code is never a base for
new work.

## The tweak lane: `docs/TWEAKS.md`

The light lane, because changing a button label shouldn't cost what building a
feature costs. Small cosmetic changes (copy, tokens, spacing, asset swaps) go
here; `dev-goal` drains it via `/dev-tweak` **after bugs, before any build
unit**, the whole lane in one pass. What keeps the lane honest is the **hard
qualification test**: a tweak may touch only copy/tokens/styles/assets/ordering
and none of logic, data model, API, auth, dependencies, or tests: anything
heavier is **reclassified** to `docs/BUGS.md` or a feature proposal, never
squeezed through. The gate is proportional but real: suite green, prose pass on
changed copy, and the same screenshot + design-critic pass every design change
gets. Open tweaks soft-block launch just like open bugs.

## The todo lane: `docs/TODO.md`

The third lane, and where most post-stable iteration lives. Planned changes,
deliberate improvements heavier than a cosmetic tweak (behavior, structure, or
flows may change) but smaller than a feature (no new scope), go here; `dev-goal`
drains it via `/dev-todo` **after bugs and tweaks, before any build unit**, the
whole lane in one pass. Every entry is **routed before it's worked**: broken
behavior is reclassified to `docs/BUGS.md`, cosmetic-only entries to
`docs/TWEAKS.md`, and anything feature-sized becomes a proposal for Alex in
STATUS blockers, never silently absorbed into scope: the routing is what keeps
the lane from becoming a back door around the plan gates or the feature loop.
Qualified entries get a proportional gate: a failing test first where behavior
changes, suite green, prose pass on copy, screenshot + design-critic pass on
anything visual. Open todos soft-block launch just like the other two lanes.
The intended rhythm: push to stable fast with `/dev-goal`, then keep jotting
changes into this lane and draining it.

## The feedback inbox: `docs/FEEDBACK.md`

The post-launch counterpart to BUGS. Raw production signal: user emails, store
reviews, error-tracker exports: lands in its `## Inbox`; `/live-triage`
converts each item into workflow state: functional
problems → `docs/BUGS.md` tagged `[prod]`, cosmetic misses → `docs/TWEAKS.md`,
feature requests → STATUS blockers for Alex, duplicates/noise → triaged with a
reason. **Triage routes; it never fixes**: `dev-goal`'s existing drain
loops do the fixing, so a live app keeps improving through the same verified
pipeline that built it. `/launch-observability` wires the error/analytics
signal this loop feeds on.

## The decision records: `docs/adr/`

One ADR file per feature (mirroring `docs/features/<NN>-<slug>.md`, plus
`scaffold.md` and `auth.md` for the cross-cutting stages), holding the decisions
that govern it: what it has, what it deliberately does **not** have, and why.
`docs/DECISIONS.md` stays the chronological log of *what happened when*; the ADR
is the per-feature record of *what holds now*. The contract (spelled out in the
stamped `docs/adr/README.md`):

- **Consult before change.** Every skill/agent that touches a feature reads its
  ADR first: builds, bug fixes, and validation loops alike.
- **Breaking an `active` decision requires explicit human confirmation.** The
  loop stops and surfaces the conflict (citing the entry); on
  confirmation the old entry is marked superseded and the new decision recorded.
  Never a silent divergence.
- **Documented deliberate omissions are not findings.** The validators, `scout`,
  and `launch-readiness` cite the ADR entry instead of filing, so an automated
  review can't flag what was consciously chosen. Security/legal/accessibility
  issues still get reported (tagged `ADR-conflict`), and the two hard launch
  gates are never overridable by an ADR.
- **But the ADR blocks blind change, not criticism.** Concrete evidence that an
  `active` decision is itself causing real harm is reported as an
  `ADR-challenge` (entry + evidence, routed to the human, never the fix
  queue). Agents may argue with a decision; only Alex may change it.
- **Drift is a finding.** Code contradicting an `active` decision with no
  recorded supersession is architecture drift: the record wins until a human
  retires it.
- **Seeded at plan time, kept current by the loop.** `/plan-guide` writes each
  feature's ADR with its card; `feature-loop` step 4 records what the build
  decided. On an existing repo, `/plan-guide adr-backfill` must write an ADR for
  **every** feature: consolidating any scattered feature docs into them (or
  removing the irrelevant ones): before feature work proceeds.

## Integrating an existing (not-yet-launch-ready) repo

`init-ai` works on a half-built repo, not just a blank one, but "finish my app"
routes through the same gates, so the path is **backfill → validate → build the
rest**:

1. **Backfill the plan from code.** No spec/guide exist, so `init-ai` routes to
   `/plan-spec reverse` (infer the spec from code, tag inferences) → `/plan-guide`.
   The wireframe gate is satisfied by `/plan-wireframes capture`: an inventory of
   the screens already in the code, **no Penpot needed**: since the UI exists.
   The backfill includes the **ADRs**: every identified feature gets its
   `docs/adr/` record (inferred decisions + deliberate omissions, tagged
   `(needs review)`), with any scattered feature docs consolidated into them or
   removed: **before any feature work**, so the validators can tell a gap from
   a choice.
2. **Alex approves the three gates.** Dev stays blocked until then; an existing
   codebase doesn't bypass approval.
3. **Validate before building.** `init-ai` does **not** check off existing work as
   done: auth that exists but was never security-validated stays unchecked
   (`/dev-auth validate` audits + hardens it), and existing features are recorded
   impl-present / validation-pending. So the goal run's **first phase is
   validate-and-harden**, backfill spec-traced tests, run the validators, fix,
   re-certifying what's there before adding anything new.
4. **Then build the rest** via the normal feature loop, pushing to the working
   branch (use a dedicated iteration branch on a repo with a real `main`).

The principle: code existing is not the same as code being correct, validated, or
aligned to an approved spec: none of which can be known from the code alone. The
integration path makes that gap explicit instead of marking a working-but-unproven
app "done."

## Invariants the whole system upholds

- **Gates are human.** Agents never self-approve spec/guide/wireframes/deploy, or
  the legal-compliance / accessibility ship gates.
- **Tests trace to the spec.** Test-author and implementer run in parallel and
  blind, so tests verify behavior, not whatever the code happens to do.
- **Validators judge, they don't fix.** Separation keeps the gates honest; the
  orchestrator turns findings into failing tests + fixes.
- **ADRs govern change.** Every feature has a decision record in `docs/adr/`
  before the loop touches it; breaking an `active` decision needs explicit human
  confirmation + a recorded supersession, and documented deliberate omissions
  are never review findings (security/legal/a11y excepted, and the hard launch
  gates are never ADR-overridable).
- **The goal run is a slim orchestrator; one green commit per unit.** `dev-goal`
  pushes until the goal is met, but every unit of work (a drain, scaffold, auth,
  a feature) runs in its own subagent and ends in its own green commit pushed to
  the working branch. The driver holds bounded reports, never diffs; the repo
  (STATUS, the lanes, the ADRs) is the memory. That keeps a multi-feature
  rollout's main context slim, and makes the run safe to interrupt and resume.
- **Bugs, then tweaks, then todos, before building.** Open entries in
  `docs/BUGS.md`, `docs/TWEAKS.md`, or `docs/TODO.md` preempt
  scaffold/auth/feature work and block entry to the launch stage until drained.
  The tweak lane's qualification test and the todo lane's routing are what keep
  the light lanes from becoming back doors around the feature loop.
- **Every UI-changing unit leaves a visual pulse**: staging URL + screenshots in
  the STATUS log, reusing the unit's own captures, so an autonomous build can be
  judged at a glance, not only by reading diffs.
- **Penpot is the living source of truth for layout and design**
  (`knowledge/workflow/penpot-source-of-truth.md`). Any design or layout change
  goes Penpot-first, then code, so the wireframe boards never drift from what
  ships. The `penpot` MCP write lands only against a browser-connected file, so a
  connected session updates the boards then the code, while an unattended run
  records a Penpot-sync debt and clears it (verified by the design-critic) before
  the change is done. No review gate unless Alex asks to preview in Penpot first.
- **A feature's golden path is proven end to end before done**
  (`knowledge/workflow/e2e-gate.md`). Any feature with a user-facing flow runs
  its golden-path flow green against the running app in feature-loop step 4:
  Playwright for web, Maestro for native, written spec-blind by `test-author`
  and stored where the launch acceptance suite lives, so that suite accretes
  per feature and `/launch-acceptance` reconciles instead of authoring at the
  end. The gate rides the feature lane (auth included) and scales down, not
  around: tweaks are exempt by qualification, and bug/todo work only re-runs
  flows it broke or reshaped. `e2e: n/a` is recorded explicitly for features
  with no user-facing flow.
- **Production feedback flows through the same pipeline.** Post-launch signal is
  triaged (`/live-triage`) into the bug/tweak/todo lanes and drained by the
  goal run with full verification: triage routes, it never fixes, and feature
  requests go to Alex, never silently into scope.
- **Green suite at every stop; push straight to the working branch.** Nothing
  marked done with red tests or open findings. To keep iteration fast the dev
  stage commits and pushes to one working branch: no per-step branches, no PR
  pile-up. Green suite is the gate, not a human merge. Runs use the current
  branch unless one is passed explicitly. Use a dedicated iteration branch
  (e.g. `staging`), not a protected default.
- **Nothing is left orphaned.** Every run cleans up after itself: artifacts its
  work superseded or left unreferenced: scratch/debug scripts, temp files,
  dead code and unused exports/deps, components/assets/tokens nothing renders,
  stale fixtures, superseded docs: are removed in the same run, not left to
  rot. Two carve-outs: anything **explicitly recorded as kept** (ADR /
  `docs/DECISIONS.md`) is not an orphan; and an orphan that is **substantial
  work** (a part-built feature, a whole module, real content) is never
  silently deleted: it's surfaced to Alex as a keep-or-remove question, and a
  "keep" gets recorded so the next sweep doesn't re-flag it. `init-ai`
  inventories pre-existing orphans on integration and queues them as
  `[orphan]` bugs.
- **Docs are heavy by design, so they're kept lean by rule**
  (`knowledge/workflow/doc-maintenance.md`). The `docs/` set is closed (a new
  file needs a recorded decision), every fact has one home, and each skill's
  final doc write is a **reconcile pass**: prune what the unit completed or
  superseded, never a bare append. Append-heavy sections rotate on hard caps
  (git keeps the history), supersession replaces rather than accumulates, and
  doc bloat is a review finding like dead code. Pruning never touches gates,
  active ADRs, open lane entries, or compliance records.
- **Models are routed by reasoning difficulty, not project importance.**
  Mechanical discovery and repetitive work run on the fast tier, normal
  implementation on the capable tier, and ambiguity, trust boundaries, and
  high-risk verification on the strong tier: with stronger models verifying
  evidence packages instead of redoing lower-tier work
  (`knowledge/workflow/model-routing.md`). Routing lowers the cost of the
  mechanical 80%, never the strength of the gates: validators and every
  high-risk review always run strong.
- **Security & privacy beat convenience**, most of all in auth.
- **Legal & accessibility are hard launch gates.** Terms of Service, a privacy
  policy accurate to real data flows, a web cookie-consent banner, and WCAG 2.2 AA
  conformance are designed for in the plan and verified by `/launch-compliance`
  before ship: no launch with either gate open.

To run the dev stage, hand `/dev-goal` the goal and let it push until it's met.
