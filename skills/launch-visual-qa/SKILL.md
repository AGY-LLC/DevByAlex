---
name: launch-visual-qa
description: "Launch-readiness stage of the DevByAlex workflow — the visual self-correction loop, cross-platform. Boots the app on an iOS simulator AND an Android emulator, drives the Maestro acceptance flows to walk every critical screen, captures screenshots on both platforms, then runs a vision critic over them against the wireframes, the design doc, and the spec — looking for layout breakage (clipping, overflow, overlap, off-screen content), contrast/legibility failures, broken empty/loading/error states, platform-feel violations (non-native nav, wrong safe-area/notch handling, mis-sized hit targets), and iOS↔Android parity gaps. Emits a prioritized, IDed VIS-xxx fix queue with screenshot + file evidence and routes it to fix-errors, then re-runs to confirm the fix actually looks right. This is the feedback loop 10x-style native builders use (build → boot → screenshot → critique → fix), made cross-platform via Maestro so one pass covers Apple and Android. Read-only on its own (produces findings); remediation is fix-errors. Use during dev to self-correct a freshly built feature, or at launch to verify the running app looks right on both platforms, when the user says 'visual QA', 'screenshot review', 'does it look right on device', 'check it on iOS and Android', or 'visual regression pass'."
argument-hint: "[optional: screens/flows to focus on, or a platform — ios | android | both (default both)]"
license: MIT
metadata:
  author: alex-yoza
  version: "0.1.0"
---

# launch-visual-qa — See the running app and fix what looks wrong

Code that compiles and passes tests can still look broken. This skill closes that
gap the way a native builder does — **build → boot → screenshot → critique →
fix** — but cross-platform: it captures the same flows on **iOS** and **Android**
via Maestro, so a single pass catches what only shows up on a real (simulated)
screen, on both stores' platforms at once.

It **audits and routes — it does not fix** (remediation is `fix-errors`). It is
the visual companion to `launch-acceptance` (which proves flows *work*); this
proves they *look right*.

## When to activate

- A feature was just built and you want to self-correct its UI before moving on
  (run it inside the dev loop, scoped to that feature's screens).
- The app is built/staged and you want a full visual pass before ship.
- The user says "visual QA," "screenshot review," "does it look right on
  device," "check it on iOS and Android," or "visual regression pass."

## Prerequisites

- The app builds and runs on a simulator/emulator (RN: Metro + a dev build, or
  Expo prebuild). If it can't be launched, stop and say so — this skill needs a
  running app, not source alone.
- **Maestro** installed, and Maestro flows present (this skill reuses the flows
  `launch-acceptance` generates under `.maestro/`; if none exist, generate
  minimal navigation flows that visit each critical screen).
- An **iOS simulator** (`xcrun simctl`) and an **Android emulator** (`emulator` /
  `adb`) available. If one platform's tooling is missing, run the other, capture
  the gap as a `[manual]` note, and say which platform was skipped and why —
  never silently cover only one.

## Workflow

### Step 1 — Enumerate the screens to capture
Read `docs/IMPLEMENTATION_GUIDE.md`, the feature cards, the wireframe flows,
`docs/DESIGN.md` (if present), and `docs/STATUS.md`. Build the screen list: every
critical screen plus, for each, the states that matter — **empty, loading, error,
populated, and any onboarding/upgrade state**. Scope to a feature's screens when
invoked per-feature; otherwise cover the critical path. A screen that exists on
both platforms is captured on both.

### Step 2 — Boot both platforms and capture
For each target platform (default **both**):
- Boot the simulator/emulator and install/launch the app (`simctl` for iOS,
  `emulator`+`adb` for Android). Prefer a fixed device profile per platform so
  runs are comparable (e.g. a current iPhone with a notch + a current Pixel).
- Drive the Maestro flows to navigate to each screen/state and capture a
  screenshot at each stop (`takeScreenshot`, named `<platform>-<screen>-<state>`).
  Force the states the happy path won't reach on its own: empty (fresh
  account/seed reset), loading (throttle or intercept), error (bad input /
  offline). Where a state can't be reached via the UI, mark it `[manual]`.
- Save screenshots under `docs/visual-qa/<run-date>/` (or the repo's existing
  screenshot dir), grouped by platform.

Never use real user data or real secrets — drive from seed/test accounts and
document them.

