---
id: design-styles
title: "Design style vocabulary: 50 named styles + the structure×feeling model"
summary: "The named-style vocabulary the /plan-design step picks from. A visual style is chosen as PRIMARY (structure/layout, one of 12 product directions) × SECONDARY (feeling/decoration, one of these 50 named styles). This file is the catalog, the structure→feeling mapping, and the decision procedure that turns an app's category + audience + tone into a recommended pairing. Feeds docs/DESIGN.md."
tags: ["design", "uiux", "style", "branding", "plan"]
updated: 2026-11-20
---
# Design style vocabulary

> Read by **`/plan-design`** to recommend a named visual style for an app, and by
> `/uiux-audit` / `/uiux-redesign` when a style has been chosen.
> The output of a style pick lives in the app's **`docs/DESIGN.md`** ("Style
> choice"), and the decision is recorded like any other (ADR / DECISIONS).

A named style says what visual world a product belongs to; the design-system
dimensions in [`../stack/uiux.md`](../stack/uiux.md) then set its exact tokens.
A strong brief names **both**.

## The one rule: structure × feeling

Never pick a single style. Pick **two**, with clear jobs:

- **PRIMARY = structure / layout.** The spine. One of **12
  visual directions** (below): these encode the *product archetype* and drive
  layout, density, navigation, and component choices. The primary **wins every
  conflict** and always governs usability (a brutalist landing page does **not**
  mean a brutalist form: forms always follow the forms checklist).
- **SECONDARY = feeling / decoration.** The freshness. One of the **50 named
  styles** in this file: these carry mood, palette temperament, texture, and
  motif so the result doesn't read as generic "modern SaaS." The secondary
  colors the primary; it never breaks it.

> Formula: `Create a [output] for [use case]. Style: [PRIMARY] × [SECONDARY].`
> then layout, colors, typography, textures, lighting, motifs, mood, use case,
> constraints (readable · modern · production-ready · not cluttered · not generic).

### The 12 PRIMARY directions (structure)

`premium editorial` · `playful consumer` · `calm Japanese` · `technical devtool`
· `AI-native productivity` · `social mobile` · `finance dashboard` · `luxury
commerce` · `wellness minimal` · `brutalist experimental` · `mobile-native
utility` · `creative studio`.

Pick the primary from the product's **category + density**, not its mood. A
budgeting app is a `finance dashboard` whether its feeling is calm or playful.

## The 50 SECONDARY styles (feeling)

Format, **Name**, essence · *mood* · fits (the feel of project it suits, feelings only, never a named product, brand or industry) · `prompt keyword`.

### Premium / luxury / heritage
1. **Neoclassical**: Greco-Roman order & authority · *formal, timeless, noble* · fits projects that should feel settled, trusted and built to last · `serif, symmetry, marble, laurel, muted+gold`
2. **Baroque**: ornate 17th-c. drama · *regal, theatrical* · fits big moments that want grandeur and a sense of occasion · `flourishes, gold leaf, deep shadow, high contrast`
3. **Filigree**: delicate metallic lace ornament · *luxurious, ceremonial* · fits rare, celebratory things where every detail feels precious · `metallic linework, monogram, fine borders`
4. **Acanthus**: classical leaf/vine ornament · *regal, organic, refined* · fits refined things that want quiet growth and old-world care · `leaf motifs, symmetric vines, stone, green+gold`
5. **Luxury Typography**: type carries the brand · *elegant, elite* · fits pieces where restraint and taste are the whole message · `refined serif, wide spacing, monochrome, gold foil`
6. **Art Deco**: 1920s geometry & glamour · *glamorous, jazzy* · fits nights out and launches that want sparkle and swagger · `symmetry, sunbursts, angular, jewel tones, gold`
7. **Victorian**: ornate 19th-c. Britain · *opulent, romantic* · fits cosy, storied things with a love of the past · `ornate serif, damask, deep red/green, gilded`
8. **Gothic**: dark medieval romance · *dramatic, mysterious* · fits dark tales and anything that should feel a little forbidden · `blackletter, stained glass, stone, deep purple/black`
9. **Tenebrism**: extreme chiaroscuro lighting · *intense, moody, cinematic* · fits dramatic, high-stakes moments best seen in the dark · `black bg, spotlight, deep shadow, oil-paint`

