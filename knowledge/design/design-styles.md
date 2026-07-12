---
id: design-styles
title: "Design style vocabulary: 50 named styles + the structure×feeling model"
summary: "The named-style vocabulary the /plan-design step picks from. A visual style is chosen as PRIMARY (structure/layout, one of custom-uiux-skill's 12 product directions) × SECONDARY (feeling/decoration, one of these 50 named styles). This file is the catalog, the structure→feeling mapping, and the decision procedure that turns an app's category + audience + tone into a recommended pairing. Feeds docs/DESIGN.md."
tags: ["design", "uiux", "style", "branding", "plan"]
updated: 2026-07-06
---
# Design style vocabulary

> Read by **`/plan-design`** to recommend a named visual style for an app, and by
> `/uiux-init` / `/uiux-audit` / `/uiux-redesign` when a style has been chosen.
> The output of a style pick lives in the app's **`docs/DESIGN.md`** ("Style
> choice"), and the decision is recorded like any other (ADR / DECISIONS).

A named style is a **shortcut for the visual world** a product should belong to.
It answers *"what world does this design belong to?"*: then the design-system
dimensions in [`../stack/uiux.md`](../stack/uiux.md) (color, type, spacing,
radius, shadow, motion, iconography, states) answer *"what colors, layout,
typography, textures, and mood does it have?"* A strong brief names **both**.

## The one rule: structure × feeling

Never pick a single style. Pick **two**, with clear jobs:

- **PRIMARY = structure / layout.** The spine. One of **custom-uiux-skill's 12
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

### The 12 PRIMARY directions (structure: from custom-uiux-skill)

`premium editorial` · `playful consumer` · `calm Japanese` · `technical devtool`
· `AI-native productivity` · `social mobile` · `finance dashboard` · `luxury
commerce` · `wellness minimal` · `brutalist experimental` · `mobile-native
utility` · `creative studio`.

Pick the primary from the product's **category + density**, not its mood. A
budgeting app is a `finance dashboard` whether its feeling is calm or playful.

## The 50 SECONDARY styles (feeling)

Format, **Name**, essence · *mood* · best-for · `prompt keyword`.

### Premium / luxury / heritage
1. **Neoclassical**: Greco-Roman order & authority · *formal, timeless, noble* · museums, heritage, premium editorial · `serif, symmetry, marble, laurel, muted+gold`
2. **Baroque**: ornate 17th-c. drama · *regal, theatrical* · premium packaging, lavish campaigns · `flourishes, gold leaf, deep shadow, high contrast`
3. **Filigree**: delicate metallic lace ornament · *luxurious, ceremonial* · luxury packaging, wedding, invitations · `metallic linework, monogram, fine borders`
4. **Acanthus**: classical leaf/vine ornament · *regal, organic, refined* · museum branding, luxury packaging · `leaf motifs, symmetric vines, stone, green+gold`
5. **Luxury Typography**: type carries the brand · *elegant, elite* · luxury fashion, premium landing · `refined serif, wide spacing, monochrome, gold foil`
6. **Art Deco**: 1920s geometry & glamour · *glamorous, jazzy* · luxury, event posters · `symmetry, sunbursts, angular, jewel tones, gold`
7. **Victorian**: ornate 19th-c. Britain · *opulent, romantic* · book covers, tea, heritage · `ornate serif, damask, deep red/green, gilded`
8. **Gothic**: dark medieval romance · *dramatic, mysterious* · fantasy, alt fashion, dark storytelling · `blackletter, stained glass, stone, deep purple/black`
9. **Tenebrism**: extreme chiaroscuro lighting · *intense, moody, cinematic* · dark-mode premium, dramatic posters · `black bg, spotlight, deep shadow, oil-paint`

