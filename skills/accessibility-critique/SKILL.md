---
name: accessibility-critique
description: >-
  Runs an adversarial accessibility audit against an app's codebase and emits a
  prioritized, IDed fix queue (A11Y-xxx) another agent or the user can work
  through. Measures conformance against WCAG 2.2 AA as the floor (AAA where
  feasible for text), the ARIA Authoring Practices, and the native-platform
  accessibility idioms for the surfaces in scope (web, iOS, Android, React
  Native, desktop). Covers perceivable/operable/understandable/robust:
  semantic structure, names and roles, keyboard traversal and focus
  management, focus visibility, contrast, hit targets, text scaling and
  reflow, reduced motion, live regions, form labeling and error association,
  media alternatives, language attributes, and screen-reader traversal.
  Does not fix: output is a report; remediation is a follow-up (e.g. via
  fix-errors). Use when the user asks for an accessibility critique,
  a11y audit, WCAG review, screen-reader review, keyboard-navigation
  review, or "is this app accessible?"-style assessment.
---

# Accessibility critique

A structured, skeptical accessibility audit. Treats every interactive element
as inaccessible until evidence otherwise. Output is a findings queue keyed by
WCAG success criteria so downstream fixers (humans or `fix-errors`) can
execute without re-auditing.

This skill does **not** modify code. It audits and reports.

## Mindset

- **Default inaccessible.** Every control, route, and state is assumed to
  fail until the code shows otherwise. Silence (missing label, missing
  focus style, missing `lang`) is a finding, not a pass.
- **Real users, not personas.** Frame impact in terms of who is actually
  blocked: screen-reader users, keyboard-only users, low-vision users at
  200% zoom, voice-control users, users with motor impairments and 24px+
  hit-target needs, users with vestibular disorders on reduced-motion,
  colorblind users, cognitively-taxed users on bad networks.
- **Cite WCAG.** Every finding names the success criterion it violates
  (e.g. `WCAG 2.2 · 2.4.7 Focus Visible`, `WCAG 2.2 · 1.4.3 Contrast
  (Minimum)`). If a finding is a best-practice gap with no matching SC,
  cite the ARIA Authoring Practices or platform HIG instead and mark it
  as such.
- **Evidence over vibes.** "Doesn't feel accessible" is not a finding.
  "`<div onClick>` with no role/tabindex/keydown handler at
  `src/Menu.tsx:42`" is.
- **Code over DOM snapshots.** Read the source. Grep for `role=`,
  `aria-`, `tabIndex`, `accessibilityLabel`, `alt=`, `<label`, `for=`,
  `htmlFor=`, `:focus`, `:focus-visible`, `prefers-reduced-motion`,
  `lang=`, `<title>`. The presence or absence of these tells most of the
  story.
- **Automated tools are a floor, not a ceiling.** axe/Lighthouse catch
  ~30–40% of issues. Keyboard traversal, screen-reader flow, focus
  management on route/modal changes, and live-region behavior need human
  reasoning.

## Scope

### In scope

- Source code for every user-facing surface: pages, screens, shared
  components, templates, emails rendered as HTML.
- Global HTML (`lang`, `<title>`, viewport meta, skip links, landmarks).
- Design tokens relevant to a11y: color palette, focus-ring tokens,
  typography scale, motion tokens, spacing/hit-target tokens.
- Routing, modal/dialog, drawer, toast, and overlay machinery (focus
  trap, focus return, `inert`, `aria-modal`).
- Forms: label association, error message association, required-state
  announcement, input modes, autocomplete attributes.
- Media: images (`alt`), audio/video (captions, transcripts,
  auto-play), animations (`prefers-reduced-motion`).
- Copy that carries a11y signal: link text, button text, heading text.
- Testing artifacts that claim a11y coverage (axe tests, snapshot of
  roles, Playwright keyboard tests): verify they actually cover what
  they claim.

### Out of scope (note but do not audit)

