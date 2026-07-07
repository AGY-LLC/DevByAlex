---
id: stack-uiux
title: "UI/UX Baseline"
summary: "The design baseline for new work: a no-fly list of generic-AI-UI tells, the design-system dimensions every project pins down (color, type, spacing, radius, shadow, motion, iconography, states), and the accessibility floor (WCAG 2.2 AA). Mirrors how nisatsu's docs/DESIGN.md is structured."
tags: ["stack", "uiux", "design", "accessibility", "frontend"]
updated: 2026-05-30
---
# UI/UX Baseline

How I want UI built and reviewed. Per-project specifics live in that project's `docs/DESIGN.md` (see nisatsu for the canonical example); this is the cross-project baseline the `/uiux-init`, `/uiux-audit`, and `/accessibility-critique` skills operate against.

Underneath everything here sit the **[universal design rules](../design/universal-design-rules.md)** — 30 style-independent principles (clarity above everything, one primary action, obvious hierarchy, immediate feedback, error prevention + recovery, …) plus the pre-ship Universal Checklist the `design-critic` agent runs over every screenshot. Every screen holds them regardless of the style chosen below.

## Anti-patterns — the generic-AI-UI no-fly list

The biggest tell of AI-generated UI is defaulting to one "modern SaaS" aesthetic with no intent behind it. Do not introduce:

- **Visual** — the default gradient hero, bento grid, and sparkle/star iconography; a palette that's safe-and-trendy but untied to the brand; uniform, featureless hierarchy; lazy whitespace (too much) or cramped layouts (too little); stock illustrations.
- **Structural** — over-reliance on an unmodified component library; everything the same elevation; no considered focal point.
- **Copy** — corporate/templated phrasing ("streamline your workflow", "unlock your potential"); neutral-to-inert voice with no personality.
- **Motion** — animation that feels automated rather than designed; motion on everything; center `transform-origin` on popovers; `transition: all`; durations over ~300ms on interruptible UI.

Pick a direction with intent (premium editorial, calm, playful consumer, technical devtool, etc.) and commit to it. Name it as **PRIMARY × SECONDARY** — structure (one of the 12 product directions) × feeling (one of the 50 named styles) — using the catalog, pairing map, and decision procedure in [`../design/design-styles.md`](../design/design-styles.md). `/plan-design` makes and records that pick in `docs/DESIGN.md` before wireframes; the primary always wins conflicts and governs usability.

## Design-system dimensions

Every project pins these down in its `docs/DESIGN.md`, as intent-based tokens (Token | Value | Intent):

- **Color** — palette + semantic mapping (brand, status, interactive states); light and dark; every pairing must hit contrast (below).
- **Typography** — ramp (display → body → caption), weights, line-height, letter-spacing; supports text scaling / Dynamic Type.
- **Spacing** — one base unit and a consistent scale across margin/padding/gap; responsive breakpoints.
- **Radius / shadow / depth** — intent-based radius vocabulary and a shadow scale (subtle → prominent) with explicit elevation rules.
- **Motion** — duration + easing tokens, a `prefers-reduced-motion` policy, and handling for parallax/auto-scroll.
- **Iconography** — one icon set + style, size vocabulary, fill-vs-stroke semantics, decorative vs meaningful.
- **Interactive states** — every component defines default, hover, focus (visible!), active, disabled, loading, error, and empty.

## Accessibility floor (WCAG 2.2 AA)

Non-negotiable on every customer-facing surface:

- [ ] **Focus visible** — every focusable control has a visible, high-contrast focus ring (2.4.7).
- [ ] **Keyboard** — every action reachable and operable by keyboard; Tab order matches visual order; no traps (2.1.1, 2.4.3).
- [ ] **Contrast** — body text ≥ 4.5:1, large text ≥ 3:1, non-text controls/state ≥ 3:1, against the *actual* rendered background (1.4.3, 1.4.11).
- [ ] **Hit targets** — pointer targets ≥ 24px (mobile best practice 44px) (2.5.8).
- [ ] **Semantic structure** — one H1, no skipped heading levels, landmarks, real list markup, DOM order = visual order (1.3.1).
- [ ] **Labels & errors** — every input has a visible persistent label; errors programmatically associated (`aria-describedby`, `aria-invalid`) and tell the user how to fix (2.4.6, 3.3.1, 3.3.3).
- [ ] **Alternatives** — meaningful images have alt text; decorative images hidden; video captioned (1.1.1, 1.2.2).
- [ ] **Reduced motion** — animations honor `prefers-reduced-motion`; no flashing > 3×/sec; large transitions have an opacity-only fallback (2.3.3).
- [ ] **Zoom & reflow** — survives 200% zoom with no loss; no two-dimensional scroll at 400% except tables/maps (1.4.4, 1.4.10).
- [ ] **Color not the only signal** — pair color with icon + text (e.g. red error gets an icon and a message).
- [ ] **Modal focus management** — focus moves in, Tab is trapped, focus returns on close, `aria-modal`/inert applied.

## Setting direction (the `/uiux-init` interview)

Before designing, answer: what the product does (one sentence); who the user is and their sophistication; the primary goal on the main screen; the business goal; emotional tone (2–3 adjectives); interaction density (low consumer / medium productivity / high dashboard); platform priority; existing brand assets; references loved and hated; and explicit anti-patterns to avoid.

*See also: [Tailwind](./tailwind.md) | `/uiux-init`, `/uiux-audit`, `/accessibility-critique` skills*