### Organic / natural / calm
10. **Japandi**: Japanese min. × Scandi function · *calm, intentional, grounded* · wellness, calm productivity, decor · `beige/gray, light wood, clean sans, soft curves`
11. **Wabi Sabi**: beauty in imperfection · *humble, contemplative* · wellness, tea, mindful UI · `earthy tones, rough texture, asymmetry, organic`
12. **Art Nouveau**: flowing nature lines · *romantic, poetic, organic* · natural cosmetics, artisan, posters · `curving lines, floral, hand-letter, stained-glass`
13. **Bohemian**: eclectic earthy free-spirit · *soulful, artistic* · handmade, travel, festival · `layered texture, mandalas, jewel tones, global print`
14. **Farmhouse / Cottagecore**: romanticized rural · *cozy, wholesome, rustic* · recipe, slow-living, handmade · `florals, gingham, wood, antique, hand-drawn`
15. **Ethereal**: misty, weightless light · *calm, mystical, romantic* · mindfulness, beauty, soft onboarding · `pastels, gauzy overlays, airy, low contrast`
16. **Aurora**: glowing gradient light · *dreamy, futuristic, cosmic* · wellness, AI products, ambient · `iridescent gradients, glow, translucent, wave forms`
17. **Light Academia**: sunlit scholarship · *scholarly, calm, poetic* · study apps, reading, education · `creamy neutrals, serif, books, linen, sunlight`

### Playful / youthful / friendly
18. **Kawaii**: Japanese cuteness · *sweet, joyful, friendly* · stationery, kids, friendly onboarding · `pastels, rounded, cute faces, handwritten`
19. **Anthropomorphic**: human traits on objects · *fun, quirky, relatable* · mascots, gamified UX, kids · `expressive eyes, friendly rounded, mascot`
20. **Pop Art**: mass-media comic bold · *loud, energetic, commercial* · retail, fashion, launch ads · `Ben-Day dots, bold outlines, primary colors, speech bubbles`
21. **Memphis**: 1980s clashing geometry · *youthful, rebellious* · creative brands, youth, events · `bright primaries, squiggles, blocks, clashing`
22. **Coquette**: ultra-feminine flirty · *delicate, girly, romantic* · beauty, fashion reels, feminine packaging · `baby pink, ribbons, pearls, dainty serif, lace`
23. **Kitsch**: ironic "bad taste" · *campy, exaggerated* · parody, Gen-Z, nostalgic remix · `clashing prints, outdated fonts, plastic gloss, saturated`
24. **Shabby Chic**: soft distressed vintage · *romantic, cozy, nostalgic* · weddings, vintage boutique, decor · `whitewash, faded floral, cursive, soft pink/blue`

### Retro / nostalgic
25. **Y2K**: early-2000s cyber gloss · *futuristic-nostalgic, edgy* · fashion, tech revival, youth ads · `chrome, pixel type, metallic, iridescent, matrix`
26. **Synthwave**: 1980s neon sci-fi · *retro-futuristic, cinematic* · music visuals, arcade, nightlife · `neon grid horizon, VHS, purple/cyan, chrome 3D`
27. **Vaporwave**: surreal 80s/90s consumer irony · *ironic, dreamy, surreal* · indie music, art zines, experimental · `pastel pink/purple, VHS glitch, Greek busts, lo-fi`
28. **Pixel Art**: visible-pixel retro game · *nostalgic, playful, geeky* · indie games, retro events, game UI · `pixel grid, 8/16-bit, limited palette, blocky`
29. **Mid-Century**: 1940s–60s warm modernism · *nostalgic, optimistic, warm* · furniture, decor, retro product · `clean lines, retro palette, boomerang, mod, sans`
30. **Neo Frutiger Aero**: revived Y2K aqua UI · *clean, playful, nostalgic* · playful fintech, web3, app-store visuals · `aqua gradients, glossy bubbles, rounded UI, friendly icons`

### Bold / raw / different
31. **Neo-Brutalism**: raw-but-usable brutalism · *confident, bold, functional* · agency sites, digital mags, Gen-Z brand · `bold color blocks, oversized type, strong borders, asymmetry`
32. **Brutalism**: stark unpolished raw · *disruptive, honest, raw* · artist portfolios, counterculture · `monospace, grayscale blocks, harsh edges, default buttons`
33. **Graffiti**: street spray-paint · *urban, defiant, expressive* · streetwear, festivals, youth · `spray texture, dripping letters, concrete, neon`
34. **Cybercore**: dense hacker sci-fi · *chaotic, dystopian, intense* · cybersecurity, gaming, sci-fi · `neon, glitch, code texture, green/black, dense UI`
35. **Steampunk**: Victorian × industrial · *adventurous, imaginative* · games, books, fantasy products · `copper, cogwheels, leather, steam, serif`
36. **Mystical Western**: cowboy × occult · *rugged, spiritual, folklore* · crystal/tarot, indie, desert · `tarot symbols, cacti, western serif, sun/moon, leather`
37. **South West / Wild West**: desert cowboy heritage · *rugged, warm, nostalgic* · ranch, outdoor gear, festivals · `terracotta, cacti, denim, western serif, desert`