### Organic / natural / calm
10. **Japandi**: Japanese min. × Scandi function · *calm, intentional, grounded* · fits calm, everyday tools that should feel uncluttered and kind · `beige/gray, light wood, clean sans, soft curves`
11. **Wabi Sabi**: beauty in imperfection · *humble, contemplative* · fits slow, reflective things that welcome imperfection · `earthy tones, rough texture, asymmetry, organic`
12. **Art Nouveau**: flowing nature lines · *romantic, poetic, organic* · fits handmade, poetic things that flow rather than march · `curving lines, floral, hand-letter, stained-glass`
13. **Bohemian**: eclectic earthy free-spirit · *soulful, artistic* · fits free-spirited, collected things with lots of personality · `layered texture, mandalas, jewel tones, global print`
14. **Farmhouse / Cottagecore**: romanticized rural · *cozy, wholesome, rustic* · fits homely, slow-paced things that feel made with love · `florals, gingham, wood, antique, hand-drawn`
15. **Ethereal**: misty, weightless light · *calm, mystical, romantic* · fits gentle first steps and anything that should feel weightless · `pastels, gauzy overlays, airy, low contrast`
16. **Aurora**: glowing gradient light · *dreamy, futuristic, cosmic* · fits hopeful, forward-looking things with a touch of wonder · `iridescent gradients, glow, translucent, wave forms`
17. **Light Academia**: sunlit scholarship · *scholarly, calm, poetic* · fits reading and learning that should feel unhurried and bright · `creamy neutrals, serif, books, linen, sunlight`

### Playful / youthful / friendly
18. **Kawaii**: Japanese cuteness · *sweet, joyful, friendly* · fits friendly, low-stakes things that should make people smile · `pastels, rounded, cute faces, handwritten`
19. **Anthropomorphic**: human traits on objects · *fun, quirky, relatable* · fits playful things that want a character people warm to · `expressive eyes, friendly rounded, mascot`
20. **Pop Art**: mass-media comic bold · *loud, energetic, commercial* · fits loud, attention-grabbing moments that want instant energy · `Ben-Day dots, bold outlines, primary colors, speech bubbles`
21. **Memphis**: 1980s clashing geometry · *youthful, rebellious* · fits young, rule-breaking things that like a clash · `bright primaries, squiggles, blocks, clashing`
22. **Coquette**: ultra-feminine flirty · *delicate, girly, romantic* · fits soft, dainty things that lean sweet and romantic · `baby pink, ribbons, pearls, dainty serif, lace`
23. **Kitsch**: ironic "bad taste" · *campy, exaggerated* · fits tongue-in-cheek things that love excess and irony · `clashing prints, outdated fonts, plastic gloss, saturated`
24. **Shabby Chic**: soft distressed vintage · *romantic, cozy, nostalgic* · fits gentle, nostalgic things with a worn-in softness · `whitewash, faded floral, cursive, soft pink/blue`

### Retro / nostalgic
25. **Y2K**: early-2000s cyber gloss · *futuristic-nostalgic, edgy* · fits edgy, shiny things looking back at the future · `chrome, pixel type, metallic, iridescent, matrix`
26. **Synthwave**: 1980s neon sci-fi · *retro-futuristic, cinematic* · fits after-dark, cinematic things with a neon pulse · `neon grid horizon, VHS, purple/cyan, chrome 3D`
27. **Vaporwave**: surreal 80s/90s consumer irony · *ironic, dreamy, surreal* · fits dreamy, ironic side projects that like the surreal · `pastel pink/purple, VHS glitch, Greek busts, lo-fi`
28. **Pixel Art**: visible-pixel retro game · *nostalgic, playful, geeky* · fits playful, nostalgic things that reward a bit of geekiness · `pixel grid, 8/16-bit, limited palette, blocky`
29. **Mid-Century**: 1940s–60s warm modernism · *nostalgic, optimistic, warm* · fits warm, optimistic things with a sunny retro calm · `clean lines, retro palette, boomerang, mod, sans`
30. **Neo Frutiger Aero**: revived Y2K aqua UI · *clean, playful, nostalgic* · fits bubbly, friendly things that want gloss and good cheer · `aqua gradients, glossy bubbles, rounded UI, friendly icons`

