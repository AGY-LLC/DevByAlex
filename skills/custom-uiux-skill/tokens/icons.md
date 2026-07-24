# Tokens: icons

Icons are the easiest place to slip into generic visuals. A single
sparkle-wand from the default Lucide / Heroicons set immediately reads
as "AI-generated UI."

## One set, one weight, one size scale

Pick one icon set and stick to it. Mixing sets is almost always wrong.
If you must mix, document the rule (e.g., "brand marks in a different
family, never inline with body icons").

Common modern icon sets (concept-level, pick one that matches the
direction):

- **Lucide / Heroicons / Phosphor**: versatile, multiple weights,
  good baseline for product UI.
- **Iconoir / Remix Icon**: slightly more character.
- **Tabler / Feather**: clean, minimal, line.
- **Material Symbols**: solid, dual-tone, sharp / rounded variants.
- **Custom icon set**: for products where the icons are part of the
  brand (highly recommended for serious products).

For brutalist / experimental / creative-studio directions, consider
hand-drawn or custom icons. Defaults read as costume.

## Weight

Pick a weight that matches the type:

- Light type → light icons (1.5px stroke).
- Regular type → regular icons (1.75–2px stroke).
- Bold type → bold or filled icons.

A common mistake is body text at 16px regular paired with 24px
"filled" icons that overpower the text.

## Size scale

```
xs    12px  (inline with caption text)
sm    16px  (inline with body text, the most common)
md    20px  (buttons, list items)
lg    24px  (tabs, nav primary affordances)
xl    32px  (empty states, feature blocks)
2xl   48–64px (rare; large explanatory illustrations)
```

Icons inline with text should match the cap-height of the text, not
the line-height. Visual alignment beats numerical alignment.

## Color

- Icons inline with text inherit the text color.
- Icons used as standalone affordances use ink (default) or accent
  (selected / primary action).
- Avoid colored icons in lists: they fight the row scanning.
- Status icons use the matching semantic color (positive, warn,
  danger).

## Accessibility

- Icons conveying meaning have an accessible label (`aria-label` or a
  visually hidden span). Don't rely on title attributes alone.
- Icons used only for decoration are `aria-hidden`.
- Tap targets ≥ 44×44pt on mobile: pad the icon's hit area; the icon
  itself stays sized appropriately.

## Per-reference leanings

- **premium-editorial**: minimal line icons, light weight.
- **playful-consumer**: rounded line or dual-tone, slightly chunkier.
- **calm-japanese-mindful**: single weight line icons, minimal set.
- **technical-devtool**: line, 2px stroke, dense.
- **ai-native-productivity**: line, neutral; AI-specific icons used
  sparingly (no sparkles).
- **social-mobile**: filled or dual-tone; emoji-like reaction icons
  custom.
- **finance-trading**: minimal; arrows for direction, no decorative
  icons.
- **luxury-commerce**: hairline icons, generous spacing.
- **wellness-minimal**: soft line icons, slightly rounded.
- **brutalist-experimental**: custom, hand-drawn, or none.
- **mobile-native-utility**: system icons (SF Symbols / Material).
- **creative-studio-portfolio**: minimal or custom; icons not the
  star.

## Specific banned items

- Sparkle / glitter icons for AI features.
- Wand icons for AI features.
- Stars for "premium": they read as gamified.
- 🚀 emoji as a bullet marker.
- ✨ emoji as a decorative line break.
- Filled icons in body rows mixed with line icons in nav.

## Custom iconography

For serious products, invest in a custom icon set tuned to the brand.
At minimum, customize:

- The empty-state illustrations.
- The primary nav icons.
- Brand-specific concepts (your domain has things no off-the-shelf set
  has).

Custom icons should still follow the size and weight rules above.

## Common pitfalls

- Two icon sets mixed by accident (Lucide in some files, Heroicons in
  others).
- Filled icons in a system that otherwise uses line icons.
- A different stroke weight per icon size.
- Icons that look too small relative to their text label.
- Icons sized in `em` and breaking on weight changes.
