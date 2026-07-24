# Tokens: color

Color is the most reused token. Get the system right and most other
decisions become smaller.

## Layer model

Use a layered model that scales to dark mode and to functional state:

```
SURFACES
  surface           : the page background
  surface-2         : cards / raised panels on the page
  surface-3         : modals / drawers / deeply elevated panels

INK
  ink               : body type
  ink-dim           : secondary type, captions, metadata
  ink-disabled      : disabled type
  ink-on-accent     : type that sits on top of the accent surface

ACCENT
  accent            : the single signature color of the brand
  accent-2          : optional second accent, used sparingly
  accent-on-surface : when the accent appears as text/icon on a surface

FUNCTIONAL (semantic, never decorative)
  positive          : success, up, complete
  warn              : attention, pending, caution
  danger            : error, destructive, down
  info              : neutral information

BORDERS
  border            : hairlines
  border-strong     : visible borders on inputs / containers
  focus-ring        : the ring around focused elements
```

## Rules

1. **One signature accent.** A second accent only with a clear job.
2. **Functional colors are semantic.** Green is for "good," red is for
   "bad," amber is for "be careful." Never use them decoratively.
3. **Define dark mode pairs explicitly.** Don't auto-invert.
4. **Pass contrast in both modes.** WCAG AA floor.
5. **Every color has a job.** If you can't name when to use it, it
   doesn't belong.
6. **Cluster near-duplicates.** Two greys 4% apart are one grey.

## Light-mode starter (adjust per reference)

```
surface:        depends on direction (cream for editorial / wellness /
                Japanese; pure white only for utility/devtool when needed)
surface-2:      4–8% darker than surface
surface-3:      8–12% darker than surface

ink:            ~10–15% black (avoid #000)
ink-dim:        ~40–50% black
ink-disabled:   ~25% black
ink-on-accent:  white or surface, depending on accent luminance

border:         ~10–15% black, used at 1px
border-strong:  ~20–25% black

focus-ring:     accent at 60–80% opacity, 2–3px ring with a 2px offset
```

## Dark-mode starter

```
surface:        deep slate, 8–12 luminance (e.g. #0E0F12)
surface-2:      ~14–18 luminance
surface-3:      ~20–24 luminance

ink:            ~88–92 luminance (avoid pure white)
ink-dim:        ~55–65 luminance
ink-disabled:   ~35–40 luminance

border:         ~22–28 luminance
border-strong:  ~32–40 luminance

focus-ring:     a tuned accent: darker accents need to brighten for
                dark mode visibility
```

## Functional starter

Choose accessible greens / reds / ambers / blues that are clearly
distinct and pass AA on every surface they appear on.

```
positive:  desaturated forest / sea green (avoid neon)
warn:      amber / mustard (not yellow on white, fails contrast)
danger:    deep coral / brick (avoid Bootstrap red on dark mode)
info:      neutral blue: only when it adds meaning beyond accent
```

## Common pitfalls

- Using brand color for everything → loses meaning.
- Using semantic green for a decorative accent → confuses users.
- Pure black (#000) on pure white (#fff) → harsh, hurts long reads.
- Dark mode that's just `filter: invert()` → broken in five ways.
- Hover state that drops below contrast minimum.
- Functional colors that aren't distinguishable to common color-vision
  deficiencies: test with a CVD simulator.

## Where each reference leans

- **premium-editorial**: cream + ink + one earth accent.
- **playful-consumer**: warm saturated palette, no neon.
- **calm-japanese-mindful**: paper background, restrained earth accent.
- **technical-devtool**: dark default, single saturated accent for
  selection.
- **ai-native-productivity**: neutral first, single AI accent.
- **social-mobile**: black/white + bold accent.
- **finance-trading**: dark default; semantic green/red strict.
- **luxury-commerce**: off-white/cream + ink + restrained accent.
- **wellness-minimal**: cream + muted earth accent.
- **brutalist-experimental**: very high contrast (B&W or single loud
  color + black).
- **mobile-native-utility**: dark default; single bold action color.
- **creative-studio-portfolio**: cream or signature backdrop color.

When in doubt, fewer colors. A small palette feels intentional.
