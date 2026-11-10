---
name: launch-visual-qa
description: "Cross-platform visual QA loop. Use when the user says 'visual QA', 'screenshot review', 'does it look right on device', 'check it on iOS and Android' or 'visual regression pass', during dev or at launch. Boots iOS simulator and Android emulator, walks critical screens with the Maestro flows, screenshots both, and critiques them against wireframes, design doc and spec for layout breakage, contrast, broken states, platform feel and parity gaps. Emits an IDed VIS-xxx queue with evidence for fix-errors, then re-runs to confirm. Read-only on its own."
argument-hint: "[optional: screens/flows to focus on, or a platform: ios | android | both (default both)]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.2.0"
---

# launch-visual-qa: See the running app and fix what looks wrong

## Goal

The critical screens look right on a running iOS simulator and Android
emulator, in every state that matters, judged against their intent by someone
other than the builder. Code that compiles and passes tests can still look
broken; this proves screens look right, as `launch-acceptance` proves flows
work. It audits and routes; `fix-errors` fixes.

Before starting: the app launches on a simulator or emulator (a dev build or
Expo prebuild; source alone is not enough, so stop and say so), Maestro is
installed, and `xcrun simctl` and `emulator`/`adb` are available. Read
`docs/IMPLEMENTATION_GUIDE.md`, the feature cards, the wireframe flows,
`docs/DESIGN.md` if present and `docs/STATUS.md`. Scope is the critical path,
or one feature's screens when run inside the dev loop; the platform argument
defaults to both.

## Done when

- Every in-scope screen is captured on both platforms in its empty, loading,
  error, populated and any onboarding or upgrade state, driven by the Maestro
  flows under `.maestro/` (minimal navigation flows written if none exist) on
  one fixed current device profile per platform, with seed accounts. States the
  UI can't reach are `[manual]`. Screenshots are named
  `<platform>-<screen>-<state>` under `docs/visual-qa/<run-date>/` by platform.
  A platform whose tooling is missing is skipped with the reason recorded.
- `design-critic` (`agents/design-critic.md`, or `general-purpose` with that
  brief) reviewed every screenshot against its wireframe, `docs/DESIGN.md`,
  the Universal Checklist in
  [`../../knowledge/design/universal-design-rules.md`](../../knowledge/design/universal-design-rules.md)
  and the spec, for layout breakage (clipping, overlap, truncation, safe
  areas, keyboard), contrast in each supported light and dark mode, state
  correctness (loading always shown, empty states, error recovery), platform
  feel (navigation, back and swipe-back, hit targets, Dynamic Type and font
  scaling), iOS and Android parity bugs, and clear AI-UI tells (depth is
  `uiux-audit`'s).
- `docs/visual-qa/<run-date>/FINDINGS.md` lists each finding as `VIS-xxx` with
  severity (`blocker`, `high`, `medium`, `low`), screenshot path, platforms,
  likely source file, and what's wrong versus what right looks like.
- `fix-errors` drove the queue to zero (`issue-checker` first on findings that
  are ambiguous from the screenshot), and the affected screens were
  re-captured and match intent, or remaining items are STATUS blockers with
  reasons.
- STATUS: **Launch → Visual QA passed (iOS + Android)** is checked only when
  the queue is clean; a per-feature run notes the pass on that feature's row
  instead. A log line is added and `## Next action` is `/fix-errors` while
  findings remain.

## Decisions (and why)

- **The critic is never the builder.** Why: a builder vetting its own
  screenshots grades its own work.
- **Judge against intent.** A screen that matches its wireframe, design doc
  and spec passes, even if the critic would design it differently. Why: the
  design was already decided and approved.
- **Report uncertain findings as `low`; never invent one.** Why: dropped
  findings hide real bugs and invented ones waste fix cycles.
- **A visual fix counts only once the re-captured screenshot looks right.**
  Why: a code change is not proof of a visual result.
- **Appearance only.** Flow correctness (`launch-acceptance`,
  `launch-verify`), compliance (`launch-compliance`) and a full design audit
  (`uiux-audit`) stay separate.

## Hard rules

The hard rules in `docs/DECISIONS.md` apply, plus:

- Audit, don't fix.
- Never imply both platforms ran when one was skipped.
- Seed or test accounts only in screenshots; no real user data or secrets.
