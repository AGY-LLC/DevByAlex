---
id: stack-uiux
title: "UI/UX Baseline"
summary: "The cross-project design baseline: generic-AI-UI tells, design-system dimensions, the accessibility floor, and a contextual catalog of interaction and perceived-performance patterns selected through docs/DESIGN.md."
tags: ["stack", "uiux", "design", "accessibility", "frontend"]
updated: 2026-11-12
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
- [ ] **Keyboard**: every action reachable and operable by keyboard; Tab order matches visual order; no traps; a plain "Skip to main content" link is the first focusable element, hidden until focused, top left (2.1.1, 2.4.1, 2.4.3).
- [ ] **Contrast**: body text ≥ 4.5:1, large text ≥ 3:1, non-text controls/state ≥ 3:1, against the *actual* rendered background (1.4.3, 1.4.11).
- [ ] **Hit targets**: pointer targets ≥ 24 × 24px, or a 24px circle centered on a smaller one touches no other target; links inside a sentence are exempt; main actions aim for 44 × 44px (2.5.8).
- [ ] **Semantic structure**: one H1, no skipped heading levels, landmarks, real list markup, DOM order = visual order (1.3.1).
- [ ] **Labels & errors**: every input has a visible persistent label; errors follow the form-error default below (2.4.6, 3.3.1, 3.3.3).
- [ ] **Alternatives**: meaningful images have alt text; decorative images hidden; video captioned, on by default with custom controls; video autoplays only muted, opt-in and with controls always shown (1.1.1, 1.2.2).
- [ ] **Reduced motion**: under `prefers-reduced-motion`, motion that shows a status change or place becomes a dissolve, fade or color shift; parallax, animated blur, zooms, decorative spins and shimmer stop (loading spinners keep turning, since a still one reads as frozen); autoplaying carousels pause. Never a blanket no-animation reset that hides status changes. No flashing > 3×/sec (2.3.3).
- [ ] **Zoom & reflow**: survives 200% zoom with no loss; no two-dimensional scroll at 400% except tables/maps; text survives 1.5 line height, 0.12em letter and 0.16em word spacing, so no fixed-height text boxes (1.4.4, 1.4.10, 1.4.12).
- [ ] **Color not the only signal**: pair color with icon + text (e.g. red error gets an icon and a message). Body links stay underlined, 1px about 0.1em below the text, thickening to 2 to 3px in place on hover, with visited in its own hue in both modes; never hover by color alone.
- [ ] **Modal focus management**: focus moves to the first field (or the primary button), Tab is trapped, Esc and the close icon close it, focus returns on close, `aria-modal`/inert applied.

## Component defaults

Exact rules every theme inherits; a theme may restyle these, never loosen them.

