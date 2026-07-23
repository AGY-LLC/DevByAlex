# {{APP_NAME}}: How this repo is built (DevByAlex workflow)

This project is built with the **DevByAlex** autonomous workflow. `docs/STATUS.md`
is the live control file; this file is the map.

## Stages

1. **Plan** (human-gated)
   - `/plan-spec` → `docs/SPEC.md`: interview until the spec is complete
     (incl. legal/privacy/compliance + SEO posture). Screenshots of apps you
     like go into `docs/design/references/`: first-class design inputs.
   - `/marketer-brand-generation` → `docs/BRAND.md`: brand foundation, **if the
     app is public-facing** (seeds SEO titles/locale + prose voice).
   - `/plan-guide` → `docs/IMPLEMENTATION_GUIDE.md` + `docs/features/*` +
     `docs/adr/*`: granular, ordered build plan (incl. a compliance/legal
     feature + a11y/SEO cross-cutting) plus one decision record per feature.
   - `/plan-design` → `docs/DESIGN.md`: pick the named visual style, PRIMARY
     (structure) × SECONDARY (feeling), with the reason recorded, so wireframes
     and scaffold build against a committed look. `restyle` mode re-picks for an
     existing app and hands off to `/uiux-redesign`.
   - `/plan-wireframes` → `docs/wireframes/`: Figma frames per feature (needs a
     Figma MCP), designed against the chosen style; copy is `prose-check`ed.
   - **Alex approves** the spec, guide, and wireframes. The dev stage is blocked
     until the three gates in `docs/STATUS.md` are checked.

2. **Dev** (autonomous once gates are met)
   - `/dev-scaffold`: one-time baseline: monorepo topology (`marketing/` apex +
     `web/` full-stack app on app.domain + optional `app/` mobile), branch model
     (protected `main` = production, `staging` = working line), skeleton, tooling,
     tests, and CI + deploy via Pipeline by Alex (`pba.yml` + thin caller).
   - `/dev-auth`: authentication first; security & privacy prioritized.
   - `/feature-loop <id>`: per feature: parallel tests + implementation →
     feature validation → integration validation → align to guide/wireframes +
     golden-path E2E flow green against the running app (the e2e gate) →
     update STATUS.
   - `/dev-tweak`: the cosmetic light lane: drains `docs/TWEAKS.md` (copy,
     tokens, spacing) behind a hard qualification test + a proportional gate,
     without paying the full feature loop.
   - `/dev-todo`: the planned-change lane: drains `docs/TODO.md` (deliberate
     improvements heavier than a tweak, smaller than a feature), routing every
     entry first (broken → BUGS, cosmetic → TWEAKS, feature-sized → a proposal
     for Alex). Once the app is stable, most iteration lives here.
   - `/dev-goal`: the driver: give it a goal (default: dev stage complete) and
     it pushes until the goal is met, draining `docs/BUGS.md`, then
     `docs/TWEAKS.md`, then `docs/TODO.md` before each build unit. Each unit
     runs in a subagent and ends in its own green commit, so the run is safe to
     interrupt and resume; every UI-changing unit leaves a **visual pulse**
     (staging URL + screenshots) in the STATUS log.

3. **Launch readiness**
   - Staging deploys automatically via Pipeline by Alex on push to `staging`; the
     human gate is the `staging → main` production promotion (`main` is protected).
   - `/launch-observability`: error monitoring (PII-scrubbed) + consent-gated
     analytics + uptime/alerting, each signal proven end-to-end on staging.
   - `/launch-acceptance` → `docs/ACCEPTANCE_TESTS.md` (scenario spec) plus the
     runnable suites that execute it against staging: Playwright specs for every
     web surface (`marketing/` + `web/`), Maestro flows for iOS/Android. A
     reconcile pass: the feature loop's e2e gate accreted a flow per feature;
     this maps them to scenarios and backfills only the gaps.
   - `/launch-compliance`: legal scan (ToS, privacy policy, cookie consent),
     `accessibility-critique` (WCAG 2.2 AA), `seo-audit`, and `prose-check`;
     reconciles a fix queue and the two **hard gates** (Legal & compliance,
     Accessibility) that block ship-ready in `docs/STATUS.md`.
   - Companions: `/staging-smoke-test`, `/launch-readiness`.

4. **Live (post-launch)**
   - Raw production signal, user emails, reviews, error-tracker exports, goes
     into `docs/FEEDBACK.md`.
   - `/live-triage` routes each item: functional problem →
     `docs/BUGS.md` tagged `[prod]`, cosmetic miss → `docs/TWEAKS.md`, planned
     change → `docs/TODO.md`, feature request → a STATUS blocker for Alex.
     Triage routes, never fixes: the next `/dev-goal` run drains those lanes
     through the same verified loop that built the app.

## Rules of the road

- Dev work commits and pushes **straight to the working branch**: the branch you
  call the skill on, or one passed explicitly. No per-unit branches, no
  PR pile-up. Use a dedicated iteration branch (e.g. `staging`), not a
  protected default.
- Agents never self-approve a gate; approvals are Alex's.
- `docs/STATUS.md` stays accurate and the test suite stays green at every stop.
- **ADRs govern change.** Every feature has a decision record in `docs/adr/`;
  consult it before touching the feature. Breaking an active decision needs
  explicit human confirmation + a recorded supersession; documented deliberate
  omissions are not review findings (security/legal/a11y excepted). The ADR
  blocks blind change, not criticism: evidence a decision causes real harm is
  surfaced as an `ADR-challenge` for Alex, never silently fixed or dropped.
- Tests trace to the spec; never weakened just to make code pass.
- **The golden path is proven end to end before done**
  (`.claude/knowledge/workflow/e2e-gate.md`): a feature with a user-facing
  flow runs its Playwright (web) / Maestro (native) golden-path flow green
  against the running app before its row flips done; `e2e: n/a` recorded
  when there is no flow. Tweaks are exempt by qualification; bug/todo work
  re-runs only flows it broke or reshaped.
- **Models are routed by reasoning difficulty**
  (`.claude/knowledge/workflow/model-routing.md`): fast tier for discovery and
  mechanical work, capable tier for normal implementation, strong tier for
  ambiguity, trust boundaries, and verification. Stronger models verify
  evidence packages and diffs; they don't redo completed mechanical work.
- **Docs stay lean** (`.claude/knowledge/workflow/doc-maintenance.md`): the
  `docs/` set is closed (new files need a recorded decision), every fact has
  one home, and every skill's last doc write is a reconcile pass that prunes
  what its work completed or superseded. Append-heavy sections rotate on hard
  caps; git is the archive. Doc bloat is a review finding like dead code:
  but pruning never touches gates, active ADRs, open lane entries, or
  compliance records.
- Security and privacy beat convenience: most of all in auth.

To advance the build, run `/dev-goal` and let it push until the goal is met.
