---
name: launch-submit
description: "Builds and submits the React Native app to TestFlight and Google Play internal testing. Use only when the user explicitly says 'submit to the stores', 'ship to TestFlight', 'push to Play internal testing', 'eas submit', 'run the release lane' or 'deliver the build'; never on a schedule. Detects Expo (EAS) or bare RN (Fastlane), then hard-preflights: audits clean, legal and accessibility gates signed off, acceptance green, store assets present, version and build bumped. Records the submission in STATUS. Never promotes to production; that stays Alex's call."
argument-hint: "[optional: target: ios | android | both (default both); --dry-run to preflight without submitting]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-submit: Build and submit to TestFlight + Play internal

## Goal

A green, compliant React Native build is on **Apple TestFlight** and **Google
Play internal testing** in one gated run, with the human steps that remain
spelled out. Runs only when the user explicitly asks ("submit to the stores",
"ship to TestFlight", "push to Play internal", "eas submit", "run the release
lane", "deliver the build"). `--dry-run` reports go or no-go per gate and
builds nothing, so it is safe any time.

## Done when

- **Preflight passed**, every gate confirmed before anything irreversible:
  - STATUS hard gates *Legal & compliance passed* and *Accessibility (WCAG 2.2
    AA) passed* are checked by Alex;
  - no open entries in `docs/BUGS.md` or `docs/TWEAKS.md`;
  - `launch-readiness` is clean and current (run it if stale);
  - `ios-audit` / `launch-compliance` predict no App Review or Play policy
    rejection (run `ios-audit` if stale);
  - the **Acceptance suite passed against staging** row is checked, from a real
    `/launch-verify` run, with any `[manual]` or `[skipped]` surfaces named;
  - `store/ios/` and `store/android/` from `launch-store-assets` exist for the
    targets with complete `metadata.json`;
  - marketing version and build numbers are bumped, consistent across
    platforms and not already used on either store;
  - signing credentials, the ASC API key and the Play service-account JSON are
    reachable from the environment or secret store.
  A failed gate ends the run with a report naming it; a missing secret is
  named, never worked around.
- **Built** with the store profile for each target: EAS (`eas build`,
  store-submission profile) when `eas.json` or Expo config exists, else
  Fastlane (`gym`/`build_app` for iOS, `gradle bundleRelease` AAB for
  Android). A failed build stops the run. With neither EAS nor Fastlane set up,
  stop and recommend the one that fits rather than half-configuring a release
  pipeline.
- **Submitted**: iOS to TestFlight's internal group (`eas submit` or `pilot`),
  Android to the `internal` track (`eas submit` or `supply`), store metadata
  uploaded where the lane supports it or flagged for a manual paste, and
  store-side processing notes surfaced.
- STATUS has **Launch → Submitted to TestFlight + Play internal (manual)**
  checked with version, build numbers, date and build links, plus a log line;
  material decisions are in `docs/DECISIONS.md`.
- The report lists what stays human: export compliance, tester invites,
  promotion past internal, and App Review submission.

## Decisions (and why)

- **Human-triggered, every time.** Never from a cron, a schedule or `dev-goal`;
  when the dev loop reaches "ready to submit", it suggests this skill. Why: a
  submission reaches reviewers and testers and burns a build number for good.
- **Stop at TestFlight and Play internal.** Promotion to production, other
  tracks or App Review happens only if Alex asked in this invocation. Why: the
  public release is Alex's call in the store consoles.
- **Preflight before build.** Why: everything after the build is irreversible,
  and a duplicate build number is the most common avoidable failure.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Never self-check the Legal or Accessibility gate.
- Signing keys, API keys and service-account JSON never touch the repo, disk
  in the project, or logs.
- Never submit a failed or stale artifact.
- `--dry-run` never builds or submits.