- Legal statements about accessibility (handled by `launch-readiness`).
- Non-codebase concerns: procurement of screen-reader licenses, user
  testing recruiting, VPAT authorship.
- Live-URL audits requiring credentials or production access.

If the user requests those, flag as out-of-scope and continue the
codebase audit.

## Standards to measure against

Use whichever applies to the surface:

- **WCAG 2.2 Level AA** as the baseline for web and web-technology apps.
  Call out AAA where easily achievable (e.g. 7:1 body contrast, visible
  focus indicator of sufficient area).
- **ARIA 1.2 + ARIA Authoring Practices Guide (APG)** for custom widgets
  (combobox, listbox, menu, tabs, tree, disclosure, dialog, etc.).
- **iOS Human Interface Guidelines: Accessibility** for native iOS:
  traits, labels, hints, rotor, Dynamic Type, reduce-motion, reduce
  transparency, voice control labels.
- **Android Accessibility guidelines + Material A11y** for native
  Android: `contentDescription`, `importantForAccessibility`, touch
  target size 48dp, TalkBack order, live regions.
- **React Native a11y API** for RN: `accessible`, `accessibilityRole`,
  `accessibilityLabel`, `accessibilityHint`, `accessibilityState`,
  `accessibilityLiveRegion`, `accessibilityElementsHidden`,
  `importantForAccessibility`, `onAccessibilityTap`.
- **EN 301 549** if the user indicates EU public-sector relevance.
- **Section 508 (Revised)** if the user indicates US federal relevance;
  conformance is via WCAG 2.0 AA at minimum, with 2.2 AA recommended.

If the user has not named a jurisdiction, default to WCAG 2.2 AA and
note AAA wins opportunistically.

## Workflow

1. **Map the app.** Identify surfaces (web pages, native screens,
   emails), the framework (Next.js/React/Vue/SwiftUI/Jetpack
   Compose/RN/etc.), the design-system layer (tokens, shared
   primitives), and the navigation model. This shapes what to grep for
   and how fixes will be framed.
2. **Locate a11y-relevant code:**
   - Global chrome: root layout, `<html lang>`, `<title>`, viewport,
     skip links, landmarks (`main`, `nav`, `header`, `footer`,
     `aside`), document outline.
   - Design tokens: color palette, contrast ratios, focus-ring styles,
     motion tokens, font-size tokens.
   - Interactive primitives: Button, Link, IconButton, Input, Select,
     Checkbox, Radio, Switch, Slider, Dialog, Menu, Tabs, Tooltip,
     Toast, Combobox, Listbox, Tree, DatePicker.
   - Route/modal/drawer/overlay machinery (focus trap and return).
   - Forms and validation.
   - Media components.
3. **Walk the primary flow.** Trace onboarding → core task → settle
   state, screen by screen, as a keyboard-only user and as a
   screen-reader user. Most blocking issues live on the path users
   actually take.
4. **Run each checklist section below.** For every section either
   record a clean pass (one-line justification) or emit findings in
   the format under **Output**.
5. **Exercise every interactive state.** default → hover → focus-visible
   → active → disabled → loading → error → empty. Missing states are
   findings; invisible focus is a Critical finding.
6. **Probe the edges.** 200% browser zoom, 400% zoom with reflow
   (WCAG 1.4.10), Dynamic Type to largest, RTL if supported, dark mode
   if supported, reduced motion, reduced transparency, forced-colors /
   Windows High Contrast, keyboard-only, screen reader, voice control.
7. **Verify testing claims.** If `@axe-core/*`, `jest-axe`, Playwright
   a11y, or platform a11y tests exist, read what they actually assert.
   A suite that only runs axe on the landing page is not "a11y covered."
8. **Derive app-specific a11y concerns.** Data visualizations, maps,
   rich editors, canvas/WebGL, media players, games, timed flows,
   CAPTCHAs, document viewers, real-time collaboration cursors,
   each has its own a11y patterns; audit accordingly.
9. **Emit the report** per **Output**.

## Checklist sections