### Clean / structured / functional
38. **Bauhaus**: form-follows-function geometry · *rational, structured, modern* · brand systems, posters, product · `grid, sans, red/blue/yellow, circle/triangle/square`
39. **Bento UI**: modular compartment blocks · *organized, clean, friendly* · dashboards, SaaS landing, portfolios · `rounded modular cards, subtle shadow, icons+labels`
40. **Glassmorphism**: frosted-glass depth · *sleek, elegant, futuristic* · apps, OS-style UI, AI interfaces · `frosted panels, blur, semi-transparent, neon tint`
41. **Utilitarian**: function-first, no decoration · *practical, efficient, direct* · manuals, utility apps, dev tools · `strict grid, monospace/industrial, muted, clear hierarchy`
42. **Modular Typography**: letters from grid systems · *structural, experimental* · posters, brand systems, editorial headers · `geometric letterforms, type grids, modular blocks`

### Artistic / expressive / textured
43. **Conceptual Sketch**: raw hand-drawn ideation · *experimental, unfinished* · portfolios, brainstorming, concept art · `pencil lines, crosshatch, sketch paper, annotations`
44. **Pointillism**: image from dots · *artistic, tranquil, impressionistic* · fine-art branding, editorials, museum · `dot clusters, optical mix, soft palette, grain`
45. **Mixed Media**: collage of photo+illustration · *eclectic, avant-garde, tactile* · magazines, experimental branding · `cutouts, overlays, paper texture, collage`
46. **Surrealism**: dreamlike juxtaposition · *dreamy, strange, thought-provoking* · concept art, editorial campaigns · `melting forms, disjointed objects, unexpected scale`
47. **Scrapbook**: handmade memory collage · *sentimental, warm, personal* · journaling, memory, photo apps · `paper, washi tape, Polaroid, hand-letter, stickers`
48. **Dark Magic Academia**: gothic scholarship × occult · *mysterious, scholarly, magical* · fantasy games, witchy brands · `candles, spellbooks, black+gold, calligraphy, symbols`

### Themed / structured-decorative
49. **Nautical**: maritime coastal · *fresh, structured, classic* · seafood, resorts, summer, sailing · `navy/white, anchors, rope, stripes, brass`
50. **Rebus**: symbols-as-words visual wit · *witty, playful, intellectual* · education, puzzles, logo concepts, campaigns · `pictograms, visual puns, image-type hybrids`

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
| **social mobile** | Bento UI | Neo Frutiger Aero, Pop Art, Y2K | Neoclassical, Utilitarian, Gothic |
| **finance dashboard** | Bento UI | Bauhaus, Utilitarian, Glassmorphism | Graffiti, Vaporwave, Coquette |
| **luxury commerce** | Luxury Typography | Art Deco, Filigree, Neoclassical, Baroque | Brutalism, Pixel Art, Kitsch |
| **wellness minimal** | Japandi | Wabi Sabi, Ethereal, Aurora | Cybercore, Memphis, Graffiti |
| **brutalist experimental** | Neo-Brutalism | Brutalism, Graffiti, Modular Typography | Coquette, Ethereal, Shabby Chic |
| **mobile-native utility** | Bento UI | Utilitarian, Neo Frutiger Aero | Baroque, Surrealism, Tenebrism |
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
   a radius/shadow feel, and a motion personality. Seed these into
   `docs/DESIGN.md`; `/uiux-init` (or the vendored uiux practice) expands them
   into the full token system and component rules.
6. **Keep usability independent of aesthetic.** The accessibility floor
   ([`../stack/uiux.md`](../stack/uiux.md), WCAG 2.2 AA) and the forms/interaction
   rules hold regardless of style: a dramatic style never lowers contrast,
   shrinks hit targets, or removes focus rings.

## Anti-patterns this vocabulary exists to prevent

Naming a style is the antidote to the **#1 generic-AI-UI tell**: defaulting to
one intentionless "modern SaaS" look (gradient hero + bento grid + sparkle icons
+ templated copy). See the full no-fly list in [`../stack/uiux.md`](../stack/uiux.md).
Picking `[PRIMARY] × [SECONDARY]` with a recorded reason **is** the intent.
