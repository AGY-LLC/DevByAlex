# Tokens: typography

Type is the single biggest signal of taste. Two well-paired families
beat fifteen scattered ones.

## Stack model

```
display     : used for large headlines and expressive moments
body        : used for paragraphs, UI labels, and most surfaces
mono        : used for code, IDs, hashes, timestamps, tabular figures
```

Some products need only body. Many need body + display. Mono only when
the product actually has reasons (code, IDs, dense numerics).

## Choosing pairings

Pair by *contrast* and *coherence*:

- A display serif + a humanist sans → premium / editorial.
- A geometric sans alone (with weight contrast) → playful / consumer
  / wellness.
- A humanist sans + a mono → AI-native / devtool / finance.
- A confident-quirky display + a workhorse body → creative studio /
  brutalist.

Never combine two display faces. Never combine three families unless
mono is the third.

## Type scale

A modular scale grounded in your body size. A common starting set:

```
display-3   60–80px   (rare, expressive headlines)
display-2   40–56px   (page heroes)
display-1   28–36px   (section headers)
heading-3   22–24px
heading-2   18–20px
heading-1   16–18px
body        15–17px   (16 typical, 17 for editorial / wellness)
small       13–14px
caption     12px
mono        same scale, tracked tighter
```

Mobile usually drops display sizes by 25–40%; do not blindly carry
desktop sizes down.

## Line-height

```
display:    1.05–1.15  (tight, intentional)
heading:    1.15–1.3
body:       1.45–1.6   (1.6 for editorial / wellness; 1.5 for product UI)
serif body: 1.6–1.8
mono:       1.4–1.5
caption:    1.35–1.5
```

## Weight

- Most products need two weights of body (regular + medium) plus a
  semibold for emphasis. Avoid bold on long-form body type unless the
  display is doing nothing.
- Display can use a wider weight range (regular for delicate impact,
  bold for confident impact). Pick a weight for each use; don't
  shuffle.

## Tracking

- Body: default (0).
- Small caps / metadata: 0.04–0.10em.
- Display at large sizes: -0.01 to -0.03em (counters optical sparseness).
- Display at small sizes: 0.
- Buttons: 0 to 0.02em depending on family.

## Tabular figures

Required wherever numbers change in place: tables, dashboards, prices,
clocks, counters, key-stats panels. Enable `font-feature-settings:
"tnum"` or use a font with tabular numerals built in.

## Line length

- Body copy: 45–80 ch.
- Editorial long-form: 60–75 ch.
- UI labels: short, don't let them wrap on common viewports.

## Italics and emphasis

- Italics in serif: a real expressive tool. Use freely.
- Italics in sans: usually weaker, prefer weight change.
- Underline only for links and one specific decorative move per page.

## Drop caps, pull quotes, sidenotes

Editorial-direction surfaces benefit. Other directions usually don't.

## Mobile defaults

- Body ≥ 15px (16 preferred). Anything below 16 in inputs causes iOS
  to zoom: fix this for every input.
- Display sizes scaled down deliberately, not via `viewport` units that
  overshoot small screens.

## Per-reference leanings

- **premium-editorial**: display serif + humanist sans.
- **playful-consumer**: rounded humanist sans + soft display serif.
- **calm-japanese-mindful**: humanist serif + clean humanist sans;
  Japanese-readable face if multilingual.
- **technical-devtool**: humanist sans + dedicated mono.
- **ai-native-productivity**: humanist sans + optional serif for
  long-form + dedicated mono.
- **social-mobile**: system font (SF Pro / Inter), one weight family.
- **finance-trading**: humanist sans + dedicated mono with tabular
  figures.
- **luxury-commerce**: high-contrast serif (Didone family) + sans
  meta.
- **wellness-minimal**: friendly humanist sans, sometimes with a
  quiet serif for headers.
- **brutalist-experimental**: a weird display face + a workhorse
  mono or sans.
- **mobile-native-utility**: system font.
- **creative-studio-portfolio**: confident display + clean body sans.

## Common pitfalls

- Three or more families at once.
- Display set with default tracking: looks loose, especially at
  large sizes.
- Body in 14px because "it looks more modern": it looks smaller, not
  more modern.
- Buttons in display face: they're not labels for a magazine, they're
  for action.
- Bold all-caps mini-headings used everywhere: fatiguing.
- Default browser fonts in a portfolio site.
