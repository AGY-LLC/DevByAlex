---
id: stack-uiux
title: "UI/UX Baseline"
summary: "The cross-project design baseline: generic-AI-UI tells, design-system dimensions, the accessibility floor, and a contextual catalog of interaction and perceived-performance patterns selected through docs/DESIGN.md."
tags: ["stack", "uiux", "design", "accessibility", "frontend"]
updated: 2026-11-05
---
# UI/UX Baseline

How I want UI built and reviewed. Per-project specifics live in that project's `docs/DESIGN.md` (see nisatsu for the canonical example); this is the cross-project baseline the `/plan-design`, `/uiux-audit`, and `/accessibility-critique` skills operate against.

Underneath sit the **[universal design rules](../design/universal-design-rules.md)** and the Universal Checklist the `design-critic` agent runs over every screenshot; every screen holds them whatever the style.

## Anti-patterns: the generic-AI-UI no-fly list

The biggest tell of AI-generated UI is defaulting to one "modern SaaS" aesthetic with no intent behind it. Do not introduce:

- **Visual**: the default gradient hero, bento grid, and sparkle/star iconography; a small eyebrow or kicker label (tiny, often uppercase text) above a large heading; a palette that's safe-and-trendy but untied to the brand; uniform, featureless hierarchy; lazy whitespace (too much) or cramped layouts (too little); stock illustrations.
- **Structural**: over-reliance on an unmodified component library; everything the same elevation; no considered focal point.
- **Copy**, corporate/templated phrasing ("streamline your workflow", "unlock your potential"); neutral-to-inert voice with no personality; **internal-decision leakage**, spec/ADR rationale or design reasoning typed into the product, a descriptive paragraph under every section header. Show, don't tell: layout, hierarchy, and labels explain a section; if it needs a preamble, restructure it.
- **Motion**: animation that feels automated rather than designed; motion on everything; center `transform-origin` on popovers; `transition: all`; durations over ~300ms on interruptible UI.

Pick a direction with intent and commit to it: `/plan-design` names it as PRIMARY × SECONDARY from [`../design/design-styles.md`](../design/design-styles.md) and records it in `docs/DESIGN.md` before wireframes.

## Design-system dimensions

Every project pins these down in its `docs/DESIGN.md`, as intent-based tokens (Token | Value | Intent):

- **Color**: fixed slots per hue (Radix): 1 app background, 2 cards/sidebars, 3 component fill, 6–8 borders (8 = focus ring), 9 solid accent, 10 its hover, 11 muted text, 12 main text, both passing contrast on 2. Dark mode: base `#121212`, never pure black; elevation by a white overlay (2% cards up to 12% bars), not shadows; text white at 87 / 60 / 38% (main / secondary / disabled); accents lighter and desaturated, neon only for small highlights.
- **Typography**: ramp (display → body → caption) with weights and tracking; body 16–18px on phones, 18–22px on desktop (dashboards low, editorial high); line height 1.5 body, 1.0–1.2 headings; text columns 45–75 characters (about 65ch, never past 80), never justified. Fluid headings: `clamp()` over 320–1440px viewports, rem bounds, max ≤ 2.5× min (survives 200% zoom); dashboard, table and form text stays fixed, and no element mixes `clamp()` with breakpoint steps or vw-only sizes. All caps get 5–12% extra tracking.
- **Spacing**: default scale 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160px; small steps inside components, large steps set density. Smaller screens step down the scale (16px at 1440px → 8px at 768px), never scale values.
- **Radius / shadow / depth**: intent-based radius vocabulary and a shadow scale (subtle → prominent) with explicit elevation rules. Store one radius; nested radius = outer minus padding (16px card, 8px padding → 8px inside).
- **Motion**: durations 70ms (buttons, toggles), 110 (fades), 150 (small moves), 240 (toasts, expands), 400 (page-level), 700 (background dims only); exits shorter than entrances, never linear. Easing (standard / enter / exit): productive `cubic-bezier(0.2, 0, 0.38, 0.9)` / `(0, 0, 0.38, 0.9)` / `(0.2, 0, 1, 0.9)` for everyday UI; expressive `(0.4, 0.14, 0.3, 1)` / `(0, 0, 0.3, 1)` / `(0.4, 0.14, 1, 1)` only for rare big moments, never on dense tables, settings or terminal themes. Card → detail grows its container, parent ↔ child slides on one axis, unrelated views cross-fade, overlays only fade. One motion language per theme: no springs or second duration scale beside these.
- **Iconography**: one icon set + style, size vocabulary, fill-vs-stroke semantics, decorative vs meaningful.
- **Interactive states**: every component defines default, hover, focus (visible!), active, disabled, loading, error, and empty. Hover / focus / press / drag = one overlay in the content color at 8 / 10 / 10 / 16%, not a darken per component. Each theme picks one press signal (that overlay, a 0.97 scale over 150ms, or a brutalist shadow collapse), never two. Hover lives in `@media (hover: hover)` with the same effect on `:focus-visible`; nothing key hides behind hover, and `(pointer: coarse)` gets bigger controls (never guess touch from width).