Each section maps to WCAG principles and platform idioms. Under each,
produce either a pass note or findings.

### 1. Perceivable

#### 1.1 Text alternatives (WCAG 1.1.1)

- Every `<img>`/`Image` with semantic meaning has a correct `alt` /
  `accessibilityLabel`. Decorative images have `alt=""` /
  `accessibilityElementsHidden` and are not announced.
- Icon-only buttons have a programmatic name (`aria-label`,
  `accessibilityLabel`, visually-hidden text).
- SVGs: `<svg role="img">` with `<title>` when meaningful; `aria-hidden`
  when decorative; never announce both the icon and its sibling label
  (double-announcement smell).
- Complex images (charts, diagrams) have a text equivalent or long
  description.
- Emoji used as meaningful content has an accessible name.

#### 1.2 Time-based media (WCAG 1.2.x)

- Prerecorded video has captions (1.2.2) and, where claimed, audio
  description (1.2.5).
- Audio-only content has a transcript.
- Auto-playing media with audio > 3s has a pause/stop/mute control
  reachable without overlap with other UI (1.4.2).

#### 1.3 Adaptable: semantic structure (WCAG 1.3.1, 1.3.2, 1.3.5)

- **Landmarks present** on every page: `main`, `nav`, `header`,
  `footer`, `aside` where appropriate; single `main` per view.
- **Heading outline is logical.** Exactly one `<h1>`; no skipped
  levels (`h1` → `h3` without `h2`); headings describe the section, not
  the styling.
- **Lists are `<ul>`/`<ol>`/`<dl>`**, not rows of `<div>`s styled to
  look like lists.
- **Tables** use `<th scope>`, `<caption>`, `thead/tbody/tfoot`; layout
  tables (rare; avoid) have `role="presentation"`.
- **Meaningful sequence**: DOM order matches visual/reading order;
  `order:` / `flex-direction: row-reverse` / absolute positioning does
  not scramble it (1.3.2).
- **Input purpose** (1.3.5): autocomplete attributes on personal-data
  fields (`autocomplete="email"`, `"given-name"`, `"tel"`, etc.).
- React Native: `accessibilityRole` set on every meaningful element
  (`button`, `link`, `header`, `image`, `summary`, `tab`, `menu`, etc.).

#### 1.4 Distinguishable

- **Use of color (1.4.1)**: color is never the only signal. Error
  states pair red with an icon + text; required fields are not
  indicated only by a red asterisk with no text fallback.
- **Contrast (minimum): 1.4.3**: body text ≥ 4.5:1; large text
  (≥18pt, or ≥14pt bold) ≥ 3:1. Compute against the *actual rendered*
  background (including overlays, gradients, images). Placeholder text
  inside inputs is a frequent offender.
- **Non-text contrast: 1.4.11**: UI component boundaries and states
  (input borders, focus rings, icon buttons, toggle states) ≥ 3:1
  against adjacent colors.
- **Resize text (1.4.4)**: layout survives 200% zoom without loss.
- **Reflow (1.4.10)**: at 400% zoom / 320 CSS px width, no
  two-dimensional scrolling except for content that requires it
  (tables, maps, diagrams).
- **Text spacing (1.4.12)**: no truncation/overlap when users apply
  line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em,
  paragraph-spacing 2× font size.
- **Images of text (1.4.5)**: avoid rendering text as images unless
  essential (logos excluded).
- **Content on hover/focus (1.4.13)**: tooltips/popovers are
  dismissible (Esc), hoverable (user can move pointer onto them), and
  persistent until dismissed.
- **Dark mode / forced colors**: respects `prefers-color-scheme` and
  survives `forced-colors: active`: no `!important` backgrounds that
  fight Windows High Contrast; semantic `Canvas`/`CanvasText` or
  `system-ui` colors used where appropriate.

### 2. Operable

#### 2.1 Keyboard accessible (WCAG 2.1.1, 2.1.2, 2.1.4)

