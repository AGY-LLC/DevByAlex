# Tokens: radius, shadow, depth

Radius, shadow, and depth together communicate "what is a surface,
what's on top of it, and what's behind it." Get these wrong and the
whole UI feels off.

## Radius

Pick a scale; don't use `rounded-2xl` on everything by default.

```
xs    2px    (tiny chips, small focus rings)
sm    4px    (utility surfaces, inputs in technical directions)
md    6–8px  (buttons, inputs, small cards, common default)
lg    10–14px (cards, modals)
xl    16–20px (large cards, sheets)
2xl   24–28px (very expressive cards, playful, social)
full  9999px (pills, avatars, circular icons)
```

Each component should pick ONE radius value and keep it. Mixing
radii within a row of similar elements looks careless.

## Per-reference defaults

- **premium-editorial**: none on imagery; 4–8px on utility surfaces.
- **playful-consumer**: 16–20px on cards, full on pill buttons.
- **calm-japanese-mindful**: 8–12px on cards; pill on small primary.
- **technical-devtool**: 4–6px everywhere; full on status pills.
- **ai-native-productivity**: 6–10px on cards; 8px on buttons.
- **social-mobile**: 16–20px on cards; circular on avatars.
- **finance-trading**: 4–6px on surfaces; full on status tags.
- **luxury-commerce**: 0 on imagery; 4–6px on utility.
- **wellness-minimal**: 12–16px on cards; pill on small buttons.
- **brutalist-experimental**: 0 (or wildly inconsistent on purpose).
- **mobile-native-utility**: 12–16px on the primary surface; full on
  the action button.
- **creative-studio-portfolio**: 0 on imagery; 6–8px on utility.

## Shadow

Use shadows sparingly. Many strong systems use 0–2 shadows total. Many
others use 0.

```
none           no shadow (default for most surfaces)
shadow-1       a single tight 8–16px y-offset, low blur: small lifted
               cards, dropdowns
shadow-2       a moderate 16–32px y-offset, slightly more blur: popovers,
               floating menus
shadow-3       a large 24–48px y-offset, soft blur: modals, sheets
shadow-inset   1px inset border-as-shadow for input depth (use color,
               not shadow, in flat directions)
```

Rules:

- Don't combine multiple shadows on one element unless you mean it.
- Don't pair big shadows with thick borders: pick one.
- Shadows should use the *ink* color at low opacity, not pure black.
- Dark-mode shadows are less visible; consider using a lifted-
  brightness surface color instead of a real shadow in dark mode.

## Border strategy

Two main strategies. Pick one per system:

- **Border-led** (preferred for editorial, devtool, finance,
  brutalist, luxury, creative studio): hairline borders, no shadows.
- **Shadow-led** (preferred for playful, social, wellness): subtle
  shadow, no borders.

Hybrid is acceptable if a clear rule defines when to use which.

## Elevation logic

Each surface lives at a logical elevation. Define it explicitly:

```
0:  page background
1:  cards on the page
2:  raised affordances (sticky bars, floating buttons)
3:  popovers, dropdowns
4:  drawers, side sheets
5:  modals
6:  toasts, overlays of last resort
```

A higher level may use either a lifted-brightness color or a shadow
(per the strategy you picked). It should NOT use both.

## Common pitfalls

- `rounded-2xl` on every component: the AI-UI tell. Pick a per-
  component radius and stick to it.
- Heavy shadow + thick border + bright accent on the same button.
  Triple-stacked depth cues = noisy.
- Inconsistent radius between buttons and inputs adjacent in a form.
- Cards that float in light mode but sink in dark mode because the
  shadow logic wasn't updated.
- "Material Design" stacked elevations applied to a non-material brand.