## Accessibility floor (WCAG 2.2 AA)

Non-negotiable on every customer-facing surface:

- [ ] **Focus visible**: a solid outline ≥ 2px on `:focus-visible` (inset about 3px), ≥ 3:1 against the unfocused look; over photos, gradients or glass, a 2px light outline inside a 4px dark ring. Never a shadow alone (forced colors drop it), never faded in (2.4.7, 2.4.13).
- [ ] **Focus not obscured**: sticky bars never hide the focused element: `scroll-padding-top` = bar height + 20px, kept in sync on resize; on phones banners sit in the page flow and a tall sticky header never pairs with a fixed bottom bar (2.4.11).
- [ ] **Keyboard**: every action reachable and operable by keyboard; Tab order matches visual order; no traps (2.1.1, 2.4.3).
- [ ] **Contrast**: body text ≥ 4.5:1, large text ≥ 3:1, non-text controls/state ≥ 3:1, against the *actual* rendered background (1.4.3, 1.4.11).
- [ ] **Hit targets**: pointer targets ≥ 24 × 24px, or a 24px circle centered on a smaller one touches no other target; links inside a sentence are exempt; main actions aim for 44 × 44px (2.5.8).
- [ ] **Semantic structure**: one H1, no skipped heading levels, landmarks, real list markup, DOM order = visual order (1.3.1).
- [ ] **Labels & errors**: every input has a visible persistent label; errors follow the form-error default below (2.4.6, 3.3.1, 3.3.3).
- [ ] **Alternatives**: meaningful images have alt text; decorative images hidden; video captioned (1.1.1, 1.2.2).
- [ ] **Reduced motion**: under `prefers-reduced-motion`, motion that shows a status change or place becomes a dissolve, fade or color shift; parallax, animated blur, zooms, spins and shimmer stop; autoplaying carousels pause. Never a blanket no-animation reset that hides status changes. No flashing > 3×/sec (2.3.3).
- [ ] **Zoom & reflow**: survives 200% zoom with no loss; no two-dimensional scroll at 400% except tables/maps; text survives 1.5 line height, 0.12em letter and 0.16em word spacing, so no fixed-height text boxes (1.4.4, 1.4.10, 1.4.12).
- [ ] **Color not the only signal**: pair color with icon + text (e.g. red error gets an icon and a message).
- [ ] **Modal focus management**: focus moves to the first field (or the primary button), Tab is trapped, Esc and the close icon close it, focus returns on close, `aria-modal`/inert applied.

## Component defaults

Exact rules every theme inherits; a theme may restyle these, never loosen them.

- **Modals** only for required input, an urgent alert about the current task, or a confirmation; anything else is a toast, inline notice or page. Only the body scrolls; ≤ 3 buttons, primary rightmost, verb labels (never "OK"), danger style for destructive ones. A modal holding a form never closes on an outside click; never stack modals or use them for tasks people repeat often.
- **Toasts** hold at most two lines with a close button, auto-hide after 5s (10s max), and pause on hover and focus. What a toast says also lives elsewhere in the app. A toast with an action (Undo, a link) never auto-hides; anything the user must act on is an inline notice that stays; field errors never go in toasts.
- **Switches** only for an on/off setting that applies at once and can be undone; anything needing Save, a confirmation or more than two options uses checkboxes or radios, and switches never sit in a form with Submit. The label names what turns on (no questions), state text is only "On" or "Off", and a switch shows a loader while it waits on the server.
- **Form errors**: check a field after its value changed and focus left it (new passwords may check live). The message sits beside the field with an icon, linked by `aria-describedby` and `aria-invalid`; on submit, a summary of links to each bad field goes under the page title and takes focus. Never clear fields or disable Submit up front; word messages as the fix ("Enter date as MM/DD/YYYY"), never "invalid" or "please". No tooltip-only, icon-only or modal errors, and error text never shakes.