- **Modals** only for required input, an urgent alert about the current task, or a confirmation; anything else is a toast, inline notice or page, and anything wider than 640px is a page. Only the body scrolls; ≤ 3 buttons, primary rightmost, verb labels (never "OK"), danger style for destructive ones. A modal holding a form never closes on an outside click; never stack modals, open one unasked, or use them for tasks people repeat often. Deletes match what breaks: reversible ones get Undo and no dialog (never both), one item a dialog naming it and saying if it's permanent, typing the name only for wide permanent deletes; the button names the act ("Delete project"), "Remove" when it still exists elsewhere, and focus then moves to the previous item. Widths 320, 480 (default) or 640px with 24px padding, a bottom sheet on phones, black 50% backdrop.
- **Toasts** hold at most two lines with a close button, auto-hide after 5s (10s max), and pause on hover and focus. What a toast says also lives elsewhere in the app. A toast with an action (Undo, a link) never auto-hides; anything the user must act on is an inline notice that stays; field errors never go in toasts.
- **Switches** only for an on/off setting that applies at once and can be undone; anything needing Save or a confirmation is a checkbox, 3 to 5 options are radios and more a select, two opposite views or named options (Monthly or Yearly) a segmented control (2 to 5 nouns or 6 icons, never mixed, picks a state and never runs actions, applies at once, never navigates, becomes a menu when narrow); switches never sit in a form with Submit. The label is a noun phrase true in both states ("Notifications", never a question or verb), state text is only "On" or "Off", and a switch shows a loader while it waits on the server. Track 48×24px with an 18px handle; in table rows 32×16px with a 10px handle and a check when on.
- **Form errors**: check a typed field when focus leaves it, never on focus; empty required fields wait for submit; once a field shows an error, recheck on each keystroke and clear it when valid (new passwords may check live). The message sits beside the field with an icon, linked by `aria-describedby` and `aria-invalid`; on submit, a summary of links to each bad field goes under the page title and takes focus, and the title starts with "Error: ". Never clear fields or disable Submit up front; empty fields get an instruction ("Enter your name"), broken rules a description ("Name must be 35 characters or less"), never "please", "sorry", "invalid", "oops" or "This field is required". The summary is headed "There is a problem" and shows even for one error. A character count exists only for a real limit, appears at 75% of it, is announced once typing pauses, and never blocks typing or pasting; past the limit it says "You have 3 characters too many" and only then turns the border red. Passwords are hidden behind a text "Show" toggle (no eye icon alone) that resets on submit, allow paste, have no confirm field or maxlength, use `autocomplete` new-password or current-password with spellcheck off, and a failed sign-in never says which field was wrong. No tooltip-only, icon-only or modal errors, and error text never shakes. Success ticks only on password, username and character-count fields. Input masks only on fixed formats (phone, card, ZIP): the empty format shows in the field ("___ ___ ____"), digits on a numeric keypad, literals stripped on submit, paste and mid-field edits allowed; never on names, emails, addresses or free text, or with a placeholder as label.
- **Tooltips** label icon-only controls or give a short hint: open after 100ms of hover for an icon label, 400 to 700ms for a description (at once when moving between tooltips within 300ms), at once on keyboard focus, never on click; close on Esc or 300ms after the pointer leaves, staying open while hovered. One line, above the trigger by default. Never links, buttons or must-read text inside: help that needs them is a toggletip, opened on click, Enter or Space, at most 288px wide, closed on an outside click or Esc, never for required input; touch-first screens show visible labels instead. Hover panels and top-nav menus open after 300 to 500ms and close 500ms after the pointer leaves both trigger and panel.
- **Tables**: one row height per table, 24, 32, 40 (default), 48 or 64px (64 only for two-line rows), with header, toolbar and pagination the same height; 16px side padding, 14px text with a semibold header, and a caption. Compared numbers right-aligned in tabular figures with thousands separators and the same decimals down the column, text and IDs left, headers follow their column, never centered text; a missing value shows "–"; the sort icon shows only on the sorted column: the whole header label is the button, the arrow right after its text (direction by shape, not color), and each new sort is announced politely. Zebra stripes (from 4 rows and 3 columns) or faint row dividers, never both; rows under 44px only on pointer layouts and never in pastel, clay or editorial themes; no display fonts in numeric cells.
- **Empty states** are left-aligned (centered only in tiles) and replace the element they stand for (an empty table drops its headers) and never show while loading. A title naming the next step, at most 3 lines of body, one primary action; no illustration in toasts, strips or tiles under 260px wide.
- **Charts**: one series in the brand color; highlight by muting the rest; status colors only for status. Categorical colors in a fixed order, at most 6 plus "Other"; sequential scales are one hue in up to 10 steps, darkest on the maximum in light mode, lightest in dark; pastel themes use tints of the series hues. Never color alone, a gradient instead of a scale, or glass behind a chart.
- **Drag and drop**: a grab cursor only on a handle of at least 24px (a card holding buttons drags only by it); the original stays at 40% opacity, the preview sits 16px right and 8px down, at most 280px square, never tilted; a 2px line with an 8px dot, centered in the gap, marks the drop spot, and the dropped item flashes for 700ms. The dotted handle sits on the left, and Move up, down, to top and to bottom sit in the item's menu for keyboard users.
- **Flows and paging**: a stepper only for fixed-order flows of 3 to 7 steps (24px icons, 4px lines, vertical on phones, labels of 1 to 3 parallel past-tense words that wrap, never truncate, the latest done step checked and bold, a blocked step an outlined error icon saying how to fix it; never beside a percent bar for the same process); any-order or multi-sitting flows get a task list page (the whole row is the link, "Completed" in plain text, open tasks tagged). Activity timelines run newest first on a 2px muted rail, 32px badges ringed 2px in the page color, 16px entry padding, minor runs as 16px unfilled badges; never as progress or navigation. Pagination always shows the first and last page plus 2 either side of the current (1 on phones) with ellipses, hides on one page, sits 24px below lists over 20 items, and resets to page 1 on any sort or filter; data that changes while people browse gets plain Previous and Next; never auto-loading infinite scroll above a footer. Tables, search results and anything people filter and act on are paged; Load more (one centered neutral button, about 10 items on phones, 30 on desktop) is only for browsing content, infinite scroll only for true feeds and stopping by about 50 items, and either keeps its place in the URL for Back. Breadcrumbs start at home and end at the parent, never the current page, and never wrap or carry icons; from 5 levels show the first and last 3 with a "…" menu between, truncate at most one label, and below 992px show only a back link to the parent; none on flat sites or single-page layouts.
- **Disclosure**: accordions when several sections may be open at once ("Open all" from 3), tabs to switch between equal sections, a disclosure for one or two minor bits; all start closed, and a header is one click target of 5 to 10 parallel words with one chevron style. Hide closed panels with `<details>` or `hidden="until-found"` so find-in-page reaches them, never `display: none`, with `aria-expanded` in sync. Never nested, never controls in headers, never hiding what everyone needs. A full tab row drops its icons, then moves its last tabs into More (never just one; the current tab swaps with the last visible).
- **Truncation** cuts at the end, or the middle for file names, hashes and paths, only when at least 3 characters would hide, keeping at least 4, the file extension and a "…" (at the start when only the tail is unique); full text in a tooltip up to about 150 characters, past that a Show more on its own line; previews clamp at 2 to 3 lines, and a Show more never hides just one item. Never truncate titles, labels, column headers, navigation, errors or notifications, and never fade or scroll text inside a box instead.
- **Search suggestions**: at most 10 on desktop, 4 to 8 on phones, no scrollbar, the untyped part bold, the active row shaded, on a solid surface without separators or zebra rows; they start after 3 characters and a 100ms pause and hide when nothing matches; arrows loop and copy the row into the field, Return submits, Esc closes.
- **Copy and upload**: a copy button stays visible beside its value, is named for it ("Copy branch name"), and only after a real success shows a success-colored check and "Copied!" for 2s, no toast; a failed copy shows an error icon and says to select and copy by hand; where copying can't work, remove it. Uploads get an always-visible drop zone the width of the form fields around a secondary "Choose file" button (phones get only the button), state accepted types and size up front, hide the picker at the file limit (a single-file zone goes once its file is in), list each file with its size and progress, and put one specific error on the file that failed ("The selected file must be smaller than 2MB").
- **Range inputs**: sliders only for relative values with 4 or more stops (fewer are radios), snapping to real stops with the value and unit under the thumb (read out with the unit), a 20px thumb (14px at rest where dense, growing to 20 while dragged) on a 4px track 200 to 640px long with a 44px hit area, a number input beside it held to the same bounds, Page Up and Down or Shift+Arrow moving 10%, Home and End to the ends; ticks only 8px or more apart (else just the ends), and range thumbs named apart and kept a step apart; never alone for exact values, never for progress. Number steppers only for small whole numbers near a default: a typable field between minus (left) and plus (right) of at least 44px, long press repeats, the end button disables (never hides) at the limit with no wrap, and the field reserves width for the longest value; never for prices, ages, dates or decimals, never paired with a slider. Meters show amounts people build up (storage, steps done), never loading: 192px wide on desktop, 240 on phones, label above left and value ("60%", "2 of 8") above right on one line, the fill changing color at set thresholds (say 80 and 90%) with words alongside, never shimmering.
- **Carousels** come after a static row or scroll-snap has failed: 2 to 5 self-contained slides of one height, Prev and Next always shown under them at 44px, "2 of 5" text over dots alone; autoplay turns every 5s behind a visible stop button that comes first, pauses on hover and focus, stops for good once touched, and stays off under reduced motion; off-screen slides take no focus. Never calls to action, pricing or comparisons, never in dashboards or terminal themes. **Lightboxes** open in 200ms over a fading dark overlay with a thumbnail rail marking the current image (never cut off without a sign of more); arrows and swipe change images, click or double tap zooms to 3x (arrows then pan), Esc or a swipe down closes and returns focus to the opening thumbnail, and only the active image loads; never in data tables or terminal themes. **Video controls** fade after 2s idle but stay while paused, a menu is open or they hold focus; Space or k plays, m mutes, f fullscreens, c toggles captions, arrows or j and l seek 10s, and on touch a tap shows them and a double tap on either side seeks 10s; live streams drop seeking, and a muted background video has no controls.
- **Inline edit** only for data that changes often and fits its row (linked fields get a form): Enter or the check saves and Esc cancels, with save and cancel icons always visible and nothing saved on blur beside them; an empty value reverts, a failed save stays open with the text and a retry, an edited row holds its place under sort, filter or paging until refresh, one row edits at a time, and read and edit share type and alignment. Never in forms with Save or for new entries.
- **Sticky headers** only for items used often: opaque (never glass), at most 5 items, hidden on scroll down past 150px and back with a 300ms slide on scroll up; never over phone forms. "On this page" only on long pages with 2 or more H2s, listing just them: sticky left on desktop, a pinned dropdown on phones. **Drawers** come from the right, pushing content on wide screens or overlaying it, 260px by default (400 for forms) with a resize handle on the inner edge, a sticky title and, when the body scrolls, sticky actions; Esc closes and returns focus to the opener; never for confirmations, at most 80% of a phone screen; phones get a sheet, marketing pages neither. **Split panes** show a 1px divider with a 44px drag target, accent on hover and drag (`role="separator"`, 0 to 100); panes sized in percent with minimums, Arrow steps 5%, Shift+Arrow 10%, Home and End to the limits, Enter collapses and restores; never on phones or between cards.
- **Pricing**: plans run simplest (left) to priciest (right), the most popular in the middle with the only filled button; the monthly or annual toggle sits above and states the saving in words ("2 months free"); about 4 key features per plan, a comparison table only past about 20, with plan names and buttons pinned. A sale shows the old price struck through at the same size with a hidden "Instead of", in a red that isn't the error red. "Added to cart" shows the item's image, name, options and price with Keep shopping, View cart and Checkout, never a bare toast. Never Bento or a carousel.
- **Filter chips**: one row, 32px tall, 16px side padding, 56 to 296px wide, 1 to 3 nouns with a count when multi-select ("Price (1)"), scrolling sideways on phones, never wrapping; applied filters show above the results with a remove on each and "Clear all". Single chips filter at once, panels and multi-select use Apply. Never as navigation (tabs) or beside a side panel of the same filters.
- **Menus**: context menus hold the item's likeliest actions, at most 12 in about 3 groups, 160 to 288px wide with 32px rows (24 dense), submenus one level deep; inapplicable actions are hidden, destructive ones last in red behind a divider, and each also lives somewhere visible. A split button has a clear default plus 1 to 4 variants, its label matching the first menu item, an always-visible divider, an arrow named for the set ("More deploy options") halves of 44px on touch and two tab stops; never destructive as the default or two side by side. Toolbars of 3 or more related icon buttons are one tab stop with arrows, Home and End, move whole groups into More, and no slider or segmented control inside; rich text toolbars start with bulleted and numbered lists, add bold and italic only when needed, never underline, and keep Link out of More.
- **Picking widgets**: tag inputs make a tag on Enter, Tab, blur or a comma, split pastes the same way, and Backspace in the empty field reopens the last tag. Tree views only for hierarchies over one level deep: 32px rows (24 dense) indented 24px a level (12 dense), leaves 24px more past the chevron slot, every node with an icon or none, the chevron only toggles, the row selects, Left and Right move between parent and child, collapsing keeps children's state and shows a hidden selection on the parent; past 10 levels, drill down instead; never site navigation or FAQs. Star ratings always show 5 24px stars rounded to a quarter with the review count, grey outlines at zero, and summaries a bar and count per level that filters to it; as input, whole stars in one tab stop. Colour swatches are round, 32 to 44px with 8 to 12px gaps (44px taps), the chosen one ringed 2px, pale ones bordered at 3:1, with a live label above ("Color: Cognac"), wrapping, never scrolling; one shape per attribute (circles for colour, pills for sizes); never colour without its name. Selectable cards only when options need an image or description: 2 to 6, control on the right, 16px padding and gaps, stacked or in one row, never a tile grid.
- **Helpers**: pull to refresh only at the top of touch lists, beside a refresh button disabled while refreshing: it fires at 60px, stops at 120px and springs back in 280ms; a pull starting mid-list never refreshes, and never on a sheet that swipes down to close. Back to top is one button lower right, only past 2 screens on desktop or 4 on phones, shown once people scroll up, resting above the footer; it jumps without smooth scroll and moves focus to main, never sharing a corner with toasts or a chat button. Coach marks are offered, never started unasked, and restartable from help: one thing each, 300 to 600px wide on every step, 4px from the element with a pulsing beacon on it and 16px from the screen edge, with OK, or Next, Finish and a quiet "Skip tour"; a step asking for an action moves on once it's done; never on editorial or marketing pages. Chat puts your messages right and others left, grouped by author within 5 minutes, bubbles padded 12px by 8px, avatar and time on a group's first message and status on its last, sending ones at 48% opacity; editorial and terminal themes use a compact left-aligned log. Swipe actions: 1 to 3 per side, destructive on the trailing side, a swipe past 25% opens the row's actions and past 80% runs only the first, one row open at a time, a swiped delete gets Undo, and each also sits in the row menu; never inside carousels or paged views.
- **Dates and numbers**: "Now" under a minute, then relative under a month ("5 minutes ago", "In 2 hours") in a `<time>` showing the full date and offset on hover, then "on Nov 18" (year only if not this year); deadlines, bookings and invoices always absolute. Known dates (a birthday) are Day, Month, Year text fields (2, 2 and 4 characters wide) that never auto-jump and accept "jan"; a calendar only where the weekday or nearness matters, typing still allowed, opening on today. Times follow the locale's clock with a sensible min and max, rounding to fixed slots on blur rather than erroring. Ranges offer presets (Today, Last 7 days, This month) beside one month narrow or two wide, pending until Apply. Numbers get separators from 4 digits (1,024), a leading zero (0.92), at most 2 decimals and no trailing ".0"; abbreviate (50.2k) only where space is tight, with the full value on hover, never in checkouts or invoices. Prices are stored as a number with currency and locale, drop ".00" and never wrap from their sign; smaller cents never in tables or ledger themes.
- **Badges and avatars**: a badge holds only a number (16px pill, 99+ cap) or is a 6px dot; words go in a tag. People are circles, projects and bots rounded squares; stacks overlap only when space is tight: up to 4 by relevance at 32px (never under 24), 8px overlap with a 2px ring in the page color, then a same-size muted +N chip that lists the rest, with hidden names in visually hidden text, never a tooltip alone. A count badge hides at zero and sits after its link with hidden text ("(5 unread)"); its tray opens on Unread, urgent items first, one action each, a one-tap "Mark all as read", and is a full page on phones; critical alerts are banners or dialogs.
- **Banners and alerts**: one page banner at most, with a title (it may be visually hidden) and 1 or 2 actions; a promo banner gets an end date before it ships, and its dismissal is saved to the account, never the browser; a warning before a destructive act can't be dismissed. Stacked alerts show at most 3, newest on top 8px apart, then "N more"; info can be closed, warnings and errors stay until fixed, ordered by severity, never auto-dismissed. Never a banner and a toast saying the same thing, banners on marketing or editorial pages, or a banner beside a coach mark tour.
- **Consent and timeouts**: a cookie banner sits in the page flow above the skip link, never fixed, floating or glass, with two same-style buttons named for the cookies ("Accept analytics cookies", "Reject analytics cookies") and a "View cookies" link; the choice lasts 12 months and its confirmation's "Hide cookie message" takes focus; essential-only sites show none. Sessions warn at least 2 minutes before ending (a dialog at 25 idle minutes counting down 5), announced on open, every 15s and assertively in the last 20s, never in a toast; at zero a page says what to redo; none on signed-out pages.
- **Print**: content pages (articles, docs, receipts; never app shells or live dashboards) print only main, black on white with borders for fills, 12pt body at 1.5, 2cm margins, link addresses after links, orphans and widows of 3, table headers repeated and no row, figure or code block split; every theme prints plain.

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
  a favorite (Rule 21 stays honest).
