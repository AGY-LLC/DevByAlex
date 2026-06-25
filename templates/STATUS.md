# {{APP_NAME}} — DevByAlex Status

> Single source of truth for the autonomous workflow. `dev-autopilot` reads this
> file to decide what to do next; every stage/feature skill updates it. Keep it
> short and current — push detail into feature cards and the log. Use absolute
> dates. Tag anything inferred (not observed) `(needs review)`.
>
> **Bugs you hit go in [`docs/BUGS.md`](./BUGS.md), not here.** The autopilot
> drains that log **before any build step** and won't enter the launch stage
> while it has open bugs.

**Stage:** plan <!-- plan | dev | launch -->
**Updated:** {{DATE}} <!-- date · commit · branch -->
**Stack:** {{STACK}}

## Gates (Alex approves these — agents must never self-check them)

- [ ] Spec approved
- [ ] Implementation guide approved
- [ ] Wireframes approved   ← the **dev stage is blocked** until these three are checked
- [ ] Staging deployed   ← auto via Pipeline by Alex on push to `staging`
- [ ] `staging → main` production promotion approved   ← Alex's call; `main` is protected production
- [ ] Legal & compliance passed   ← **hard gate**: not ship-ready until the `/launch-compliance` scan is clean
- [ ] Accessibility (WCAG 2.2 AA) passed   ← **hard gate**: not ship-ready until the a11y audit is clean

## Plan

- [ ] `docs/SPEC.md` written
- [ ] Brand foundation (`docs/BRAND.md`) — if public-facing (`/marketer-brand-generation`)
- [ ] `docs/IMPLEMENTATION_GUIDE.md` written
- [ ] Wireframes created (`docs/wireframes/`)
- [ ] Design resources specced (`docs/design/RESOURCES.md`) — loader · marketing load-in · OG preview image

## Dev

- [ ] Scaffold (one-time baseline)
- [ ] Custom app loader (built per `docs/design/RESOURCES.md`, or override recorded with a reason — never silently skipped)
- [ ] Authentication (built + validated)

### Features

Build order top-to-bottom. Per-step legend: ⬜ not started · 🟡 in progress · ✅ done · ❌ failing.
Status: `todo` → `in-progress` → `blocked` → `done`.

| # | Feature | Spec | Wireframe | Tests | Impl | Feat-Valid | Integ-Valid | Aligned | Status |
|---|---------|:----:|:---------:|:-----:|:----:|:----------:|:-----------:|:-------:|--------|
| 1 | _(seeded by `/plan-guide`)_ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | todo |

## Launch

- [ ] No open bugs in `docs/BUGS.md`   ← soft gate: autopilot won't enter launch while bugs are open
- [ ] Acceptance tests written (`docs/ACCEPTANCE_TESTS.md`)
- [ ] Visual QA passed — iOS + Android screenshots reviewed (`/launch-visual-qa`)
- [ ] Staging smoke test passed
- [ ] Launch-readiness audit passed
- [ ] Legal/compliance scan passed — ToS, privacy policy, cookie consent (`/launch-compliance`)
- [ ] Accessibility audit passed (WCAG 2.2 AA)
- [ ] SEO audit passed
- [ ] Prose pass done
- [ ] Store listing assets generated — App Store + Play (`/launch-store-assets`)
- [ ] Submitted to TestFlight + Play internal (manual) — `/launch-submit`, human-triggered only

## Next action

<!-- dev-autopilot reads THIS line first. Exactly one next step. -->
→ Run `/plan-spec` to interview and write the spec.

## Blockers / open questions

- _(none)_

## Log

<!-- newest first: date — skill — what changed (branch, commit) -->
- {{DATE}} — init-ai — workflow bootstrapped.