- Every action reachable and executable via keyboard. Find every
  `onClick` on a non-`<button>`/`<a>`/`<summary>` and verify it has
  `role`, `tabIndex`, and keydown handlers for `Enter`/`Space`.
- No keyboard traps (2.1.2). Focus can leave any widget the keyboard
  entered: including custom dropdowns, date pickers, rich editors.
- Character shortcuts (single-key) can be remapped, turned off, or
  only fire on focus (2.1.4).

#### 2.2 Enough time (WCAG 2.2.1, 2.2.2)

- Session timeouts offer extension or warning.
- Moving/blinking/auto-updating content > 5s is pausable/hideable.
- Carousels/auto-advancing banners have pause control and do not
  advance on focus.

#### 2.3 Seizures and physical reactions (WCAG 2.3.1, 2.3.3)

- No flashing > 3 times/second unless below threshold.
- Motion-triggered animation has a setting to disable and honors
  `prefers-reduced-motion: reduce` (2.3.3 AAA but treat as High).

#### 2.4 Navigable

- **Skip link (2.4.1)** to `main` on pages with repeated navigation.
- **Page titled (2.4.2)**: every route sets a distinct, descriptive
  `<title>` / screen title.
- **Focus order (2.4.3)** matches meaning/visual order; `tabindex` > 0
  is a smell (creates unexpected order).
- **Link purpose (2.4.4)**: "click here" / "read more" without
  programmatically determinable context is a finding. Icon-only links
  have accessible names.
- **Multiple ways (2.4.5)**: nav, search, sitemap: at least two ways
  to reach any page (exempt: in-flow steps).
- **Headings and labels (2.4.6)**: describe topic/purpose.
- **Focus visible (2.4.7)**: **every** focusable control has a
  visible focus indicator. Missing or invisible focus ring is a
  **Critical** finding. `outline: none` without a replacement is the
  most common offender.
- **Focus not obscured (2.4.11, WCAG 2.2)**: focused element is not
  fully hidden by sticky headers, cookie banners, chat widgets, etc.
- **Focus appearance (2.4.13 AAA)** aspirational but worth flagging:
  focus indicator perimeter ≥ 2 CSS px, contrast ≥ 3:1 from unfocused.

#### 2.5 Input modalities

- **Pointer gestures (2.5.1)**: path-based or multi-point gestures
  have single-pointer alternatives.
- **Pointer cancellation (2.5.2)**: actions fire on pointer-up, and
  allow abort by dragging off.
- **Label in name (2.5.3)**: accessible name contains the visible
  label text. Voice-control users rely on this.
- **Motion actuation (2.5.4)**: shake/tilt actions have alternatives.
- **Target size (2.5.8, WCAG 2.2)**: pointer targets ≥ 24×24 CSS px
  (mobile best practice: ≥ 44×44). Icon buttons in toolbars are a
  frequent miss.
- **Dragging movements (2.5.7, WCAG 2.2)**: drag operations have a
  single-pointer non-drag alternative (e.g. click-to-move).

### 3. Understandable

#### 3.1 Readable

- **Language of page (3.1.1)**: `<html lang>` is set; RN
  equivalent on Text components when mixing languages.
- **Language of parts (3.1.2)**: foreign-language phrases use `lang=`.
- **Unusual words, abbreviations**: glossary or `<abbr>` as
  appropriate (AAA, flag as Note).

#### 3.2 Predictable

- **On focus / on input (3.2.1, 3.2.2)**: changing focus or a form
  value does not trigger navigation or modal open without warning.
- **Consistent nav/identification (3.2.3, 3.2.4)**: nav order and
  component names consistent across pages.
- **Consistent help (3.2.6, WCAG 2.2)**: if help mechanisms (contact,
  chat, FAQ) appear on multiple pages, they appear in the same
  relative order.
- **Redundant entry (3.3.7, WCAG 2.2)**: information previously
  entered in the same process is auto-populated or selectable.

#### 3.3 Input assistance

- **Error identification (3.3.1)**: errors are programmatically
  associated with the offending field (`aria-describedby`,
  `aria-invalid`), announced to AT (live region or focus move).