- **Build and verify:** keep the prior state, reconcile the real result, and
  restore or offer a retry on failure without an older response overwriting
  newer intent. Test rejection, offline, rapid repeats and out-of-order replies.
- **Caveats / skip:** never claim payment, permission, entitlement or deletion
  early; pair retried writes with idempotency (19).

### 3. Command menu

- **Useful when:** a dense app has many repeatable actions or destinations.
- **Build and verify:** ⌘K on Mac, Ctrl+K elsewhere, never reused for an
  in-page filter, plus a visible entry point; core actions stay findable
  elsewhere. A dialog at most 512px wide, a 44px input row and a list capped at
  320px that cuts its last row. Empty input shows recents; items are verb phrases with their
  shortcut ("Deploy project"), the placeholder ends in "…", group headings are
  1 or 2 words. Past about 30 items or mixed types, split into pages;
  Backspace in an empty input goes back one, keeping the query. Dialog and
  combobox semantics ([APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)),
  focus trapped and returned, result count announced politely. Before typing, about 5 picked commands; matching is fuzzy over titles and aliases.
- **Caveats / skip:** filter by context and permissions and recheck
  authorization on run; never a bypass for confirmations or the only
  navigation. Skip on pages with few actions (marketing, editorial, toy).

### 4. Shortcut hints

