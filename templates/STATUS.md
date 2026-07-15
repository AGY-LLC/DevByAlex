# {{APP_NAME}}: DevByAlex Status

> Single source of truth for the autonomous workflow. `dev-goal` reads this
> file to decide what to do next; every stage/feature skill updates it. Keep it
> short and current: push detail into feature cards and the log. Use absolute
> dates. Tag anything inferred (not observed) `(needs review)`.
>
> **Bugs you hit go in [`docs/BUGS.md`](./BUGS.md), cosmetic tweaks in
> [`docs/TWEAKS.md`](./TWEAKS.md), planned changes in [`docs/TODO.md`](./TODO.md),
> and post-launch user feedback in [`docs/FEEDBACK.md`](./FEEDBACK.md): not
> here.** The goal run drains bugs, then tweaks, then todos, **before any build
> unit** and won't enter the launch stage while any lane has open entries;
> `/live-triage` converts feedback into those lanes.

**Stage:** plan <!-- plan | dev | launch | live -->
**Updated:** {{DATE}} <!-- date · commit · branch -->
**Stack:** {{STACK}}

## Gates (Alex approves these: agents must never self-check them)

- [ ] Spec approved
- [ ] Implementation guide approved
- [ ] Wireframes approved   ← the **dev stage is blocked** until these three are checked
- [ ] Staging deployed   ← auto via Pipeline by Alex on push to `staging`
- [ ] `staging → main` production promotion approved   ← Alex's call; `main` is protected production
- [ ] Legal & compliance passed   ← **hard gate**: not ship-ready until the `/launch-compliance` scan is clean
- [ ] Accessibility (WCAG 2.2 AA) passed   ← **hard gate**: not ship-ready until the a11y audit is clean

## Plan

- [ ] `docs/SPEC.md` written
- [ ] Brand foundation (`docs/BRAND.md`): if public-facing (`/marketer-brand-generation`)
- [ ] `docs/IMPLEMENTATION_GUIDE.md` written
- [ ] Feature ADRs seeded (`docs/adr/`: one per feature; existing repos: **backfilled before any feature work**)
- [ ] Design style chosen (`docs/DESIGN.md`): PRIMARY × SECONDARY via `/plan-design`, with web-searched real-world references recorded (rides under the wireframes gate)
- [ ] Wireframes created (`docs/wireframes/`)
- [ ] Design resources specced (`docs/design/RESOURCES.md`): loader · marketing load-in · OG preview image

## Dev

- [ ] Scaffold (one-time baseline)
- [ ] Custom app loader (built per `docs/design/RESOURCES.md`, or override recorded with a reason: never silently skipped)
- [ ] Authentication (built + validated)

### Features

Build order top-to-bottom. Per-step legend: ⬜ not started · 🟡 in progress · ✅ done · ❌ failing.
Status: `todo` → `in-progress` → `blocked` → `done`.

| # | Feature | Spec | Wireframe | Tests | Impl | Feat-Valid | Integ-Valid | Aligned | Status |
|---|---------|:----:|:---------:|:-----:|:----:|:----------:|:-----------:|:-------:|--------|
| 1 | _(seeded by `/plan-guide`)_ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | todo |

## Launch

- [ ] No open entries in `docs/BUGS.md`, `docs/TWEAKS.md`, or `docs/TODO.md`   ← soft gate: the loop won't enter launch while any lane has open entries
- [ ] Observability wired: error monitoring (PII-scrubbed) + consent-gated analytics + uptime, verified on staging (`/launch-observability`)
- [ ] Acceptance tests written (`docs/ACCEPTANCE_TESTS.md`)
- [ ] Acceptance suite passed against staging (`/launch-verify`)   ← gate `/launch-submit` reads as "acceptance suite green"
- [ ] Visual QA passed: iOS + Android screenshots reviewed (`/launch-visual-qa`)
- [ ] Staging smoke test passed
- [ ] Launch-readiness audit passed
- [ ] Legal/compliance scan passed: ToS, privacy policy, cookie consent (`/launch-compliance`)
- [ ] Accessibility audit passed (WCAG 2.2 AA)
- [ ] SEO audit passed
- [ ] Prose pass done
- [ ] Store listing assets generated: App Store + Play (`/launch-store-assets`)
- [ ] Submitted to TestFlight + Play internal (manual): `/launch-submit`, human-triggered only

## Live (post-launch)

- [ ] Observability receiving real production events (not just the staging test events)
- [ ] Feedback triage running: `/live-triage` drains `docs/FEEDBACK.md` into the bug/tweak/todo lanes

## Next action

<!-- dev-goal reads THIS line first. Exactly one next step. -->
→ Run `/plan-spec` to interview and write the spec.

## Blockers / open questions

- _(none)_

## Log

<!-- newest first: date, skill, what changed (branch, commit), pulse: <staging URL> · <screenshot paths> (or pulse: n/a for non-UI runs) -->
- {{DATE}}, init-ai, workflow bootstrapped.