## Contextual design-pattern catalog

These 20 patterns are recommendations for when they help a real task,
extending Rules 8, 13–14, 17, 20–21, 23 and 25; not universal requirements or a
retrofit checklist. Prefer the platform's components and the project's stack; a
named technique never requires a new dependency.

**Selection and review path:** [`/plan-design`](../../skills/plan-design/SKILL.md)
records relevant choices in `docs/DESIGN.md` under Component patterns (surface,
benefit, fallback, how to verify), with skip reasons only where the tradeoff
matters. [`/uiux-audit`](../../skills/uiux-audit/SKILL.md) reviews the
chosen behavior and observable gaps; [`/accessibility-critique`](../../skills/accessibility-critique/SKILL.md)
checks keyboard, focus, assistive technology, motion and input access. Missing
an optional pattern alone is not a finding. Actual UI changes still need the
existing tests and screenshot/design-critic path; screenshots cannot prove
rollback, caching or server correctness.

**Shared constraints:** honor reduced motion and preserve semantic state,
focus and keyboard access even when animation is skipped or interrupted.
Measure actual latency, layout stability and resource cost before adding
complexity. Convenience never changes authorization, tenant isolation, consent,
destructive-action confirmation or human approval gates. Reuse existing auth,
payments and data contracts for sensitive operations.

### 1. Skeleton loaders

- **Useful when:** a content region has a predictable shape and noticeable
  first-load latency; reserve its final geometry to reduce layout shift.
- **Build and verify:** loading ladder: show nothing extra under 1s; wait 300ms
  before any loader and keep it at least 400ms once shown; a skeleton for page
  loads and region filters, an inline loop for one busy control, a progress bar
  (or step count) from 3s, and past 10s let people keep working. Skeletons draw
  only layout and data text, never buttons, inputs, toggles, toasts, menus or
  modals; images load as blank space of the same size. Shimmer is an 833ms pass
  plus a 667ms pause. Replace the skeleton with real, empty or error content and
  test slow, failed and instant loads, text scaling and layout shift.
- **Caveats / skip:** hide decorative skeletons from assistive technology and
  announce a concise loading/result status when needed. Never a spinner and a
  skeleton on one area, or a percent bar when the total is unknown; keep
  existing content during refresh rather than replacing it with skeletons.

### 2. Optimistic updates

- **Useful when:** a low-risk, reversible action is likely to succeed, such as
  toggling a favorite. Rule 21's instant feedback must remain honest.
- **Build and verify:** keep the prior state, show pending status, reconcile the
  authoritative result and restore or offer a meaningful retry on failure.
  Prevent an older response or rollback from overwriting newer user intent.
  Test rejection, offline use, rapid repeats and out-of-order completion.
- **Caveats / skip:** announce failures without stealing focus; pair retryable
  writes with stable idempotency where needed (19). Do not optimistically claim
  payment, permission, entitlement or irreversible deletion succeeded. Prefer
  pending confirmation when conflicts or rollback cannot be handled reliably.

### 3. Command menu

- **Useful when:** a dense productivity app has many repeatable actions or
  destinations that benefit from search and keyboard access.
