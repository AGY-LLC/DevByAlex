---
id: stack-uiux
title: "UI/UX Baseline"
summary: "The cross-project design baseline: generic-AI-UI tells, design-system dimensions, the accessibility floor, and a contextual catalog of interaction and perceived-performance patterns selected through docs/DESIGN.md."
tags: ["stack", "uiux", "design", "accessibility", "frontend"]
updated: 2026-11-08
---
# UI/UX Baseline

How I want UI built and reviewed. Per-project specifics live in that project's `docs/DESIGN.md` (see nisatsu for the canonical example); this is the cross-project baseline the `/plan-design`, `/uiux-audit`, and `/accessibility-critique` skills operate against.

Underneath sit the **[universal design rules](../design/universal-design-rules.md)** and the Universal Checklist the `design-critic` agent runs over every screenshot; every screen holds them whatever the style.

## Anti-patterns: the generic-AI-UI no-fly list

The biggest tell of AI-generated UI is defaulting to one "modern SaaS" aesthetic with no intent behind it. Do not introduce:

- **Visual**: the default gradient hero, bento grid, and sparkle/star iconography; a small eyebrow or kicker label (tiny, often uppercase text) above a large heading; a palette that's safe-and-trendy but untied to the brand; uniform, featureless hierarchy; lazy whitespace (too much) or cramped layouts (too little); stock illustrations.
- **Structural**: card, tile or boxed grids as the default layout for every section (let the content set the shape: flowing text, lists, rows, asymmetry, full-bleed bands); a phone layout that is only the desktop page shrunk; over-reliance on an unmodified component library; everything the same elevation; no considered focal point.
- **Copy**, corporate/templated phrasing ("streamline your workflow", "unlock your potential"); neutral-to-inert voice with no personality; **internal-decision leakage**, spec/ADR rationale or design reasoning typed into the product, a descriptive paragraph under every section header. Show, don't tell: layout, hierarchy, and labels explain a section; if it needs a preamble, restructure it.
- **Motion**: animation that feels automated rather than designed; motion on everything; scroll reveals on dashboards, forms or checkout; `transition: all`; durations over ~300ms on interruptible UI.

Pick a direction with intent and commit to it: `/plan-design` names it as PRIMARY × SECONDARY from [`../design/design-styles.md`](../design/design-styles.md) and records it in `docs/DESIGN.md` before wireframes.

## Design-system dimensions

Every project pins these down in its `docs/DESIGN.md`, as intent-based tokens (Token | Value | Intent):

