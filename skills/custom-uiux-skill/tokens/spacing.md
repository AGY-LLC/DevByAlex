# Tokens: spacing

Spacing is invisible when it's right, and unmistakable when it's wrong.
A consistent rhythm signals "this is on purpose."

## Base unit

Pick a base unit and stick to it: 4px (more flexibility) or 8px
(stricter, simpler). Most modern systems use 4px.

A typical scale:

```
0    0px
0.5  2px      (rare; sub-pixel adjustment)
1    4px
2    8px
3    12px
4    16px
5    20px
6    24px
8    32px
10   40px
12   48px
16   64px
20   80px
24   96px
32   128px
```

## Container padding

- Mobile: 16–20px on each side (smaller is acceptable for utility
  apps; larger for editorial).
- Tablet: 24–40px.
- Desktop: 40–80px on the inner container; 80–160px from viewport
  edge if a centered max-width is used.
- Editorial / luxury directions can use 96–160px container margins.

## Component internal padding

```
button:        h 12–24px, v 8–14px (small to large)
input:         h 12–14px, v 10–14px
card:          16–24px (24 typical; 32 for hero cards)
modal:         24px
table cell:    h 12–16px, v 8–10px (dense) or 12–16px (comfortable)
nav item:      h 12–16px, v 8–12px
```

## Vertical rhythm

- Pick a baseline grid (typically 4px). Snap line-heights and section
  spacing to it.
- Between paragraphs: 1× the body line-height.
- Between sections (h2 / h3): 2–3× the body line-height.
- Between major page sections: 80–160px on desktop, 48–80 on mobile.

## Gaps between elements

```
chips / pills:     8px gap
form fields:       16–20px gap
section blocks:    32–48px gap
hero blocks:       64–96px gap
```

Stack consistency matters more than absolute values: pick a few gap
sizes from the scale and use them.

## Density modes

For products that need both comfortable and compact:

- Comfortable: 1.5× the dense values for vertical padding.
- Dense: the base values (used in tables, dashboards, data tools).
- Provide a toggle. Persist user preference.

## Per-reference leanings

- **premium-editorial**: generous container margins; tall vertical
  rhythm; body line-heights toward 1.6.
- **playful-consumer**: chunky padding; rounded corners pad
  perceptually.
- **calm-japanese-mindful**: extreme whitespace; one element per
  visual block.
- **technical-devtool**: dense; small gaps; aggressive table density.
- **ai-native-productivity**: moderate; editor surface wide and
  uncluttered.
- **social-mobile**: edge-to-edge feed; minimal chrome padding.
- **finance-trading**: dense; tight row heights, small gaps.
- **luxury-commerce**: generous; product images full-bleed.
- **wellness-minimal**: generous; clear vertical rhythm.
- **brutalist-experimental**: deliberate use of negative space (lots
  of it) contrasted with packed regions (very little).
- **mobile-native-utility**: primary action dominates; chrome minimal.
- **creative-studio-portfolio**: large display gaps; project tiles
  given room.

## Common pitfalls

- Magic numbers (37px, 23px): almost always wrong.
- Different paddings on similar components.
- Spacing scale that "looks fine" but isn't snapped: your tools and
  AI agents will fight you forever.
- Cramming hero copy into too little space because the photo "needs
  to dominate": re-balance the photo.
- Different vertical rhythms in different sections of the same page.
- Mobile padding too tight (< 12px): your design will feel cheap.
- Mobile padding too loose (> 24px): your design will feel wasteful.