- **Useful when:** frequent desktop actions already have shortcuts.
- **Build and verify:** show a hint only where the shortcut works now, at the
  end of the button or menu row or in an icon button's tooltip, at body text
  size in the text's own color, always beside a text label and never styled as inline code. Modifiers in the order ⌃⌥⇧⌘, one Mod key (⌘ on
  Mac, Ctrl elsewhere); held keys as symbols with no separator on Mac (⌘⇧P),
  words joined by "+" elsewhere (Ctrl+Shift+P); a space for sequences (g i). Keep hints in sync with handlers and remapping; test
  keyboard layouts and IME composition.
- **Caveats / skip:** never reuse a standard binding (⌘Z) or add a modifier to
  one for something unrelated; character-only shortcuts must be switchable or
  focus-scoped ([WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)).
  Skip on touch-first layouts, toy themes and marketing buttons.

### 5. Undo toasts

- **Useful when:** a minor mistake can really be reversed, persisted state
  included; hiding a toast is not undo.
- **Build and verify:** a bounded deferred commit or an authorized compensating
  operation; failed undo is reported honestly and never deletes newer edits.
  Test expiry, navigation and server failure.
- **Caveats / skip:** Undo is keyboard reachable without stealing focus and
  never expires while in use; it never replaces Rule 27's confirmation.