- **Color**: fixed slots per hue (Radix): 1 app background, 2 cards/sidebars, 3 component fill, 6–8 borders (8 = focus ring), 9 solid accent (dark text on yellow, amber, lime, mint, sky), 10 its hover, 11 muted text, 12 main text, both passing contrast on 2. Dark mode: base `#121212`, never pure black; elevation by a white overlay (5% at 1dp, 7% at 2dp, 9% at 4dp, 12% at 8dp, 16% at 24dp), not shadows; text white at 87 / 60 / 38% (main / secondary / disabled); accents step to the 200 tone (600 in light), neon only for small highlights.
- **Typography**: ramp (display → body → caption) with tracking +0.25% at 12px, 0 at 16, -0.5% at 20, -0.75% at 28, -1% at 35, -2.5% at 60+; weights under Regular only at display sizes; body 16–18px on phones, 18–22px on desktop (dashboards low, editorial high); line height 1.5 body, 1.0–1.2 headings; text columns 45–75 characters (about 65ch, never past 80), never justified. Fluid headings: `clamp()` over 320–1440px viewports, rem bounds, max ≤ 2.5× min (survives 200% zoom); dashboard, table and form text stays fixed, and no element mixes `clamp()` with breakpoint steps or vw-only sizes. All caps get 5–12% extra tracking.
- **Spacing**: default scale 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160px; small steps inside components, large steps set density. Smaller screens step down the scale (16px at 1440px → 8px at 768px), never scale values.
- **Radius / shadow / depth**: radius scale 3, 4, 6, 8, 12, 16px times one factor per theme: 0 brutalist or terminal, 0.75 editorial, 1 neutral SaaS, 1.5 soft or playful. Pills only at 1.5 (a capsule is half its height), never across dense data UI; checkboxes never round. Nested radius = outer minus padding (16px card, 8px padding → 8px inside), never the same radius inside and out. Shadows: one light source above left, y offset twice x, blur equal to y, higher elevations stack more layers, tinted with the background's hue (never black, never animated); brutalist, flat and terminal themes skip them.
- **Motion**: durations 70ms (buttons, toggles), 110 (fades), 150 (small moves), 240 (toasts, expands), 400 (page-level), 700 (background dims only); exits shorter than entrances, never linear. Easing (standard / enter / exit): productive `cubic-bezier(0.2, 0, 0.38, 0.9)` / `(0, 0, 0.38, 0.9)` / `(0.2, 0, 1, 0.9)` for everyday UI; expressive `(0.4, 0.14, 0.3, 1)` / `(0, 0, 0.3, 1)` / `(0.4, 0.14, 1, 1)` only for rare big moments, never on dense tables, settings or terminal themes. Card → detail grows its container, parent ↔ child slides on one axis, unrelated views cross-fade, overlays only fade (150ms in, 70 out), except popovers and menus, which also scale from 95% out of their trigger's edge, 4px from it (terminal and brutalist themes just appear). The more often it happens, the less it moves: keyboard shortcuts and the command menu don't animate. Springs only for drags, sheets and moves people interrupt (bounce 0 to 0.15, never over 0.3, never on opacity); one motion language per theme, no second duration scale.
- **Iconography**: one set and style, never mixed with a set of another stroke ratio; sizes 16, 20, 24, 32 only, stroke = size / 16; a 16px icon sits with 14px text, 20 with 16. Center icons on the text line, not the baseline, and pad the hit area to 44px rather than enlarge the glyph. Fill vs stroke has one meaning; decorative icons are hidden.
- **Interactive states**: every component defines default, hover, focus (visible!), active, disabled, loading, error, and empty. Hover / focus / press / drag = one overlay in the content color at 8 / 10 / 10 / 16%, not a darken per component. Each theme picks one press signal (that overlay, a 0.97 scale over 150ms, or a brutalist shadow collapse), never two. Hover lives in `@media (hover: hover)` with the same effect on `:focus-visible`; nothing key hides behind hover, and `(pointer: coarse)` gets bigger controls (never guess touch from width).

## Accessibility floor (WCAG 2.2 AA)

Non-negotiable on every customer-facing surface:

- [ ] **Focus visible**: a solid outline ≥ 2px on `:focus-visible` (inset about 3px), ≥ 3:1 against the unfocused look; over photos, gradients or glass, a 2px light outline inside a 4px dark ring. In menus, list rows, `overflow: hidden` boxes and at page edges the ring goes inside (negative offset). Never `outline: none` or a shadow alone without a transparent outline (forced colors drop shadows), never faded in (2.4.7, 2.4.13).
- [ ] **Focus not obscured**: sticky bars never hide the focused element: `scroll-padding-top` = bar height + 20px, kept in sync on resize; on phones banners sit in the page flow and a tall sticky header never pairs with a fixed bottom bar (2.4.11).
- [ ] **Keyboard**: every action reachable and operable by keyboard; Tab order matches visual order; no traps (2.1.1, 2.4.3).
- [ ] **Contrast**: body text ≥ 4.5:1, large text ≥ 3:1, non-text controls/state ≥ 3:1, against the *actual* rendered background (1.4.3, 1.4.11).
- [ ] **Hit targets**: pointer targets ≥ 24 × 24px, or a 24px circle centered on a smaller one touches no other target; links inside a sentence are exempt; main actions aim for 44 × 44px (2.5.8).
- [ ] **Semantic structure**: one H1, no skipped heading levels, landmarks, real list markup, DOM order = visual order (1.3.1).
- [ ] **Labels & errors**: every input has a visible persistent label; errors follow the form-error default below (2.4.6, 3.3.1, 3.3.3).
- [ ] **Alternatives**: meaningful images have alt text; decorative images hidden; video captioned (1.1.1, 1.2.2).
- [ ] **Reduced motion**: under `prefers-reduced-motion`, motion that shows a status change or place becomes a dissolve, fade or color shift; parallax, animated blur, zooms, decorative spins and shimmer stop (loading spinners keep turning, since a still one reads as frozen); autoplaying carousels pause. Never a blanket no-animation reset that hides status changes. No flashing > 3×/sec (2.3.3).
- [ ] **Zoom & reflow**: survives 200% zoom with no loss; no two-dimensional scroll at 400% except tables/maps; text survives 1.5 line height, 0.12em letter and 0.16em word spacing, so no fixed-height text boxes (1.4.4, 1.4.10, 1.4.12).
- [ ] **Color not the only signal**: pair color with icon + text (e.g. red error gets an icon and a message).
- [ ] **Modal focus management**: focus moves to the first field (or the primary button), Tab is trapped, Esc and the close icon close it, focus returns on close, `aria-modal`/inert applied.