### Bold / raw / different
31. **Neo-Brutalism**: raw-but-usable brutalism · *confident, bold, functional* · fits confident, opinionated things that want to stand out · `bold color blocks, oversized type, strong borders, asymmetry` · 2px black borders, a 4px 4px 0 shadow, press slides into it (no overlay or scale press too), never a blurred shadow, dense dashboard or long reading page; dark mode uses outlines, not shadows; no glass
32. **Brutalism**: stark unpolished raw · *disruptive, honest, raw* · fits raw, honest work that refuses to be polished · `monospace, grayscale blocks, harsh edges, default buttons`
33. **Graffiti**: street spray-paint · *urban, defiant, expressive* · fits loud, defiant things with street-level energy · `spray texture, dripping letters, concrete, neon`
34. **Cybercore**: dense hacker sci-fi · *chaotic, dystopian, intense* · fits intense, technical things that thrive on density · `neon, glitch, code texture, green/black, dense UI`
35. **Steampunk**: Victorian × industrial · *adventurous, imaginative* · fits adventurous, inventive things with a tinkerer's spirit · `copper, cogwheels, leather, steam, serif`
36. **Mystical Western**: cowboy × occult · *rugged, spiritual, folklore* · fits mystical, rugged things steeped in folklore · `tarot symbols, cacti, western serif, sun/moon, leather`
37. **South West / Wild West**: desert cowboy heritage · *rugged, warm, nostalgic* · fits warm, rugged things with wide-open-sky nostalgia · `terracotta, cacti, denim, western serif, desert`

### Clean / structured / functional
38. **Bauhaus**: form-follows-function geometry · *rational, structured, modern* · fits principled, idea-led things that want clear geometry · `grid, sans, red/blue/yellow, circle/triangle/square`
39. **Bento UI**: modular compartment blocks · *organized, clean, friendly* · fits many small, separate pieces seen together at a glance · `rounded modular cards, subtle shadow, icons+labels` · only where the content really is separate widgets, never the page-wide default (reading and landing sections flow)
40. **Glassmorphism**: frosted-glass depth · *sleek, elegant, futuristic* · fits airy, forward-looking tools with layers that float · `frosted panels, blur, semi-transparent, neon tint` · floating layers only (nav, sidebars, popovers, menus), never cards, tables, charts, long text or page backgrounds; frosted under text (clear only over media, 35% dark scrim if bright); text passes contrast on every backdrop; faint 1px edge; solid under reduced transparency or more contrast; no glass on glass or moving backgrounds
41. **Utilitarian**: function-first, no decoration · *practical, efficient, direct* · fits no-nonsense tools where speed and clarity come first · `strict grid, monospace/industrial, muted, clear hierarchy`
42. **Modular Typography**: letters from grid systems · *structural, experimental* · fits experimental, structural things where type is the image · `geometric letterforms, type grids, modular blocks`

### Artistic / expressive / textured
43. **Conceptual Sketch**: raw hand-drawn ideation · *experimental, unfinished* · fits early, exploratory things that should feel unfinished · `pencil lines, crosshatch, sketch paper, annotations`
44. **Pointillism**: image from dots · *artistic, tranquil, impressionistic* · fits quiet, artful things that reward a closer look · `dot clusters, optical mix, soft palette, grain`
45. **Mixed Media**: collage of photo+illustration · *eclectic, avant-garde, tactile* · fits eclectic, tactile things with an avant-garde streak · `cutouts, overlays, paper texture, collage`
46. **Surrealism**: dreamlike juxtaposition · *dreamy, strange, thought-provoking* · fits strange, thought-provoking things that bend reality · `melting forms, disjointed objects, unexpected scale`
47. **Scrapbook**: handmade memory collage · *sentimental, warm, personal* · fits personal, sentimental things about memories · `paper, washi tape, Polaroid, hand-letter, stickers`
48. **Dark Magic Academia**: gothic scholarship × occult · *mysterious, scholarly, magical* · fits mysterious, scholarly things with a hint of magic · `candles, spellbooks, black+gold, calligraphy, symbols`

### Themed / structured-decorative
49. **Nautical**: maritime coastal · *fresh, structured, classic* · fits fresh, breezy things that want crisp dependability · `navy/white, anchors, rope, stripes, brass`
50. **Rebus**: symbols-as-words visual wit · *witty, playful, intellectual* · fits witty, clever things that like a puzzle · `pictograms, visual puns, image-type hybrids`

## Selection cheat sheet (feeling buckets)