### Step 3 — Critique the screenshots (vision pass)
Spawn the **`design-critic`** agent (this plugin's `agents/design-critic.md`;
fall back to `general-purpose` with that brief) to review every captured
screenshot — the critic must be a separate context from whoever built or swept
the screens, so the verdict is vetted, not self-declared. It judges **against
the intent**, not in a vacuum — the wireframe for that screen, `docs/DESIGN.md`
rules (style choice + tokens + real-world references), the universal design
rules ([`../../knowledge/design/universal-design-rules.md`](../../knowledge/design/universal-design-rules.md)
— every screenshot is walked through its Universal Checklist), and the spec's
described behavior. Flag, per screenshot:
- **Layout breakage** — clipped/overflowing/overlapping content, text truncation,
  content under the notch/home-indicator/status bar, broken scroll/keyboard
  avoidance, mis-aligned or zero-size elements.
- **Legibility/contrast** — low-contrast text or controls, unreadable on the
  platform's default light/dark mode (check both modes where the app supports
  them).
- **State correctness** — missing or wrong empty/loading/error states (a spinner
  that never resolves, a blank screen where an empty state belongs, an error with
  no recovery affordance). Tie this to Alex's rule: always show loading states.
- **Platform feel** — non-native navigation patterns, wrong safe-area handling,
  hit targets below the platform minimum, Android back-button behavior, iOS swipe-
  back, font/scale that ignores Dynamic Type / font scaling.
- **Parity** — the same screen diverging between iOS and Android in a way that's a
  bug, not an intended platform adaptation (missing element on one platform,
  inconsistent copy, broken layout on only one).
- **AI-UI tells** — generic, intention-free UI where the design doc calls for
  something deliberate (defer to `uiux-audit` for depth if `docs/DESIGN.md`
  exists; here, flag only clear violations).

Each finding gets an ID (`VIS-001`, …), a severity (`blocker` / `high` /
`medium` / `low`), the offending screenshot path, the platform(s) it affects, the
likely source file/component, and a one-line "what's wrong + what right looks
like." Default to *reporting* an uncertain finding as `low` rather than dropping
it — but don't invent issues; a screen that matches its wireframe is a pass.

### Step 4 — Route remediation and re-verify
- Write the queue to `docs/visual-qa/<run-date>/FINDINGS.md` (and surface the top
  items inline).
- Hand the `VIS-xxx` queue to `fix-errors` to drive to zero. For a finding whose
  realness is ambiguous from the screenshot alone, confirm with `issue-checker`
  first so fixes aren't spent on phantom issues.
- **Re-capture the affected screens after fixes** and confirm the screenshot now
  matches intent — a visual fix isn't done until it looks right, not just until
  the code changed. Loop until the queue is clear or remaining items are punted to
  a STATUS blocker.

### Step 5 — Update STATUS and route
- Check **Launch → Visual QA passed (iOS + Android)** only when the queue is clean
  (or remaining items are explicitly deferred with reasons).
- If invoked per-feature in the dev loop, note the visual pass in that feature's
  row/notes rather than the launch row.
- Recommend the companions: `launch-acceptance` (writes the flow suites) +
  `launch-verify` (runs them against staging — flow correctness),
  `launch-compliance` (legal/a11y), and — for deep design-system conformance —
  `uiux-audit`.
- Add a log line; set `## Next action` (typically `/fix-errors` if findings
  remain).

## Rules

- **Audit, don't fix.** Findings + a `VIS-xxx` queue only; remediation is
  `fix-errors`, and the fix is re-screenshotted before it counts as done.
- **Both platforms or say which you skipped.** Never imply full coverage when only
  one platform ran; record the skip and why.
- **Real device states, not source-reading.** The value is in *seeing* the
  running app — capture empty/loading/error, not just the happy path.
- **Judge against intent.** Compare to the wireframe / design doc / spec; a screen
  that matches them is a pass, even if you'd have designed it differently.
- **No real data or secrets** in screenshots — seed/test accounts, documented.
- This verifies appearance; it doesn't replace flow correctness
  (`launch-acceptance`), compliance (`launch-compliance`), or a full design audit
  (`uiux-audit`).

## Output

Screenshots under `docs/visual-qa/<run-date>/` for both platforms, a
`VIS-xxx` fix queue in `FINDINGS.md` routed to `fix-errors`, re-verified fixes,
the Visual-QA launch row in `docs/STATUS.md` reconciled, and pointers to the
companion launch skills.