## Component defaults

Exact rules every theme inherits; a theme may restyle these, never loosen them.

- **Modals** only for required input, an urgent alert about the current task, or a confirmation; anything else is a toast, inline notice or page, and anything wider than 640px is a page. Only the body scrolls; ≤ 3 buttons, primary rightmost, verb labels (never "OK"), danger style for destructive ones. A modal holding a form never closes on an outside click; never stack modals, open one unasked, or use them for tasks people repeat often. Widths 320, 480 (default) or 640px with 24px padding, a bottom sheet on phones, black 50% backdrop.
- **Toasts** hold at most two lines with a close button, auto-hide after 5s (10s max), and pause on hover and focus. What a toast says also lives elsewhere in the app. A toast with an action (Undo, a link) never auto-hides; anything the user must act on is an inline notice that stays; field errors never go in toasts.
- **Switches** only for an on/off setting that applies at once and can be undone; anything needing Save or a confirmation is a checkbox, 3 to 5 options are radios and more a select, two opposite views a segmented control (2 to 5 nouns or 6 icons, applies at once, never navigates, becomes a menu when narrow); switches never sit in a form with Submit. The label names what turns on (no questions), state text is only "On" or "Off", and a switch shows a loader while it waits on the server. Track 48×24px with an 18px handle; in table rows 32×16px with a 10px handle and a check when on.
- **Form errors**: check a typed field when focus leaves it, never on focus; empty required fields wait for submit; once a field shows an error, recheck on each keystroke and clear it when valid (new passwords may check live). The message sits beside the field with an icon, linked by `aria-describedby` and `aria-invalid`; on submit, a summary of links to each bad field goes under the page title and takes focus, and the title starts with "Error: ". Never clear fields or disable Submit up front; empty fields get an instruction ("Enter your name"), broken rules a description ("Name must be 35 characters or less"), never "please", "sorry", "invalid", "oops" or "This field is required". The summary is headed "There is a problem" and shows even for one error. A character count appears at 75% of the limit and never blocks typing or pasting. No tooltip-only, icon-only or modal errors, and error text never shakes. Success ticks only on password, username and character-count fields.
- **Tooltips** label icon-only controls or give a short hint: open after 100ms of hover for an icon label, 400 to 700ms for a description (at once when moving between tooltips within 300ms), at once on keyboard focus, never on click; close on Esc or 300ms after the pointer leaves, staying open while hovered. One line, above the trigger by default. Never links, buttons or must-read text inside (use a popover); touch-first screens show visible labels instead. Hover panels and top-nav menus open after 300 to 500ms and close 500ms after the pointer leaves both trigger and panel.
- **Tables**: one row height per table, 24, 32, 40 (default), 48 or 64px (64 only for two-line rows), with header, toolbar and pagination the same height; 16px side padding, 14px text with a semibold header, and a caption. Compared numbers right-aligned in tabular figures with thousands separators and the same decimals down the column, text and IDs left, headers follow their column, never centered text; a missing value shows "–"; the sort icon shows only on the sorted column. Zebra stripes (from 4 rows and 3 columns) or faint row dividers, never both; rows under 44px only on pointer layouts and never in pastel, clay or editorial themes; no display fonts in numeric cells.
- **Empty states** are left-aligned (centered only in tiles) and replace the element they stand for (an empty table drops its headers) and never show while loading. A title naming the next step, at most 3 lines of body, one primary action; no illustration in toasts, strips or tiles under 260px wide.
- **Charts**: one series in the brand color; highlight by muting the rest; status colors only for status. Categorical colors in a fixed order, at most 6 plus "Other"; sequential scales are one hue in up to 10 steps, darkest on the maximum in light mode, lightest in dark; pastel themes use tints of the series hues. Never color alone, a gradient instead of a scale, or glass behind a chart.
- **Drag and drop**: a grab cursor only on a handle of at least 24px (a card holding buttons drags only by it); the original stays at 40% opacity, the preview sits 16px right and 8px down, at most 280px square, never tilted; a 2px line with an 8px dot, centered in the gap, marks the drop spot, and the dropped item flashes for 700ms. Every move also sits in the item's menu for keyboard users.
- **Flows and paging**: a stepper only for fixed-order flows of 3 to 6 steps; any-order or multi-sitting flows get a task list page. Pagination always shows the first and last page plus 2 either side of the current (1 on phones) with ellipses, hides on one page, and resets to page 1 on any sort or filter; never auto-loading infinite scroll above a footer. Breadcrumbs start at home and end at the parent, never the current page, and never wrap or carry icons; from 5 levels show the first and last 3 with a "…" menu between, on phones only a back link; none on flat sites or single-page layouts.
- **Disclosure**: accordions when several sections may be open at once ("Open all" from 3), tabs to switch between equal sections, a disclosure for one or two minor bits; all start closed, and a header is one click target of 5 to 10 parallel words with one chevron style. Hide closed panels with `<details>` or `hidden="until-found"` so find-in-page reaches them, never `display: none`, with `aria-expanded` in sync. Never nested, never controls in headers, never hiding what everyone needs. A full tab row drops its icons, then moves its last tabs into More (never just one; the current tab swaps with the last visible).
- **Truncation** cuts at the end, or the middle for file names, hashes and paths, keeping at least 4 characters and a "…"; full text in a tooltip up to about 150 characters, past that a Show more. Never truncate titles, labels, column headers, navigation, errors or notifications, and never fade or scroll text inside a box instead.
- **Search suggestions**: at most 10 on desktop, 4 to 8 on phones, no scrollbar, the untyped part bold, the active row shaded, on a solid surface without separators or zebra rows; arrows loop and copy the row into the field, Return submits.
- **Copy and upload**: a copy button stays visible beside its value, is named for it ("Copy branch name"), and only after a real success shows a success-colored check and "Copied!" for 2s, no toast; where copying can't work, remove it. Uploads get an always-visible drop zone around a secondary "Choose file" button and one specific error per failure ("The selected file must be smaller than 2MB").
- **Range inputs**: sliders only for relative values with 4 or more stops (fewer are radios), snapping to real stops with the value and unit under the thumb; never for prices, quantities or progress. Number steppers only for small whole numbers near a default: a typable field between minus (left) and plus (right) of at least 44px, long press repeats, the end button disables at the limit; never for prices, ages, dates or decimals, never paired with a slider.
- **Carousels** hold 2 to 5 self-contained slides of one height, controls under them at 44px and "2 of 5" text over dots alone; autoplay turns every 5s behind a visible stop button that comes first, pauses on hover and focus, and stays off under reduced motion. Never calls to action, pricing or comparisons, never in dashboards or terminal themes.
- **Inline edit**: Enter saves and Esc cancels; single-line fields also save on blur, multi-line ones stay open; save and cancel icons stay visible, one table row edits at a time, and read and edit share type and alignment. Never in forms with Save or for new entries.
- **Sticky headers** only for items used often: opaque (never glass), at most 5 items, hidden on scroll down and back with a 300ms slide on scroll up; never over phone forms. **Drawers** come from the right, pushing content on wide screens or overlaying it, with a resize handle on the inner edge; phones get a sheet, marketing pages neither.
- **Pricing**: plans run simplest (left) to priciest (right), the most popular in the middle with the only filled button; the monthly or annual toggle sits above and states the saving in words ("2 months free"); about 4 key features per plan, a comparison table only past about 20, with plan names and buttons pinned. Never Bento or a carousel.
- **Dates**: relative under a month ("5 minutes ago"), then "on Nov 18" (year only if not this year); deadlines, bookings and invoices always absolute. Known dates (a birthday) are Day, Month, Year text fields that never auto-jump; dates people look up get a picker.
- **Badges and avatars**: a badge holds only a number (16px pill, 99+ cap) or is a 6px dot; words go in a tag. People are circles, projects and bots rounded squares; stacks show up to 5, then a +N that names the rest.

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
  plus a 667ms pause, static on dense repeated lists. Text bars are 16 or 24px tall, 8px apart, 4px radius; icons, badges and tiny text get no placeholder, and loaded titles stay. Replace the skeleton with real, empty or error content and
  test slow, failed and instant loads, text scaling and layout shift.
