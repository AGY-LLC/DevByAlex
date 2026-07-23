---
id: workflow-e2e-gate
title: "E2E gate: prove the golden path before done"
---

# E2E gate: prove the golden path before done

**Objective: no feature is called done on unit tests and screenshots alone.**
The unit/integration suite proves the pieces work; the design-critic gate
proves the screens look right. Neither proves a user can actually complete
the feature's flow in a real client. Before this policy, that proof was
deferred to the launch stage (`/launch-acceptance` wrote the suites,
`/launch-verify` ran them), which made launch the first time any flow was
exercised end to end and delivered every integration surprise in one late
batch. This gate moves the proof to the moment the feature is declared done,
and lets the launch acceptance suite accrete one green flow at a time instead
of being authored from scratch at the end.

## The rule

A feature with a **user-facing flow** is not done until its **golden-path
E2E flow runs green against the running app**: Playwright for web surfaces,
Maestro for iOS/Android. A flow that exists on both surfaces is proven on
both.

- **Who writes it:** the `test-author`, in step 1a of the feature loop, from
  the feature card's acceptance criteria, spec-blind like every other test it
  writes. The golden path is part of the feature's test contract, not an
  afterthought.
- **What it covers:** the golden path through the feature's flow, plus the
  top 1-2 critical failure paths only where the card marks them critical
  (auth, payments, destructive actions). Not exhaustive: breadth stays in
  the unit/integration suite, cross-feature journeys stay in the launch
  stage.
- **Where it lives:** the same home the launch acceptance suite uses, so the
  suite accretes per feature: Playwright specs in the repo's e2e dir
  (`e2e/acceptance/<id>-<slug>.spec.ts`), Maestro flows in
  `.maestro/acceptance/<id>-<slug>.yaml`. Target the base URL / API URL via
  env vars (never hardcoded), so the identical flow runs against the local
  dev build during the feature loop and against staging at launch.
- **When it runs:** feature-loop step 4, against the running app: the same
  boot the screenshot + design-critic gate already requires, so the E2E run
  and the capture share one session. Green is required before the feature
  row flips to done; the run is recorded in the STATUS features table's
  `E2E` column.
- **Auth is the canonical case.** `/dev-auth` proves sign-up, login, and
  logout as its golden-path flow before Authentication is checked off.
- **`e2e: n/a` is explicit.** A feature with no user-facing flow (internal
  API, background job, schema work) records `e2e: n/a` in its row: its
  behavior is the integration suite's job. Never silently skip the gate.

## Proportionality: larger changes, not tweaks

The gate rides the feature lane. The light lanes stay light:

- **Tweaks (`/dev-tweak`): exempt by construction.** The qualification test
  already bars logic, flow, and behavior changes; a change that would alter
  a user flow fails qualification and is reclassified. No tweak ever pays
  the E2E gate.
- **Bug fixes:** the fix gets a regression test at the right level (usually
  unit/integration). If the bug broke a flow covered by an acceptance flow,
  re-run that flow green before closing the bug.
- **Todos (`/dev-todo`):** a todo that reshapes a covered user-facing flow
  updates the affected Playwright/Maestro flow and re-runs it green as part
  of its gate. A todo that leaves flow shapes intact just keeps the existing
  suite green, as today.

## What the launch stage becomes

`/launch-acceptance` shifts from author to **reconcile and backfill**: it
writes the scenario doc, maps the flows the feature loop already accreted,
and authors only what is missing (cross-feature journeys, `[manual]`
markers, staging parameterization, and coverage for features that predate
this policy). `/launch-verify` is unchanged: it runs the whole suite against
staging and drives failures to green. A flow that passed locally during the
feature loop can still fail against staging; the local run proves the
feature, the staging run proves the deployment.

## Adoption in existing apps

Feature rows marked done before this policy keep their status: the gate is
not retroactive and does not reopen shipped work. Their flows are backfilled
by the `/launch-acceptance` coverage cross-check (every done feature needs a
flow or an explicit `[manual]`/`n/a` marker). New feature work carries the
gate from its next run. When the STATUS features table lacks the `E2E`
column, add it on the next reconcile pass and seed old rows honestly:
existing coverage where it exists, `⬜` or `n/a` where it does not.