- **Build and verify:** provide a visible entry point and keep core actions
  discoverable elsewhere. Use appropriate dialog and search/combobox semantics,
  selection keys, Escape, focus entry and focus return; verify no-results,
  keyboard-only and screen-reader paths. See [APG dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  and [combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
- **Caveats / skip:** filter results by context and permissions, and recheck
  authorization at execution; the menu is no bypass for confirmations. Avoid
  indexing sensitive content unnecessarily. Skip for a small, obvious action
  set where a menu adds another layer and maintenance cost.

### 4. Shortcut hints

- **Useful when:** frequent desktop actions already have shortcuts; show the
  actual platform/keymap binding beside the action or in accessible help.
- **Build and verify:** keep hints synchronized with handlers and remapping.
  Test keyboard layouts, text editing, IME composition and browser/OS/assistive
  technology conflicts. Preserve a pointer/touch and keyboard navigation path.
- **Caveats / skip:** character-only shortcuts must be switchable, remappable
  or active only when their component has focus ([WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)).
  Do not rely on hover-only hints or intercept reserved combinations. Skip
  invented shortcuts and noisy badges for rare actions or touch-only contexts.

### 5. Undo toasts

- **Useful when:** a minor mistake can actually be reversed, such as archiving
  an item. Recovery must restore the meaningful prior state, including any
  persisted change; hiding a toast or restoring pixels alone is not undo.
- **Build and verify:** use a bounded deferred commit or an authorized
  compensating operation, whichever the existing data model supports. Handle
  conflicts and failed undo honestly. Test expiry, navigation, repeated actions
  and server failure; provide persistent recovery when a short toast is
  insufficient. Avoid deleting newer edits during restoration.
- **Caveats / skip:** announce status politely, make Undo keyboard reachable
  without stealing focus, and allow enough time to act; do not expire it while
  the user interacts with it. Do not replace irreversible-action confirmation
  (Rule 27) or approval gates with a promise the system cannot keep.

### 6. Stale-while-revalidate

- **Useful when:** a previously loaded read can tolerate a defined stale window
  while a background refresh runs. Distinguish application caching from the
  HTTP extension in [RFC 5861](https://www.rfc-editor.org/rfc/rfc5861).
- **Build and verify:** define freshness limits, invalidation and refresh-error
  behavior. Scope keys to identity/tenant/query; clear or isolate caches on
  logout/account switch. Prevent older refreshes from replacing newer writes.
  Test expiry, reconnect, mutation, identity switch and failed refresh. Show
  age/refresh status where it affects decisions without resetting focus.
- **Caveats / skip:** obey private/no-store policies; avoid shared caching of
  private responses. Never use stale permissions, entitlements, balances,
  inventory or prices as authority for consequential actions: revalidate at
  the decision boundary. Skip stale display entirely where freshness is vital.

### 7. Pre-rendering

- **Useful when:** stable public pages benefit from build/server rendering, or
  a likely next navigation benefits from speculative browser rendering. Name
  which approach is intended; prefetching alone does not render a page.
- **Build and verify:** keep personalized output out of shared/static caches.
  For speculation, choose likely safe destinations, respect support/resource
  limits, and defer analytics and side effects until activation. Verify actual
  navigation latency, hydration, freshness and wasted bytes on target devices.
  See [Chrome's prerender lifecycle](https://developer.chrome.com/docs/web-platform/prerender-pages).
- **Caveats / skip:** links and normal navigation must work without speculation.
  Do not speculate routes that mutate state, log out, consume single-use links
  or expose sensitive data. Skip low-probability routes or heavy work that
  competes with the current task; avoid a rendering migration for tiny gains.

### 8. BlurHash placeholders

- **Useful when:** image-heavy feeds have delayed images and a compact preview
  improves perceived loading. Reuse existing media metadata if available.
- **Build and verify:** generate from small source images, decode at low
  resolution, reserve aspect ratio, and swap to the real image or error state.
  Measure metadata, decode and bundle cost against a solid-color placeholder;
  see the [original BlurHash guidance](https://github.com/woltapp/blurhash).
- **Caveats / skip:** the preview carries image-derived information, so give it
  the same privacy/access boundaries as the image. It is not redaction. Hide
  the decorative preview from assistive technology; retain the real image's
  alt text and readable text overlays. Skip small/instant images, sensitive
  previews or cases where decode work outweighs the benefit.

### 9. View transitions

- **Useful when:** a short transition clarifies continuity between related
  states or destinations (Rule 17).
- **Build and verify:** progressively enhance an otherwise correct state or
  navigation update. Keep real DOM semantics, focus destination, history and
  scroll behavior deliberate. Test unsupported browsers, rapid navigation,
  cancellation and reduced motion; skip nonessential motion when requested.
  See [CSS View Transitions](https://www.w3.org/TR/css-view-transitions-1/).
- **Caveats / skip:** a visual snapshot does not manage focus or announce a
  route. Avoid capturing sensitive content in shared transition visuals and
  measure snapshot memory/paint cost. Skip large decorative movements, slow
  transitions or anything that delays access to the next action.

### 10. Swipe-to-dismiss sheets

- **Useful when:** a mobile sheet contains temporary, dismissible context and
  swiping matches the platform's conventions.
- **Build and verify:** prefer the existing native sheet behavior; distinguish
  scrolling from dismissal and test partial/cancelled drags, keyboard-open
  layouts, nested scrolling and unsaved input. Apply the modal focus contract
  only to modal sheets; return focus logically on close.
- **Caveats / skip:** provide a visible close/cancel control and platform
  keyboard/assistive dismissal path. Respect reduced motion and protect drafts
  with save/discard recovery. Skip gesture-only dismissal, forced workflows or
  destructive effects on dismiss; do not override system edge gestures.

### 11. Interruptible animations

- **Useful when:** users can reverse a toggle, dismiss an overlay or change
  direction before motion ends.
- **Build and verify:** retarget from the current visual position and keep
  semantic state authoritative; cancellation/completion must not fire stale
  callbacks or commit an action twice. Test rapid reversal, unmount/navigation
  and background/resume. Native support includes [UIViewPropertyAnimator](https://developer.apple.com/documentation/uikit/uiviewpropertyanimator/isinterruptible).
- **Caveats / skip:** keyboard and assistive actions must remain responsive;
  reduced motion must reach the same correct state immediately. Prefer cheap
  animation properties and measure on slower devices. Skip custom animation
  machinery for static changes; never lock input until decorative motion ends.

### 12. Predictive back

- **Useful when:** Android's back gesture can preview the real destination,
  improving predictable navigation. This is a platform behavior, not a
  universal custom swipe animation.
- **Build and verify:** use the supported system/navigation APIs for the app's
  target SDK and installed navigation version; do not assume legacy back-key
  interception is equivalent. Preview without committing, restore on cancel,
  and navigate once on completion. Test gesture progress/cancel, button Back,
  nested stacks, sheets and unsaved drafts. See [Android's migration guide](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture).
- **Caveats / skip:** preserve accessible navigation and platform motion
  settings; avoid sensitive preview exposure. Skip a custom handler when the
  navigator already provides correct behavior, and do not imitate Android's
  system gesture on other platforms without a platform-specific need.

### 13. Hit slop

- **Useful when:** a small visible icon needs a larger, forgiving touch target
  without changing its visual weight. Prefer real padding/minimum size first.
- **Build and verify:** inspect the effective hit region, accessibility bounds,
  focus ring and adjacent controls on devices. Test edge taps and overlaps;
  React Native [Pressable hitSlop](https://reactnative.dev/docs/pressable#hitslop)
  cannot extend beyond parent bounds and overlapping siblings have precedence.
- **Caveats / skip:** retain labels and keyboard access. Target sizing follows
  each platform's units and guidance; web [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  uses CSS pixels and has spacing/exceptions. Skip overlapping invisible
  regions or hit slop used to excuse cramped layout; enlarge/re-space controls.

### 14. Safe area insets

- **Useful when:** full-screen or edge-to-edge content meets cutouts, system
  bars, home indicators or gesture regions. Let backgrounds extend while
  keeping important content and controls reachable.
- **Build and verify:** consume current [UIKit safe areas](https://developer.apple.com/documentation/uikit/uiview/safeareainsets),
  [Android window insets](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
  or web [safe-area environment variables](https://www.w3.org/TR/css-env-1/#safe-area-insets),
  using the existing stack. Test rotation, split view, keyboard, sheets, large
  text and bottom controls; handle keyboard avoidance separately where needed.
- **Caveats / skip:** do not double-apply insets already consumed by a parent,
  hard-code a device notch, or assume safe-area padding fixes keyboard/focus
  occlusion. Skip extra padding on surfaces already correctly inset.

### 15. One-time code autofill

- **Useful when:** an existing authentication flow requires an OTP; reduce
  transcription effort without changing that flow's security contract.
- **Build and verify:** use web `autocomplete="one-time-code"` ([HTML](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill))
  or Apple's `oneTimeCode` content type and [domain-bound SMS format](https://developer.apple.com/documentation/security/enabling-autofill-for-domain-bound-sms-codes)
  where supported. Android integrations should follow [permission-minimizing APIs](https://developer.android.com/privacy-and-security/minimize-permission-requests).
  Keep a labeled field, manual entry and paste; test real-device autofill,
  expired/wrong codes, resend, focus and full-code paste into any segmented UI.
- **Caveats / skip:** verify expiry, single use, attempts and session binding
  on the server; never log codes or request broad SMS/clipboard access for
  convenience. Autofill is not phishing-resistant authentication. Skip a new
  OTP integration where the auth design does not need one; do not auto-submit
  consequential actions just because a field was filled.

### 16. Tabular numbers

- **Useful when:** changing counters, timers, prices or numeric columns would
  otherwise jitter or become hard to compare.
- **Build and verify:** use supported font features such as
  [`font-variant-numeric: tabular-nums`](https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop)
  or the native equivalent. Test the actual font/fallback, localized digits,
  currencies, signs, decimal alignment and large text; equal digit widths do
  not by themselves align all punctuation or fix container width changes.
- **Caveats / skip:** preserve semantic values and readable formatting; avoid
  announcing every timer tick to screen readers. Skip blanket use in prose or
  a font download solely for this effect when a stable layout suffices.

### 17. Balanced headlines

- **Useful when:** short multi-line headings have awkward final lines at
  common viewport widths.
- **Build and verify:** progressively enhance with
  [`text-wrap: balance`](https://www.w3.org/TR/css-text-4/#text-wrap-style)
  where supported. Check actual browser behavior, webfont/fallback loading,
  localization, narrow widths and text zoom; balancing algorithms and limits
  vary. Retain real heading semantics and natural reading order.
- **Caveats / skip:** let normal wrapping remain a valid fallback; never
  hard-code line breaks that break translations or shrink type to force a
  silhouette. Skip body copy, editable text and large repeated blocks where
  extra layout work or rewrapping harms reading/performance.

### 18. Continuous corners

- **Useful when:** the chosen design system calls for smoothly joining curved
  corners on cards, sheets or controls.
- **Build and verify:** prefer platform shapes, for example Apple's
  [continuous corner curve](https://developer.apple.com/documentation/quartzcore/calayercornercurve/continuous),
  and an ordinary radius fallback elsewhere. Inspect clipping, border/shadow,
  nested radii, focus outlines, touch bounds and rendering cost across sizes.
- **Caveats / skip:** preserve control recognition, contrast and focus rings;
  visual clipping must not remove content or change the usable target. CSS
  radius alone does not promise an identical native curve. Skip a new drawing
  dependency, expensive masks or shape changes that conflict with project tokens.

### 19. Idempotency keys

- **Useful when:** retries, double submission or ambiguous network failures
  could repeat a consequential write. This is a server/data reliability
  contract that supports trustworthy feedback, not merely a disabled button.
- **Build and verify:** create one stable identity per logical operation and
  retain it across retries/reconnects; use a new identity for a new intent.
  Scope it to the authorized actor/tenant and operation, bind it to the payload,
  and reject mismatched reuse. Atomically claim/deduplicate the operation and
  durably coordinate its effect with the recorded outcome; external effects
  need the existing provider's idempotency/reconciliation contract. Concurrent
  requests must not both execute. After a timeout, recover/replay the outcome
  using the same identity rather than start a fresh write blindly.
- **Caveats / skip:** define retention, in-progress and failed-result behavior
  against the real API; [Stripe's contract](https://docs.stripe.com/api/idempotent_requests)
  is an example, not a universal TTL or failure policy. Test concurrent
  duplicates, response loss after commit, crash recovery, changed payload and
  cross-tenant reuse. Keys contain no secrets/PII and never replace auth,
  confirmation or rollback; show pending until the result is known. Skip
  bespoke key infrastructure for already-idempotent reads or safe local state;
  reuse existing contracts instead of building distributed machinery by default.

### 20. Amazon safe triangle

- **Useful when:** a pointer user travels diagonally from a parent menu item
  into a nested submenu and would accidentally cross sibling items.
- **Build and verify:** use a bounded hover-intent corridor toward the open
  submenu to delay sibling activation while intent is plausible, then switch
  promptly when direction changes. Test diagonal/slow movement, exit/re-entry,
  left/right placement, zoom and viewport edges. See the [original explanation](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown)
  and [menu-aim implementation](https://github.com/kamens/jQuery-menu-aim).
- **Caveats / skip:** this is pointer interaction geometry, not a security
  feature. Keep click/tap, keyboard navigation, visible focus and Escape
  independent of the corridor; support hoverable/dismissible submenu content.
  Do not add jQuery just for this pattern. Skip simple menus and touch-first
  navigation, or fix an unnecessarily deep hierarchy before adding heuristics.

## Setting direction (the `/plan-design` interview)

The questions live in [`../practices/uiux.yaml`](../practices/uiux.yaml) (`inputs_to_gather_first` and `questions`).

*See also: [Tailwind](./tailwind.md) | `/plan-design`, `/uiux-audit`, `/accessibility-critique` skills*