- **Caveats / skip:** hide skeletons from assistive technology; one
  always-present status region announces start, finish and failure, once per
  group. Never a spinner and a
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

- **Useful when:** a dense app has many repeatable actions or destinations.
- **Build and verify:** ⌘K on Mac, Ctrl+K elsewhere, never reused for an
  in-page filter, plus a visible entry point; core actions stay findable
  elsewhere. Empty input shows recents; items are verb phrases with their
  shortcut ("Deploy project"), the placeholder ends in "…", group headings are
  1 or 2 words. Past about 30 items or mixed types, split into pages;
  Backspace in an empty input goes back one, keeping the query. Dialog and
  combobox semantics ([APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)),
  focus trapped and returned, result count announced politely.
- **Caveats / skip:** filter by context and permissions and recheck
  authorization on run; never a bypass for confirmations or the only
  navigation. Skip on pages with few actions (marketing, editorial, toy).

### 4. Shortcut hints

- **Useful when:** frequent desktop actions already have shortcuts.
- **Build and verify:** show a hint only where the shortcut works now, at the
  end of the button or menu row or in an icon button's tooltip, at body text
  size in the text's own color. Modifiers in the order ⌃⌥⇧⌘, one Mod key (⌘ on
  Mac, Ctrl elsewhere), "+" for keys held together (Mod+Shift+P), a space for
  sequences (g i). Keep hints in sync with handlers and remapping; test
  keyboard layouts and IME composition.