### 6. Stale-while-revalidate

- **Useful when:** a loaded read can tolerate a defined stale window while it
  refreshes ([RFC 5861](https://www.rfc-editor.org/rfc/rfc5861) is the HTTP
  version).
- **Build and verify:** keys scoped to identity, tenant and query, cleared on
  logout; older refreshes never replace newer writes; show age where it
  matters.
- **Caveats / skip:** never stale permissions, balances, inventory or prices at
  a decision; obey no-store.

### 7. Pre-rendering

- **Useful when:** stable public pages or a likely next page gain from
  build, server or [speculative](https://developer.chrome.com/docs/web-platform/prerender-pages) rendering.
- **Build and verify:** no personalized output in shared caches; analytics and
  side effects wait for activation; measure latency and wasted bytes.
- **Caveats / skip:** never routes that mutate, log out, consume single-use
  links or expose sensitive data.

### 8. BlurHash placeholders

- **Useful when:** slow image-heavy feeds gain from a preview over a solid color.
- **Build and verify:** reserve the aspect ratio and swap to the image or its
  error state ([BlurHash](https://github.com/woltapp/blurhash)).
- **Caveats / skip:** the preview takes the image's access rules and is hidden
  from assistive technology; skip small or sensitive images.

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
  `cubic-bezier(0.32, 0.72, 0, 1)`. Open at 30 to 50% of the height, growing
  only when content scrolls; 8px top and 16px side padding, a 32px close. Tell scrolling from dismissal and test
  cancelled drags, the open keyboard and nested scrolling; modal sheets get the
  modal focus contract.
- **Caveats / skip:** keep a visible close control and a keyboard path. A sheet
  holding a long form or unsaved input never drag-dismisses; never for
  destructive confirms or in brutalist, terminal and print themes.

### 11. Interruptible animations

- **Useful when:** users can reverse a toggle, dismiss an overlay or change
  direction before motion ends.
- **Build and verify:** retarget from the current position, semantic state
  authoritative, no stale callbacks; test rapid reversal and unmount.
- **Caveats / skip:** reduced motion reaches the same state at once; never lock
  input until decorative motion ends.

### 12. Predictive back

- **Useful when:** Android's back gesture can preview the real destination.
- **Build and verify:** the system [APIs](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture):
  preview, restore on cancel, navigate once.
- **Caveats / skip:** never imitate the gesture elsewhere.

### 13. Hit slop

- **Useful when:** a small icon needs a larger touch target without more visual
  weight; real padding or minimum size comes first.
- **Build and verify:** check the hit region and focus ring on devices; React
  Native [hitSlop](https://reactnative.dev/docs/pressable#hitslop) can't pass
  parent bounds.
- **Caveats / skip:** never overlapping regions; re-space cramped controls.

### 14. Safe area insets

- **Useful when:** edge-to-edge content meets cutouts, system bars or gesture
  regions; backgrounds extend, controls stay reachable.
- **Build and verify:** platform insets or web [`env(safe-area-inset-*)`](https://www.w3.org/TR/css-env-1/#safe-area-insets);
  test rotation, keyboard, sheets and large text.
- **Caveats / skip:** never double-apply a parent's insets or hard-code a notch.

### 15. One-time code autofill

- **Useful when:** an existing sign-in already sends an OTP.
- **Build and verify:** one native text field with `inputmode="numeric"`,
  `autocomplete="one-time-code"` ([HTML](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill))
  and `maxlength` at the code's length; large monospaced digits with wide
  tracking, a label naming the length and where it went, "Try another way"
  under it; Resend waits behind a 30s countdown, 3 times at most. Boxes, if a theme insists, are drawn over that one field and fill from a
  paste, never one input per digit with auto-advance; Submit stays muted until
  the code is complete. Test real devices, expired and wrong codes, and resend.
- **Caveats / skip:** never `type="number"` or auto-submit beside a Submit
  button; the server enforces expiry, single use and attempts, and codes are
  never logged.

### 16. Tabular numbers

- **Useful when:** numbers people compare or that change live (table cells,
  totals, timers, file sizes) would jitter.
- **Build and verify:** [`tabular-nums`](https://www.w3.org/TR/css-fonts-4/#font-variant-numeric-prop)
  with the real font; it doesn't align decimals.
- **Caveats / skip:** never on words or display numbers or announced per tick.

### 17. Balanced headlines

- **Useful when:** short multi-line headings end on an awkward last line.
- **Build and verify:** [`text-wrap: balance`](https://www.w3.org/TR/css-text-4/#text-wrap-style)
  as an enhancement; check narrow widths and zoom.
- **Caveats / skip:** never hard breaks or shrunk type, body or editable text.

### 18. Continuous corners

- **Useful when:** the design system calls for smooth (squircle) corners on
  cards, sheets or controls.
- **Build and verify:** Apple's [continuous curve](https://developer.apple.com/documentation/quartzcore/calayercornercurve/continuous)
  natively; on the web `border-radius` sets the size and `corner-shape:
  superellipse(2)` the form, falling back to round corners. Check clipping,
  borders and focus rings.
- **Caveats / skip:** never in Swiss, editorial print or brutalist themes, or
  mixed with bevel corners in one theme; no new drawing dependencies.

### 19. Idempotency keys

- **Useful when:** retries, double submits or lost responses could repeat a
  consequential write; a server contract, not a disabled button.
- **Build and verify:** one key per intent, scoped to actor, tenant and
  operation, bound to the payload and claimed atomically so repeats replay the
  outcome ([Stripe](https://docs.stripe.com/api/idempotent_requests)).
- **Caveats / skip:** no secrets or PII in keys; never a substitute for auth.

### 20. Amazon safe triangle

- **Useful when:** a pointer user moves diagonally from a menu item into its
  submenu.
- **Build and verify:** no fixed open delay. Lines from the pointer to the
  submenu's top and bottom inner corners, each widened 15°, form a wedge that
  keeps it open; close only after two wrong-way moves in a row, and ignore
  touch and pen ([original](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown)).
- **Caveats / skip:** click, keyboard and Escape work without it; skip
  touch-first navigation and flatten deep menus first.

## Setting direction (the `/plan-design` interview)

The questions live in [`../practices/uiux.yaml`](../practices/uiux.yaml) (`inputs_to_gather_first` and `questions`).

*See also: [Tailwind](./tailwind.md) | `/plan-design`, `/uiux-audit`, `/accessibility-critique` skills*
