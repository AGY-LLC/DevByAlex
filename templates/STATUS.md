# {{APP_NAME}} — DevByAlex Status

> Single source of truth for the autonomous workflow. `dev-autopilot` reads this
> file to decide what to do next; every stage/feature skill updates it. Keep it
> short and current — push detail into feature cards and the log. Use absolute
> dates. Tag anything inferred (not observed) `(needs review)`.

**Stage:** plan <!-- plan | dev | launch -->
**Updated:** {{DATE}} <!-- date · commit · branch -->
**Stack:** {{STACK}}

## Gates (Alex approves these — agents must never self-check them)

- [ ] Spec approved
- [ ] Implementation guide approved
- [ ] Wireframes approved   ← the **dev stage is blocked** until these three are checked
- [ ] Staging deployed (manual)

## Plan

- [ ] `docs/SPEC.md` written
- [ ] `docs/IMPLEMENTATION_GUIDE.md` written
- [ ] Wireframes created (`docs/wireframes/`)

## Dev

- [ ] Scaffold (one-time baseline)
- [ ] Authentication (built + validated)

### Features

Build order top-to-bottom. Per-step legend: ⬜ not started · 🟡 in progress · ✅ done · ❌ failing.
Status: `todo` → `in-progress` → `blocked` → `done`.

| # | Feature | Spec | Wireframe | Tests | Impl | Feat-Valid | Integ-Valid | Aligned | Status |
|---|---------|:----:|:---------:|:-----:|:----:|:----------:|:-----------:|:-------:|--------|
| 1 | _(seeded by `/plan-guide`)_ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | todo |

## Launch

- [ ] Acceptance tests written (`docs/ACCEPTANCE_TESTS.md`)
- [ ] Staging smoke test passed
- [ ] Launch-readiness audit passed

## Next action

<!-- dev-autopilot reads THIS line first. Exactly one next step. -->
→ Run `/plan-spec` to interview and write the spec.

## Blockers / open questions

- _(none)_

## Log

<!-- newest first: date — skill — what changed (branch, commit) -->
- {{DATE}} — init-ai — workflow bootstrapped.