- **Caveats / skip:** never reuse a standard binding (⌘Z) or add a modifier to
  one for something unrelated; character-only shortcuts must be switchable or
  focus-scoped ([WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)).
  Skip on touch-first layouts, toy themes and marketing buttons.

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

- **Useful when:** stable public pages gain from build or server rendering, or
  a likely next page from speculative rendering (prefetching alone renders
  nothing).
- **Build and verify:** keep personalized output out of shared caches; defer
  analytics and side effects until activation; measure real latency, hydration
  and wasted bytes ([Chrome](https://developer.chrome.com/docs/web-platform/prerender-pages)).
- **Caveats / skip:** never speculate routes that mutate, log out, consume
  single-use links or expose sensitive data; skip unlikely routes and tiny
  gains.

### 8. BlurHash placeholders

- **Useful when:** image-heavy feeds load slowly and a compact preview beats a
  solid color.
- **Build and verify:** generate from small sources, reserve the aspect ratio,
  swap to the image or its error state, and measure decode and bundle cost
  against a solid color ([BlurHash](https://github.com/woltapp/blurhash)).
- **Caveats / skip:** the preview leaks image content, so it gets the image's
  access rules and is never redaction; hide it from assistive technology. Skip
  small, instant or sensitive images.

### 9. View transitions

- **Useful when:** a short transition shows continuity between related states
  (Rule 17).
- **Build and verify:** enhance an update that already works without it; focus,
  history and scroll stay deliberate. Test unsupported browsers, rapid
  navigation and reduced motion ([spec](https://www.w3.org/TR/css-view-transitions-1/)).
- **Caveats / skip:** a snapshot neither moves focus nor announces a route, and
  may capture sensitive content. Skip large, slow or decorative moves that
  delay the next action.

### 10. Swipe-to-dismiss sheets

- **Useful when:** a phone sheet holds temporary, dismissible context; desktop
  pointer layouts use a modal or side panel instead.
- **Build and verify:** prefer the native sheet. Dismiss on a flick faster
  than 0.4px per ms or a drag past 25% of the visible height; an upward drag
  resists and snaps back; open and close take 500ms on
  `cubic-bezier(0.32, 0.72, 0, 1)`. Tell scrolling from dismissal and test
  cancelled drags, the open keyboard and nested scrolling; modal sheets get the
  modal focus contract.
- **Caveats / skip:** keep a visible close control and a keyboard path. A sheet
  holding a long form or unsaved input never drag-dismisses; skip in
  brutalist, terminal and print themes.

### 11. Interruptible animations

- **Useful when:** users can reverse a toggle, dismiss an overlay or change
  direction before motion ends.
- **Build and verify:** retarget from the current position with semantic state
  authoritative; no stale callbacks or double commits. Test rapid reversal,
  unmount and background/resume.
- **Caveats / skip:** reduced motion reaches the same state at once; never lock
  input until decorative motion ends.

### 12. Predictive back

- **Useful when:** Android's back gesture can preview the real destination.
- **Build and verify:** use the system navigation APIs for the target SDK
  ([guide](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture));
  preview without committing, restore on cancel, navigate once on completion.
  Test cancel, button Back, nested stacks, sheets and unsaved drafts.
- **Caveats / skip:** skip a custom handler when the navigator already does
  it, and never imitate the gesture on other platforms.

### 13. Hit slop

- **Useful when:** a small icon needs a larger touch target without more visual
  weight; real padding or minimum size comes first.
- **Build and verify:** inspect the hit region, accessibility bounds and focus
  ring on devices; React Native [hitSlop](https://reactnative.dev/docs/pressable#hitslop)
  can't pass parent bounds and loses to overlapping siblings.
- **Caveats / skip:** never overlapping invisible regions or slop excusing a
  cramped layout; re-space the controls.

### 14. Safe area insets

- **Useful when:** edge-to-edge content meets cutouts, system bars or gesture
  regions; backgrounds extend, controls stay reachable.
- **Build and verify:** consume [UIKit safe areas](https://developer.apple.com/documentation/uikit/uiview/safeareainsets),
  [Android window insets](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
  or web [`env(safe-area-inset-*)`](https://www.w3.org/TR/css-env-1/#safe-area-insets);
  test rotation, split view, keyboard, sheets and large text.
- **Caveats / skip:** never double-apply insets a parent consumed or hard-code
  a notch; insets do not handle the keyboard.

### 15. One-time code autofill

- **Useful when:** an existing sign-in already sends an OTP.
- **Build and verify:** one native text field with `inputmode="numeric"`,
  `autocomplete="one-time-code"` ([HTML](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill))
  and `maxlength` at the code's length; large monospaced digits with wide
  tracking, a label naming the length and where it went, "Try another way"
  under it. Split boxes, if a theme insists, take a full paste and step back on
  Backspace. Test real devices, expired and wrong codes, and resend.
- **Caveats / skip:** never `type="number"` or auto-submit beside a Submit
  button; the server enforces expiry, single use and attempts, and codes are
  never logged.

### 16. Tabular numbers

- **Useful when:** counters, timers, prices or numeric columns would jitter or
  be hard to compare.
- **Build and verify:** [`font-variant-numeric: tabular-nums`](https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop)
  or the native equivalent; test the real font and fallback, localized digits,
  signs and large text. Equal digit widths do not align decimals by themselves.
- **Caveats / skip:** never announce every timer tick; skip prose and font
  downloads made only for this.

### 17. Balanced headlines

- **Useful when:** short multi-line headings end on an awkward last line.
- **Build and verify:** progressively enhance with
  [`text-wrap: balance`](https://www.w3.org/TR/css-text-4/#text-wrap-style);
  check fallback fonts, localization, narrow widths and text zoom.
- **Caveats / skip:** normal wrapping stays a valid fallback; never hard-code
  line breaks or shrink type to force a shape. Skip body and editable text.

### 18. Continuous corners

- **Useful when:** the design system calls for smooth (squircle) corners on
  cards, sheets or controls.
- **Build and verify:** use platform shapes such as Apple's
  [continuous corner curve](https://developer.apple.com/documentation/quartzcore/calayercornercurve/continuous)
  and a plain radius elsewhere; check clipping, borders, focus rings and touch
  bounds.
- **Caveats / skip:** CSS radius does not match the native curve; skip new
  drawing dependencies or costly masks.

### 19. Idempotency keys

- **Useful when:** retries, double submits or lost responses could repeat a
  consequential write; this is a server contract, not a disabled button.
- **Build and verify:** one stable key per logical operation, kept across
  retries and new for a new intent; scope it to actor, tenant and operation,
  bind it to the payload and reject mismatched reuse. Claim it atomically so
  concurrent duplicates run once, and after a timeout replay the recorded
  outcome. Test concurrent duplicates, response loss after commit, crash
  recovery and cross-tenant reuse ([Stripe's contract](https://docs.stripe.com/api/idempotent_requests)
  is an example, not a universal TTL).
- **Caveats / skip:** keys hold no secrets or PII and never replace auth or
  confirmation; show pending until the result is known. Skip for idempotent
  reads and reuse existing contracts before building new machinery.

### 20. Amazon safe triangle

- **Useful when:** a pointer user moves diagonally from a menu item into its
  submenu.
- **Build and verify:** no fixed open delay. Lines from the pointer to the
  submenu's top and bottom inner corners, each widened 15°, form a wedge that
  keeps it open; close only after two wrong-way moves in a row, and ignore
  touch and pen. Test slow moves, re-entry, both sides and viewport edges
  ([original](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown)).
- **Caveats / skip:** click, keyboard, focus and Escape work without it; no
  jQuery for it. Skip touch-first navigation; flatten deep menus first.

## Setting direction (the `/plan-design` interview)

The questions live in [`../practices/uiux.yaml`](../practices/uiux.yaml) (`inputs_to_gather_first` and `questions`).

*See also: [Tailwind](./tailwind.md) | `/plan-design`, `/uiux-audit`, `/accessibility-critique` skills*
