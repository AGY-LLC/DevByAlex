---
name: launch-observability
description: "Launch-readiness stage of the DevByAlex workflow. It wires the app so production can be heard before anyone ships it. Adds error monitoring (client + server, with PII scrubbed from events), privacy-respecting product analytics that are consent-gated behind the cookie banner (never fired before consent; ties directly into the legal hard gate), a health/uptime endpoint with an external ping, and alert routing to Alex. It then proves the wiring by sending test events on staging and confirming they arrive. Config flows through the usual Zod-validated env; decisions (provider choices, what's deliberately not tracked) are recorded in the ADR/DECISIONS. This is the prerequisite for the post-launch loop: /live-triage reads the signal this skill wires up. Use once features are built, when the user says 'wire up monitoring', 'add error tracking', 'set up analytics', 'observability', or the goal run reaches the launch stage with the observability row unchecked."
argument-hint: "[path to the app repo: defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-observability: Wire the app so production can be heard

A launched app with no error monitoring is an app whose bugs only users know
about. This stage wires the three signals the post-launch loop
(`/live-triage`) feeds on, errors, product analytics, uptime, and **proves
each one end-to-end on staging** before the row is checked. Wiring that was
never seen to receive an event is not wired.

## When to activate

- Features are built and the launch stage has begun; the **Observability
  wired** row in `docs/STATUS.md` is unchecked.
- The user asks for error tracking, monitoring, analytics, or alerting.

## What gets wired

1. **Error monitoring**: client + server (web; and the mobile app if one
   exists). Default to Sentry for Alex's stack unless the spec/ADR says
   otherwise; record the choice. Requirements:
   - **PII is scrubbed from events** (security & privacy beat convenience):
     no emails, tokens, auth headers, request bodies with personal data.
     Configure the scrubbing explicitly: don't trust defaults blindly.
   - Source maps uploaded via the CI pipeline so stack traces are readable.
   - Environment tagging (staging vs production) so signals don't mix.
2. **Product analytics**: privacy-respecting (e.g. self-hostable or
   cookieless-capable), tracking the handful of events that map to the spec's
   launch-success definition: not everything that moves. **Consent-gated,
   hard requirement:** where the cookie-consent banner applies, no analytics
   script loads and no event fires until consent is given. This is the same
   posture `/launch-compliance` audits: wire it right the first time.
   The event list is a decision: record what's tracked *and what deliberately
   isn't* in the ADR.
3. **Health + uptime**: a health endpoint (checks the DB connection, returns
   version/commit) and an external uptime ping against it (staging +
   production URLs), alerting on failure.
4. **Alert routing**: errors above a threshold and uptime failures reach
   Alex (email or the channel the spec names). No silent dashboards: a signal
   nobody is notified about is decoration.

## Workflow

### Step 1: Load context
Read `docs/STATUS.md`, `docs/SPEC.md` (launch-success definition → the analytics
event list; the legal/privacy section → consent posture), `docs/adr/scaffold.md`,
and the env handling. Check what already exists: an integrated repo may have
partial wiring; validate and complete it rather than duplicating (same principle
as `dev-auth validate`).

### Step 2: Wire it
Implement the four signals above. Config through the existing Zod-validated env
schema (`SENTRY_DSN` etc.: new vars documented in `.env.example`); secrets are
never committed. Keep the analytics event helpers thin and typed so events
can't drift from the recorded list. Consent-gating uses the existing cookie
consent state: never a parallel mechanism.

### Step 3: Prove it on staging
Push to the working branch (staging deploys via Pipeline by Alex) and verify
each signal end-to-end:
- Throw a deliberate test error (server + client) → confirm both events arrive
  in the error monitor, correctly environment-tagged, with a readable stack
  trace and **no PII in the event payload** (inspect one).
- Fire a test analytics event **after** granting consent → confirm it arrives;
  reload **without** consent → confirm nothing loads or fires.
- Hit the health endpoint → correct payload; confirm the uptime ping is
  configured against it.
A signal that can't be verified (missing secret, provider account needed) is a
STATUS blocker naming exactly what Alex must provision: not a checked box.

### Step 4: Record and route
- Record decisions (providers, event list + deliberate non-tracking, scrub
  config) in `docs/adr/scaffold.md` (or a dedicated `docs/adr/observability.md`)
  and `docs/DECISIONS.md`.
- Check the **Observability wired** launch row in STATUS; add a log line; make
  sure the privacy policy's data-flows section still matches reality (analytics
  and error tracking are data flows: `/launch-compliance` will check; fix the
  policy now if this wiring changed the truth).
- Set `## Next action` to the next launch step. Note that `/live-triage` is now
  runnable post-launch.

## Rules

- **Consent before analytics, always.** Firing before consent is a compliance
  hard-gate failure, not a growth hack.
- **Scrub PII from error events**: verified by inspecting a real event, not
  assumed.
- **Every signal proven end-to-end on staging** before its box is checked.
- **Track little, deliberately.** The event list traces to the spec's success
  definition; everything else is a recorded omission.
- Provider **accounts** are Alex's to create; the resulting keys/DSNs flow
  through passworder (`request_secret` with an obtain hint, then
  `sync_secrets`; see `knowledge/stack/secrets-passworder.md`) — never a
  guessed or hardcoded credential, and never a value in context. Without the
  passworder MCP, a missing secret is a blocker, the old way.

## Output

Error monitoring, consent-gated analytics, health/uptime, and alerting wired
and verified on staging; env + ADR + privacy policy consistent with the new
data flows; the STATUS row checked (or a blocker naming what's missing).