- **Clean / organized**: Bento UI · Bauhaus · Utilitarian · Japandi · Glassmorphism
- **Dreamy / emotional**: Aurora · Ethereal · Wabi Sabi · Scrapbook · Surrealism
- **Premium / luxury**: Luxury Typography · Art Deco · Neoclassical · Baroque · Filigree · Glassmorphism
- **Playful / youthful**: Kawaii · Pop Art · Memphis · Neo Frutiger Aero · Anthropomorphic · Pixel Art
- **Bold / different**: Neo-Brutalism · Brutalism · Graffiti · Cybercore · Kitsch
- **Nostalgic**: Y2K · Vaporwave · Synthwave · Pixel Art · Mid-Century · Scrapbook · Neo Frutiger Aero
- **Organic / natural**: Wabi Sabi · Japandi · Art Nouveau · Acanthus · Bohemian · Cottagecore
- **Dark / dramatic**: Gothic · Tenebrism · Dark Magic Academia · Cybercore · Baroque

## PRIMARY → SECONDARY pairing map (defaults + alternatives)

Start from the product's structural direction; pick a feeling that fits its
audience/tone. Defaults are safe; alternatives add character. **Avoid** flags a
pairing that fights the primary's job.

| PRIMARY (structure) | Default feeling | Fresh alternatives | Avoid |
|---|---|---|---|
| **premium editorial** | Luxury Typography | Neoclassical, Art Deco, Light Academia | Kawaii, Kitsch, Pixel Art |
| **playful consumer** | Neo Frutiger Aero | Kawaii, Pop Art, Memphis, Anthropomorphic | Neoclassical, Tenebrism, Brutalism |
| **calm Japanese** | Japandi | Wabi Sabi, Ethereal, Light Academia | Cybercore, Memphis, Graffiti |
| **technical devtool** | Utilitarian | Bauhaus, Brutalism, Cybercore (dark) | Coquette, Shabby Chic, Baroque |
| **AI-native productivity** | Glassmorphism | Aurora, Bento UI, Modular Typography | Victorian, Farmhouse, Kitsch |
| **social mobile** | Neo Frutiger Aero | Pop Art, Y2K, Bento UI | Neoclassical, Utilitarian, Gothic |
| **finance dashboard** | Utilitarian | Bauhaus, Bento UI, Glassmorphism | Graffiti, Vaporwave, Coquette |
| **luxury commerce** | Luxury Typography | Art Deco, Filigree, Neoclassical, Baroque | Brutalism, Pixel Art, Kitsch |
| **wellness minimal** | Japandi | Wabi Sabi, Ethereal, Aurora | Cybercore, Memphis, Graffiti |
| **brutalist experimental** | Neo-Brutalism | Brutalism, Graffiti, Modular Typography | Coquette, Ethereal, Shabby Chic, Glassmorphism |
| **mobile-native utility** | Utilitarian | Neo Frutiger Aero, Bento UI | Baroque, Surrealism, Tenebrism |
| **creative studio** | Mixed Media | Neo-Brutalism, Surrealism, Memphis, Graffiti | Utilitarian, Nautical, Finance-clean |

## Decision procedure (what `/plan-design` runs)

1. **Read the inputs**: from `docs/SPEC.md` (category, audience, the 2–3
   emotional-tone adjectives, interaction density, platform), `docs/BRAND.md`
   (voice, visual-vocabulary direction, palette hints) if present, and any
   references/anti-patterns the user gave.
2. **Fix the PRIMARY from category + density**, not mood: a budgeting tool is a
   `finance dashboard` even if the tone is warm. Density: low → consumer
   directions, medium → productivity, high → dashboard/devtool.
3. **Choose the SECONDARY from the tone adjectives** using the cheat-sheet
   buckets, constrained to the primary's row above (respect **Avoid**).
4. **Recommend one pairing + two alternatives**, each with a one-line rationale
   tying it to the inputs and a note on what it makes the app *feel* like. This
   is a taste call: **present, let Alex confirm or override.**
5. **Translate the pick into starting tokens**: the style implies a palette
   temperament, a type register (serif/sans/mono/display), a texture/motif set,
   a radius factor (0, 0.75, 1 or 1.5, see uiux.md) and shadow feel, and a motion personality. `/plan-design` expands these
   into the full token system and component rules in `docs/DESIGN.md`.
6. **Keep usability independent of aesthetic.** The accessibility floor and
   component defaults in [`../stack/uiux.md`](../stack/uiux.md) hold in every style.

Naming a style with a recorded reason is the antidote to the generic-AI-UI
look; the full no-fly list is in [`../stack/uiux.md`](../stack/uiux.md).
