# Preset: Boutique agency / personal brand website

A small design studio's website. The site itself is the portfolio.
Goal: serious inbound from sympathetic clients, not volume traffic.

## 1. Style diagnosis

| Question | Answer |
|---|---|
| Product category | Content (portfolio) |
| Target user | Prospective client (head of brand, founder, marketing lead), taste-conscious |
| Emotion | Confident, refined, considered, distinct |
| Interaction mode | Content |
| Density | Low |
| Platform | Responsive equal (desktop-led aesthetically) |
| Character | Premium + creative |
| Avoid | Dribbble-style 4-up thumbnail wall, generic "Hi I'm X" hero, "trusted by" logo strip in the hero, stock testimonials |

## 2. Primary style

**`references/premium-editorial.md`**: typography-led, generous space,
quiet confidence, real type system.

## 3. Secondary style

**`references/creative-studio-portfolio.md`**: asymmetry, project-tile
moments, immersive case studies. For high-end clientele, you can swap
this for `references/luxury-commerce.md` to add restrained foil-like
accents on a single signature element.

## 4. Visual rules

1. Home page is a moment, not a thumbnail wall.
2. One signature studio color used as either backdrop or single accent.
3. Display serif for headlines; clean sans for body and metadata.
4. Project pages full-bleed with editorial rhythm.
5. Contact reads as a sentence, not a 7-field form.
6. Logotype is a real designed mark, not Tailwind text-2xl-bold.
7. Footer is dignified: address, email, year, social. Short.
8. No "trusted by" logo strip in the hero; if needed, give it its own
   quiet section halfway down.

## 5. Anti-patterns

- A 4×N grid of identical thumbnails as the home page.
- Floating chat bubble plugins.
- Auto-play video hero.
- Newsletter modal on first scroll.
- Cookie banner that obscures the hero.
- Animated counters ("100+ projects shipped!").
- Stock photography of teams in meetings.
- "Hi, I'm [name], a designer passionate about clean design" copy.

## 6. Suggested components

- Hero: a single large headline, a 1-line subhead, one quiet CTA.
- Project tiles: confident type, single image, generous gap.
- Project case study layout: hero → problem → approach → outcome,
  editorial rhythm.
- About page: short essay tone, one photograph.
- Contact: a sentence with a mailto link, optionally a small form
  below.
- Footer: a sentence + meta, no megamenu.

## 7. Motion / interaction direction

- Restrained but expressive, one signature motion move per page.
- Project intro: thumbnail scales up to full-bleed.
- Optional: a slow horizontal-scroll case study layout (motion-reduced
  falls back to vertical).
- 250–400ms ease-out fades.
- Reduced motion: snap, but layout reads identically.

## 8. Sample design-system notes

```
COLOR
  surface:   #F2EFE9 (cream)
  ink:       #181818
  accent:    #2E4A3D (studio dark green), used very sparingly
  border:    rgba(24,24,24,0.10)

TYPOGRAPHY
  display:  refined serif (Tiempos Headline / GT Sectra family, concept-level)
  body:     humanist sans, 18px, 1.6 leading
  meta:     small caps, generous tracking (0.08em)

SPACING
  base: 4px
  hero vertical: 160–240px desktop / 96–120px mobile
  section gap: 120px desktop / 64px mobile
  body max width: 65ch

RADIUS
  none on imagery
  6–8px on the few utility surfaces (contact form, footer chips)

MOTION
  default: 300ms ease-out
  project intro: 600ms ease-out scale-and-crossfade
  reduced motion: 0ms snap, layout identical
```

## 9. Sample page override: Project case study

- Hero: full-bleed image, 90vh on desktop / 70vh on mobile.
- Title set in display serif overlapping the image bottom-left, with a
  subtle 1px hairline above the byline ("Client / Year").
- Body: single column 65ch, generous leading.
- Process: numbered sections (01 / 02 / 03) with hairline rules.
- Mid-page: a 2-image module (one large, one small) with a pull-quote
  in between.
- Outcome: a single sentence in display serif, centered, then a
  reading-experience footer.
- Footer of case study: "Next project →" with a quiet image preview.

## 10. Suggested `/uiux` workflow

1. `/uiux choose-style`: confirm editorial + studio split.
2. `/uiux extract-system`: generate the design system doc.
3. `/uiux page-override`: Home, Project index, Project case study,
   About, Contact.
4. `/uiux landing-polish`: Home and case-study hero.
5. `/uiux critique`: pass on each page.
6. `/uiux detect-ai-ui`: particularly on home and about.
7. `/uiux final-qa`: before ship.