- **Labels or instructions (3.3.2)**: every input has a visible,
  persistent label. Placeholder-as-label is a finding.
- **Error suggestion (3.3.3)**: messages tell the user how to fix
  (not just "invalid").
- **Error prevention (3.3.4)**: destructive, legal, or financial
  actions have confirm/undo/review.
- **Accessible authentication (3.3.8, WCAG 2.2)**: no cognitive
  function test (solve puzzle, memorize, transcribe) required unless
  alternative exists. Supports paste for 2FA codes and password
  managers.

### 4. Robust

#### 4.1 Compatible

- **Name, Role, Value (4.1.2)**: every custom widget exposes all
  three. Audit any `role="button"`, `role="checkbox"`, `role="dialog"`,
  etc. against APG: if it doesn't implement the pattern's keyboard
  and state semantics, it's broken.
- **Status messages (4.1.3)**: non-focus-moving status (toast saves,
  inline "Copied!", async validation results) uses `role="status"`,
  `role="alert"`, or `aria-live` (`polite` vs `assertive` chosen
  correctly).
- **Valid markup**: no duplicate `id`s, no nested interactives
  (`<button>` inside `<a>`), no `<h*>` inside a `<button>` without
  intent.

### 5. Screen-reader traversal (overlay)

Walk each key screen as a screen-reader user would, noting:

- **Reading order** matches the visual/intended order.
- **Landmarks** navigable with rotor / headings list.
- **Every interactive announces** role + name + state ("Submit,
  button, disabled"; "Notifications, switch, on").
- **Live regions** announce at the right verbosity. `role="alert"`
  that fires on every keystroke is a finding; `aria-live="off"` on a
  real-time status is a finding.
- **Modals**: `aria-modal="true"`, `role="dialog"`, labelled by
  heading (`aria-labelledby`), focus moved in on open, focus returned
  on close, `inert` on background content (or `aria-hidden` if
  pre-`inert`). Esc closes.
- **Custom widgets** match APG for their pattern (combobox, listbox,
  menu, tabs, tree, disclosure, dialog, alertdialog).

### 6. Keyboard traversal (overlay)

Walk each key screen keyboard-only, noting:

- Tab order matches reading order.
- No element is reachable that should not be (hidden menus,
  off-screen cards still in tab order).
- No element is unreachable that should be (custom controls without
  `tabIndex`, widgets behind scroll without scroll-to-focused).
- Custom keyboard conventions (Arrow keys in menus, Home/End in
  listboxes, Typeahead in comboboxes) implemented.
- Esc closes overlays; Enter/Space activate; Tab does not leak out of
  open dialogs.

### 7. Motion, animation, and sensory triggers

- Every CSS/JS animation honors `@media (prefers-reduced-motion:
  reduce)` or the platform equivalent (`AccessibilityInfo.isReduceMotionEnabled`
  on RN, `UIAccessibility.isReduceMotionEnabled` on iOS,
  `Settings.Global.ANIMATOR_DURATION_SCALE` on Android).
- Parallax, auto-scroll, large zoom-in transitions have a
  reduced-motion fallback that is opacity-only or disabled.
- No animation that could be seizure-inducing (flashing, rapid
  red/white).

### 8. Native platform specifics

#### iOS / SwiftUI / UIKit

- `accessibilityLabel`, `accessibilityHint`, `accessibilityValue`,
  `accessibilityTraits` set on custom views.
- Dynamic Type: uses `UIFontMetrics` / `.font(.body)` (not fixed
  sizes); supports largest accessibility size without truncation.
- VoiceOver rotor: custom rotors for repeated list structures where
  helpful.
- `accessibilityElements` set on container views to control order
  when children are not in document order.
- Reduce Motion and Reduce Transparency settings respected.

#### Android / Compose / Views

- `contentDescription` on every meaningful `ImageView`,
  `ImageButton`, and custom `View`.
- `importantForAccessibility` used correctly on decorative nodes.
- Minimum touch target 48×48 dp.
- TalkBack order via `accessibilityTraversalBefore/After` when
  visual order and DOM order diverge.
- `LiveRegion` on async status elements.
- Compose: `Modifier.semantics { ... }` for custom widgets.

#### React Native

- Every `Pressable`/`TouchableOpacity` has `accessibilityRole` and
  either `accessibilityLabel` or text child.
- `accessibilityState` reflects `disabled`, `selected`, `checked`,
  `expanded`, `busy`.
- `accessible={true}` on composed views that should announce as one
  unit, with descendants having `accessibilityElementsHidden` /
  `importantForAccessibility="no-hide-descendants"`.
- `AccessibilityInfo.announceForAccessibility` on significant async
  results if live region isn't appropriate.
- Text `allowFontScaling` not disabled globally.

### 9. App-specific concerns

Derive from the map in step 1. Examples:

- **Rich text editor**: contentEditable + ARIA textbox semantics,
  shortcuts discoverable, paste preserves structure.
- **Data table/grid**: `role="grid"` with `aria-rowindex`/`colindex`
  for virtualized rows; keyboard grid navigation (Arrow, PageUp/Down,
  Home/End, Ctrl+Home).
- **Charts/data viz**: text summary, data table alternative, direct
  keyboard access to data points, non-color encoding.
- **Maps**: alternative listing of points of interest; keyboard pan
  and zoom.
- **Video/audio player**: full keyboard control, captions toggle,
  playback-rate control, transcript.
- **Canvas/WebGL**: a11y tree shim or text alternative.
- **Real-time / collaborative**: remote-cursor announcements throttled;
  presence changes in a polite live region.
- **Timers / games**: extend-time option; motion-free variant.
- **Authentication**: password field supports paste; 2FA input
  supports paste across digits; WebAuthn offered where possible.

## Severity rubric

| Level        | Meaning                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **Critical** | Blocks a user group entirely (unreachable control for keyboard users, unlabeled primary action for AT, invisible focus ring, missing `html lang`, contrast below 3:1 on body text, keyboard trap) |
| **High**     | Substantially harms a user group on the primary flow (missing skip link, missing error association on forms, missing live-region for toasts, missing reduced-motion fallback, contrast 3:1–4.5:1 on body text, hit targets < 24px) |
| **Medium**   | Clear a11y gap with workaround (missing autocomplete attributes, heading level skipped, icon without tooltip, non-APG custom combobox, landmark missing) |
| **Low**      | Polish and AAA-level wins (AAA contrast, focus appearance refinement, copy tightening, `<abbr>` on jargon) |
| **Note**     | Observation, applicability question, or hypothesis to confirm |

Calibrate: a real audit on a non-a11y-mature codebase should produce
multiple Critical/High findings. If the queue is mostly Lows, re-check
the custom widgets, focus states, and screen-reader flow: something
was under-audited.

## Output format

Emit a single report in this order.

### 1. Verdict

One of:

- **CONFORMANT (AA)**: no Critical or High findings against the
  targeted WCAG level.
- **PARTIALLY CONFORMANT**: no Criticals, but Highs remain.
- **NON-CONFORMANT**: one or more Critical findings, or the surface
  cannot be meaningfully assessed.

Follow with 2–4 sentences: standards targeted (e.g. "WCAG 2.2 AA, RN
platform a11y"), main themes (e.g. "focus management is absent;
semantics are mostly right"), counts of Critical/High, and anything
load-bearing the user should know before the queue.

### 2. Fix queue

Ordered findings with stable IDs `A11Y-001`, `A11Y-002`, …, ordered by
severity then dependency (foundational token/primitive fixes first).

Template per finding:

```markdown
### A11Y-XXX: [one-line title]

| Field                  | Value                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| **Severity**           | Critical \| High \| Medium \| Low \| Note                                                                |
| **WCAG / Standard**    | e.g. `WCAG 2.2 · 2.4.7 Focus Visible (AA)` or `ARIA APG · Dialog` or `RN a11y · accessibilityRole`       |
| **Principle**          | Perceivable \| Operable \| Understandable \| Robust \| Platform \| APG                                   |
| **User impact**        | Who is blocked and how (keyboard-only users cannot activate X; screen-reader users hear no name for Y)   |
| **Confidence**         | confirmed \| likely \| hypothesis                                                                        |
| **Location**           | `path/to/file.ext:line`: narrowest anchor (component, selector, symbol)                                 |
| **Symptom**            | What the code does (or fails to do) today                                                                |
| **Fix intent**         | One sentence: the desired end state                                                                      |
| **Suggested approach** | Concrete: which attribute, which role, which hook, which token. Enough to start editing without re-audit |
| **Verify**             | How to prove the fix (keyboard walk, VO/TalkBack rotor, axe rule, contrast calc, Playwright test)        |
| **Depends on**         | None \| A11Y-YYY                                                                                         |
| **Out of scope**       | Optional: adjacent issues explicitly excluded                                                            |
```

Rules:

- Lead with Criticals. Never bury one in an appendix.
- If a finding repeats across many files because a shared primitive
  is wrong, file it once against the primitive with a note listing
  the consumer files. Do not emit N duplicate findings.
- Mark **Confidence: hypothesis** rather than dropping a shaky
  finding: the user can still triage.
- Every finding must be actionable inside the repo. Things that need
  external work (user testing, VPAT authoring) go in **Out-of-scope**.

### 3. Out-of-scope a11y work

Bulleted handoff list of things that fall outside code edits but the
user should plan. Group as:

- **User testing needed** (screen-reader users, keyboard-only users,
  cognitive-accessibility review).
- **Procurement / vendor** (captioning service, a11y testing
  subscription).
- **Policy / legal** (accessibility statement, VPAT, conformance
  report): reference `launch-readiness` for legal copy checks.
- **Design tokens requiring product decisions** (brand-color swaps
  for contrast, motion reduction policy).

### 4. Passes

Short bulleted list of checklist sections that passed cleanly, each
with a one-line justification so the user sees what was actually
checked (not just what failed). Example:

- **Forms, label association**, every `<input>` in `src/forms/` has
  an associated `<label htmlFor>` or wrapping `<label>`; required
  fields announced via `aria-required`.
- **Reduced motion**: every transition in `src/styles/motion.css`
  is gated on `prefers-reduced-motion: no-preference`.

### 5. Coverage gaps

If any surface or checklist section could not be meaningfully audited
(missing source, unfamiliar stack, native binaries not in repo, no
tests to verify behavior), list it explicitly with what would be
needed. Do **not** silently skip.

## When depth is limited

If the user scopes the audit to a single screen, flow, or component:
audit that scope against every applicable checklist section, but
state in the verdict that the audit was scoped and a full-surface
pass is still needed for a conformance claim.

## What this skill does not do

- Fix anything. Output is a report; remediation is a follow-up pass
  (e.g. `fix-errors` consuming the `A11Y-xxx` queue).
- Make conformance claims on behalf of the organization. It reports
  likely WCAG outcomes from static code reading: real conformance
  requires rendered-page testing, assistive-tech testing, and often
  user testing.
- Replace user testing with disabled users: it flags probable
  blockers but cannot model every assistive-tech interaction.
- Audit live URLs, production services, or env-gated builds.

## Relationship to other skills

- **designer** covers a wider UI/UX surface (hierarchy, motion, QoL)
  and can both audit and fix. This skill is narrower and deeper on
  a11y and audit-only.
- **code-review** targets correctness and security; a11y findings
  from this skill are compatible with the `FIND-xxx` format if the
  user wants to merge queues.
- **fix-errors** consumes the `A11Y-xxx` queue directly when the user
  wants to split audit and remediation across sessions.
- **launch-readiness** covers the legal/policy layer of accessibility
  (accessibility statement, VPAT claims); this skill covers the
  technical layer.
