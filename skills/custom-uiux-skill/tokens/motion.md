# Tokens: motion

Motion communicates state and meaning. Decorative motion is usually
worse than no motion. Reduced motion is non-negotiable.

## Duration scale

```
instant     0ms       (state changes that should snap)
xs          80ms      (color swaps, tiny presses)
sm          120ms     (button press feedback)
md          180–220ms (default UI transitions, hover, fade)
lg          280–320ms (page section transitions, sheet open)
xl          400–500ms (editorial reveals, slow fades)
```

## Easing

```
ease-out         most UI (things appear, settle)
ease-in-out      reversible transitions (toggle, expand/collapse)
ease-in          things leaving the viewport
spring (soft)    consumer/social: bottom sheets, modals
spring (stiff)   utility: quick snaps with light overshoot
linear           progress and streaming indicators
```

Avoid `ease` (the browser default): too symmetric, looks lazy.

## What should move

- **State changes** that need to be perceived (a card becomes
  selected, a list item is removed).
- **Spatial transitions** that explain layout (a sheet rises from the
  bottom, a drawer slides in from the side).
- **Affordances** (button press, focus ring fade-in).
- **Streaming content** in AI surfaces (the cursor, the focus pulse).

## What should not move

- **Hero copy** appearing "with a flourish" on every page load.
- **Decorative parallax** on a page with content to read.
- **Number counters** in a hero.
- **Backgrounds** that constantly drift.
- **Tooltips** that need to be fast and accurate.
- **Anything** if reduced motion is on (except meaningful motion,
  see below).

## Reduced motion

`prefers-reduced-motion: reduce` must be respected. Strategy:

- All decorative motion → instant or cross-fade ≤ 100ms.
- All page transitions → cross-fade ≤ 100ms.
- All parallax → off.
- All auto-playing video → off (provide a play affordance).
- **Meaningful motion** (streaming text, progress, drag-and-drop)
  may continue, but its decoration is removed (no pulses, no
  "breathing" loops).

## Per-component conventions

```
button press:         80–120ms ease-out, slight scale (0.97–0.99)
hover fade:           120–180ms ease-out
focus ring appear:    80–120ms ease-out
modal open:           220–280ms ease-out (or soft spring)
sheet open:           280–320ms soft spring (mobile), ease-out (desktop)
toast in:             200ms ease-out
toast out:            150ms ease-in
sidebar collapse:     200ms ease-in-out
streaming cursor:     800ms loop, only when motion allowed
live tick (finance):  600ms border pulse, motion-reduced-safe (1px only)
page nav:             180–240ms cross-fade or ease-out slide
```

## Performance

- Use `transform` and `opacity` only. Avoid `width`, `height`, `top`,
  `left` for animation.
- Don't animate 100+ items at once. Stagger or batch.
- Avoid heavy Lottie animations on critical paint paths.
- Pause off-screen animations.

## Per-reference leanings

- **premium-editorial**: slow fades (250–400ms), restrained.
- **playful-consumer**: soft spring physics, light bounces.
- **calm-japanese-mindful**: slow ease-out (300–500ms), no bounces.
- **technical-devtool**: snap (80–150ms), no bounces.
- **ai-native-productivity**: 120–180ms; streaming cursor + sidebar
  collapse + focus pulse during streaming.
- **social-mobile**: spring everywhere; haptics on press; optimistic UI.
- **finance-trading**: snap (80–150ms); meaningful tick pulses;
  reduced motion drops the flash.
- **luxury-commerce**: slow crossfades (250–400ms); no bouncing.
- **wellness-minimal**: gentle ease-out (200–300ms); optional breath
  loops on focal elements.
- **brutalist-experimental**: dramatic per-page signature moves
  (marquee, full-screen word transitions); reduced motion still
  respected.
- **mobile-native-utility**: snap; spring on bottom sheets; haptics.
- **creative-studio-portfolio**: one signature motion move per page.

## Common pitfalls

- Page transitions on every navigation: wears users down.
- Hover animations that block the click point.
- Modals that take 800ms to open.
- Number counters animating on dashboards: looks like a casino,
  not a tool.
- Parallax scrolling on long-read articles.
- Forgetting reduced motion entirely.
- Streaming cursors that flicker badly on slow networks.
