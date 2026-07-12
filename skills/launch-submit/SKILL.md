---
name: launch-submit
description: "Launch-readiness stage of the DevByAlex workflow: the dual-store delivery lane that closes the loop 10x-style builders leave open: it actually builds and submits the React Native app to BOTH Apple TestFlight and Google Play internal testing, not just 'up to review'. Human-triggered only. It is an outward-facing publish, so it never runs unattended from a cron and never auto-promotes to public/production (that stays Alex's manual call in App Store Connect / Play Console). Detects the project's RN flavor (Expo → EAS build + eas submit; bare RN → Fastlane pilot/supply) and the release lane, then preflights HARD before doing anything irreversible: confirms the launch-readiness audit and ios-audit/launch-compliance are clean, the Legal & Accessibility hard gates are signed off, the acceptance suite is green, store assets exist (launch-store-assets), and version/build numbers are bumped and not already used. Only when every gate passes does it build, upload to TestFlight + Play internal, and record the build/submission in STATUS. Use when the user says 'submit to the stores', 'ship to TestFlight', 'push to Play internal testing', 'eas submit', 'run the release lane', or 'deliver the build'. Run it only when they explicitly ask, never on a schedule."
argument-hint: "[optional: target: ios | android | both (default both); --dry-run to preflight without submitting]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-submit: Build and submit to TestFlight + Play internal

The lane a native iOS builder *doesn't* give you: an actual push to **both**
stores. It takes the React Native app from a green, compliant build to **Apple
TestFlight** and **Google Play internal testing** in one gated run: the
cross-platform payoff of RN over a single-store native generator.

It is **human-triggered and outward-facing.** Submitting a build is a real
publish (it reaches reviewers and testers, and a build/version number is burned
forever), so this skill **never runs from a cron, never self-triggers, and never
promotes to public release**: TestFlight/internal only; the public-production
rollout stays Alex's manual decision in App Store Connect / Play Console.

## When to activate

- **Only when the user explicitly asks**: "submit to the stores," "ship to
  TestFlight," "push to Play internal," "eas submit," "run the release lane,"
  "deliver the build."
- `--dry-run` runs the full preflight and reports go/no-go **without** building or
  submitting anything: safe to run anytime.
- **Never** invoke this from `dev-autopilot` or a scheduled action. If the dev
  loop reaches "ready to submit," it sets the next action to *suggest* this skill
  for a human to run: it does not run it.

## Workflow

### Step 1: Detect the toolchain and target
Read `package.json`, `app.json` / `app.config.*`, `eas.json`, and any `fastlane/`
dir to determine the path:
- **Expo / EAS** (`eas.json` or Expo config present) → `eas build` + `eas submit`.
- **Bare RN** (native `ios/` + `android/` projects, Fastlane present or addable)
  → Fastlane `pilot` (TestFlight) + `supply` (Play). If neither EAS nor Fastlane
  is set up, **stop** and report what's needed (don't half-configure a release
  pipeline mid-run): recommend the one that fits the project.
- Resolve the target (`ios` / `android` / `both`, default both) and which
  credentials/lanes exist.

### Step 2, Preflight the gates (HARD stop, nothing irreversible before this passes)
Confirm, and **abort with a clear report if any fails**:
- **`docs/STATUS.md` hard gates**: *Legal & compliance passed* and *Accessibility
  (WCAG 2.2 AA) passed* are **checked**. These are Alex's to sign; if either is
  unchecked, stop: not ship-ready. Never self-check them.
- **No open bugs** in `docs/BUGS.md` and **no open tweaks** in `docs/TWEAKS.md`
  (soft launch gates: known misses, functional or cosmetic, never ship).
- **launch-readiness** audit is clean (run it, or confirm its STATUS row is green
  and current).
- **ios-audit / launch-compliance** is clean: no predicted App Review / Play
  policy rejections (privacy manifest, required-reason APIs, account deletion,
  IAP disclosure, ATT, UGC moderation, age rating, Play Data safety). Run
  `ios-audit` if its result is stale.
