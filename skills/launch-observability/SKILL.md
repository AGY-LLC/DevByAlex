---
name: launch-observability
description: "Launch-readiness stage of the DevByAlex workflow. It wires the app so production can be heard before anyone ships it. Adds error monitoring (client + server, with PII scrubbed from events), privacy-respecting product analytics that are consent-gated behind the cookie banner (never fired before consent; ties directly into the legal hard gate), a health/uptime endpoint with an external ping, and alert routing to Alex. It then proves the wiring by sending test events on staging and confirming they arrive. Config flows through the usual Zod-validated env; decisions (provider choices, what's deliberately not tracked) are recorded in the ADR/DECISIONS. This is the prerequisite for the post-launch loop: /live-triage reads the signal this skill wires up. Use once features are built, when the user says 'wire up monitoring', 'add error tracking', 'set up analytics', 'observability', or the goal run reaches the launch stage with the observability row unchecked."
argument-hint: "[path to the app repo: defaults to cwd]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-observability: Wire the app so production can be heard

## Goal

Production can be heard: errors, product analytics and uptime reach Alex, and
each signal has been seen arriving on staging before the **Observability
wired** row in STATUS is checked. These are the signals `/live-triage` feeds
on after launch. Wiring never seen to receive an event is not wired.

Before starting: read `docs/STATUS.md`, the spec's launch-success definition
(the analytics event list) and legal and privacy decisions (consent posture),
`docs/adr/scaffold.md` and the env module. An integrated repo may have partial
wiring: validate and complete it rather than duplicating it.

## Done when

- **Error monitoring** runs on client and server (and mobile if it exists),
  Sentry unless the spec or an ADR says otherwise, with PII scrubbing
  configured explicitly (no emails, tokens, auth headers or personal request
  bodies), source maps uploaded through CI, and staging and production tagged
  apart. On staging, a deliberate server and client error both arrived with a
  readable stack and an inspected payload holding no PII.
- **Product analytics** is privacy-respecting and tracks only the events that
  trace to the launch-success definition, through thin typed helpers. Where the
  cookie banner applies, nothing loads or fires before consent, using the
  existing consent state. On staging, a test event arrived after consent and
  nothing fired on a reload without it.
- **Health and uptime**: a health endpoint checks the database and returns
  version and commit, and an external uptime ping watches it on staging and
  production.
- **Alerts** for errors over a threshold and for uptime failures reach Alex by
  email or the channel the spec names.
- Config goes through the Zod env schema with new vars in `.env.example`; keys
  and DSNs flow through passworder (`request_secret` with an obtain hint, then
  `sync_secrets`; `../../knowledge/stack/secrets-passworder.md`).
- The providers, the event list with what is deliberately not tracked, and the
  scrub config are recorded in `docs/adr/scaffold.md` (or
  `docs/adr/observability.md`) and `docs/DECISIONS.md`.
- The privacy policy's data flows still match reality.
- STATUS has the row checked with a log line, and `## Next action` names the
  next launch step, noting `/live-triage` is runnable after launch. A signal
  that couldn't be verified is instead a blocker naming exactly what Alex must
  provision.

## Decisions (and why)

- **Track little, deliberately.** Why: every event is a data flow to disclose
  and maintain; the success definition says which ones matter.
- **No silent dashboards.** Why: a signal nobody is told about is decoration.
- **Prove each signal on staging** (push to `staging`, the working line).
  Why: config that was never seen working is the usual reason production goes
  quiet.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Consent before analytics, always: firing early fails the legal hard gate.
- PII scrubbing is verified on a real event, never assumed.
- Provider accounts are Alex's to create; never a guessed or hardcoded
  credential, and never a secret value in context. Without passworder, a
  missing secret is a blocker.
