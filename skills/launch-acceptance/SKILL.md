---
name: launch-acceptance
description: "Launch-readiness stage of the DevByAlex workflow — write an acceptance test that describes a manual pass through all critical features of the app, structured so a computer-use-capable agent can execute it against the staging environment to sanity-check that everything works as expected. Inspects the implementation guide, feature cards, and STATUS to enumerate the critical flows, then writes docs/ACCEPTANCE_TESTS.md as precise, ordered, agent-runnable steps with explicit expected results and setup/teardown. Pairs with the launch-readiness and staging-smoke-test skills. Use once features are built and the app is staged, when the user says 'write the acceptance tests', 'create the staging acceptance pass', or 'prep launch verification'."
argument-hint: "[optional: staging URL or flows to focus on]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-acceptance — Write the staging acceptance test

The launch-readiness stage. Staging is deployed by Alex manually; this skill
produces the acceptance test a computer-use agent runs against that staging
environment to confirm every critical flow actually works before promoting to
production.

## When to activate

- Features are built and the app is (or is about to be) deployed to staging.
- The user says "write the acceptance tests," "staging acceptance pass," or
  "prep launch verification."

## Workflow

### Step 1 — Enumerate the critical flows
Read `docs/IMPLEMENTATION_GUIDE.md`, the feature cards, the wireframe flows, and
`docs/STATUS.md`. List the end-to-end flows a real user must be able to complete
(sign up / log in, the 3–5 core jobs, payment if any, account deletion/privacy
controls, key error paths). Prioritize critical-path over exhaustive.

### Step 2 — Write docs/ACCEPTANCE_TESTS.md
From `../../templates/ACCEPTANCE_TESTS.md`, write a document a **computer-use
agent can execute without guessing**:
- **Preconditions** — the staging URL, test accounts/credentials needed
  (placeholders, never real secrets), seed data, and how to reset between runs.
- **Per-flow scenarios**, each as ordered, unambiguous steps: the exact action
  ("click X", "enter Y"), and the **explicit expected result** after each step
  (what the agent should see). Cover the non-happy paths too (bad input,
  unauthorized access).
- **Pass/fail criteria** per scenario, and an overall go/no-go.
- **Teardown** — clean up created data.

Write for an agent driving a real browser/app on staging — concrete selectors or
visible labels, no insider knowledge assumed.

### Step 3 — Cross-check coverage
Every critical feature in STATUS marked done must have at least one scenario.
Flag any done feature with no acceptance coverage.

### Step 4 — Update STATUS and route
- Check **Launch → Acceptance tests written**.
- Recommend the companion skills: `staging-smoke-test` (human-walkable
  config/integration check), `launch-readiness` (codebase go/no-go audit), and
  `launch-compliance` (the legal / accessibility / SEO / prose scan that drives
  the two hard launch gates) before promoting to production.
- Add a log line; set `## Next action` accordingly.

## Rules

- The document must be **executable by a computer-use agent** with no tribal
  knowledge — every expected result stated explicitly.
- Cover critical paths and key failure paths; don't try to cover everything.
- Never embed real secrets/credentials — use placeholders + a setup note.
- This verifies staging behavior; it doesn't replace the codebase audit
  (`launch-readiness`), the config smoke test (`staging-smoke-test`), or the
  compliance scan (`launch-compliance`).

## Output

`docs/ACCEPTANCE_TESTS.md` ready for a computer-use agent to run against
staging, STATUS advanced, and pointers to the launch-readiness companions.