- **Acceptance suite green**: `launch-verify` has run the `launch-acceptance`
  Playwright/Maestro suite against staging and the **Acceptance suite passed
  against staging** STATUS row is checked (or note explicitly which surfaces are
  `[manual]`/`[skipped]`). A suite that was written but never run does not satisfy
  this gate: run `/launch-verify` if its result is missing or stale.
- **Store assets present**: `store/ios/` + `store/android/` from
  `launch-store-assets` exist for the target(s); metadata.json is complete.
- **Version & build numbers**: the marketing version and build/version-code are
  bumped, consistent across iOS/Android, and **not already used** on the store
  (a duplicate build number is the most common avoidable submit failure). Bump
  them if needed and record the new values.
- **Credentials & secrets** present (signing certs/provisioning or EAS-managed
  credentials; ASC API key; Play service-account JSON): referenced from the
  environment/secret store, **never** read into or written to the repo. If a
  required secret is missing, stop and name it.

If `--dry-run`, report the full preflight result (go/no-go per gate) and **stop
here** without building.

### Step 3: Build
For each target, produce a **release/store** build:
- **EAS**: `eas build --platform <ios|android|all> --profile <production-ish
  store profile>`. Use the store-submission profile, not a dev/preview one.
- **Fastlane / bare**: `gym`/`build_app` for iOS (release config, store export),
  `gradle bundleRelease` (AAB) for Android.
Capture the resulting artifact paths and build numbers. If a build fails, stop and
report the error: do not attempt to submit a failed or stale artifact.

### Step 4: Submit (TestFlight + Play internal)
- **iOS → TestFlight**: `eas submit --platform ios` or Fastlane `pilot`. Upload
  to TestFlight; attach the build to the internal testing group. Do **not** submit
  for App Store review or public release here unless Alex explicitly asked in this
  invocation: default is TestFlight delivery only.
- **Android → Play internal testing**: `eas submit --platform android` or
  Fastlane `supply` with `track: internal` (AAB). Do **not** promote to
  closed/open/production tracks.
- Upload the store metadata/assets where the lane supports it (Fastlane
  `deliver`/`supply` from `store/.../metadata.json`), or note that the listing
  fields still need a manual paste in the console.
- Surface store-side processing notes (e.g. "build is processing on TestFlight;
  export-compliance answer may be required").

### Step 5: Record and route
- Update `docs/STATUS.md`: check **Launch → Submitted to TestFlight + Play
  internal (manual)**, record the version + build numbers, the date, and the
  artifact/build links. Add a log entry.
- State clearly **what remains a human action**: accepting export-compliance,
  inviting testers, promoting from internal → production, and submitting for App
  Review when ready. This skill stops at internal/TestFlight on purpose.
- Append any material decision to `docs/DECISIONS.md`.

## Rules

- **Explicit human trigger only.** Never run from a cron, a schedule, or
  `dev-autopilot`. Outward-facing publish requires a person asking, each time.
- **TestFlight / internal only: never auto-promote to production.** Public
  release is Alex's manual decision in the store consoles.
- **Gates are hard.** Don't build or submit while a hard gate is unchecked, a bug
  is open, readiness/compliance is dirty, the acceptance suite is red, or assets
  are missing. Abort with a clear report instead.
- **Never self-check a gate** (Legal, Accessibility): confirm Alex did.
- **Secrets stay out of the repo.** Signing keys, API keys, and service-account
  JSON come from the environment/secret store and are never written to disk in the
  project or echoed.
- **No duplicate/incorrect build numbers**: verify and bump before submitting.
- `--dry-run` must never build or submit; it only reports go/no-go.

## Output

For a real run: release builds for the target platform(s), an upload to
**TestFlight** and **Play internal testing**, version/build numbers and artifact
links recorded in `docs/STATUS.md` with the submission row checked, and an
explicit list of the human steps that remain (export compliance, tester invites,
production promotion, App Review submission). For `--dry-run`: a per-gate go/no-go
preflight report and nothing submitted.
