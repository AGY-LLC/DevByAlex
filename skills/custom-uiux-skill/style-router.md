# Style Router

The style router is how an AI decides **which** of the 12 reference
directions in `references/` to use for a given product. The output of this
file feeds every other step.

The router is **product-first**, not taste-first. The aesthetic follows the
audience, the goal, and the interaction model, not the other way around.

---

## The 10 diagnostic questions

Answer all ten before choosing a direction. If you cannot answer a question
from the brief, ask the user. Never skip.

### 1. What kind of product is this?

Categories to consider: content (read), workflow (do work), social
(connect/share), commerce (buy/sell), data (monitor/decide), creation
(make), utility (a small focused tool), education (learn), wellness
(reflect/improve), entertainment (play), infrastructure (devtools / API
consoles).

A product can blend categories (a notes app is "creation + workflow"),
but one usually dominates. Name the dominant one explicitly.

### 2. Who is the target user?

Identify: profession or role, technical literacy (low/med/high), age
range, expected device, and whether they use the product because they
*want to* (consumer) or because they *have to* (work tool). A high-end
investor and a teenager are two different products even if the feature
list overlaps.

### 3. What emotion should the UI create?

Pick 1–3 emotions from this short list and write them down:
calm, focused, fast, premium, trustworthy, playful, exciting, refined,
quiet, confident, intimate, bold, technical, friendly, mindful.
"Modern" and "clean" are not emotions; reject them.

### 4. What is the dominant interaction mode?

content / workflow / social / commerce / data / creation / utility.
This is sometimes the same as question 1 but framed by what the user
*does* most of the time. A finance app's category is "data" and its
interaction mode is also data. A social app's category is social and
interaction is social. A devtool's category may be infrastructure but
interaction is workflow.

### 5. What is the interaction density?

- **Low**: large type, lots of whitespace, one decision per screen
  (wellness, editorial, marketing).
- **Medium**: multiple panels, secondary actions visible (productivity,
  ecommerce, education).
- **High**: dense data, many shortcuts, expert use (trading dashboards,
  CRMs, dev consoles, pro tools).

### 6. What is the platform priority?

- **Mobile-first**: primary surface is a phone.
- **Desktop-first**: primary surface is ≥ 1280px.
- **Responsive equal**: both surfaces matter equally.

A "responsive" decision is not the same as "mobile-first." Many B2B tools
are responsive but desktop-dominant.

### 7. What overall character should the experience have?

Pick one primary character: premium, playful, technical, calm, fast,
experimental, luxurious, practical. This is the spine of the visual
language.

### 8. What should the UI definitely avoid?

Write down 3–7 things this UI must not look like. Examples: "do not look
like a fintech bro app," "no sparkle/AI gradient," "no bento grid," "no
glassmorphism," "do not feel like a school assignment," "no stock photos
of teams in meetings." Avoid lists protect against the dominant AI bias.

### 9. Primary reference direction

Match the answers above to one entry in `references/`. Use the table
below as a starting point, not as a constraint.

### 10. Secondary reference direction

Pick a second direction that adds *freshness* without contradicting the
primary. The secondary affects: typography choices, accent moves, motion,
illustration style, and 1–2 hero moments. It does **not** override the
primary's structure or component patterns.

---

## Reference picker table (heuristic, not a law)

| If the product feels like…                                | Primary candidate            | Common secondary                  |
|-----------------------------------------------------------|------------------------------|-----------------------------------|
| A serious magazine, long-read, or thought-leader site     | premium-editorial            | creative-studio-portfolio         |
| A toy-like consumer app with high emotion                 | playful-consumer             | social-mobile                     |
| A meditation, journaling, or slow learning app            | calm-japanese-mindful        | wellness-minimal                  |
| A CLI-adjacent product, dev console, API tool             | technical-devtool            | ai-native-productivity            |
| A modern AI notes / agent / chat / IDE                    | ai-native-productivity       | premium-editorial / technical     |
| A photo / video / DM social app                           | social-mobile                | playful-consumer                  |
| A trading, portfolio, ops, or BI dashboard                | finance-trading-dashboard    | technical-devtool                 |
| A high-end fashion / jewelry / hotel commerce store       | luxury-commerce              | premium-editorial                 |
| A fitness, sleep, mental-health, or supplement app        | wellness-minimal             | calm-japanese-mindful             |
| A weird, opinionated, very-online product                 | brutalist-experimental       | creative-studio-portfolio         |
| A small focused mobile tool (calc, timer, scanner)        | mobile-native-utility        | playful-consumer / wellness       |
| A boutique agency, freelancer, or portfolio site          | creative-studio-portfolio    | premium-editorial / luxury        |

If your product is not on this table, pick the row whose **audience and
emotion** match yours, not whose feature list matches yours.

---

## Conflict rules

When primary and secondary disagree:

1. **Layout, hierarchy, density** → always primary.
2. **Color system base** → primary; secondary may suggest one accent.
3. **Typography stack** → primary; secondary may inform the display face.
4. **Component shape language** (radius, depth, borders) → primary.
5. **Motion personality** → blend, but never exceed primary's energy.
6. **Anti-patterns** → union of both. If either direction says "no X,"
   the answer is no X.

---

## The style-choice prompt (the routable output)

When this router runs, it must produce a single short block. Paste this
into the project's design doc and into the next prompt's context.

```
PRODUCT CATEGORY:        <e.g. "AI-native productivity (notes + agent)">
TARGET USER:             <role, literacy, device, voluntary/required>
BUSINESS / USER GOAL:    <one sentence>
EMOTIONAL TONE:          <1–3 emotions>
INTERACTION DENSITY:     <low | medium | high>
PRIMARY STYLE:           <references/<name>.md>
SECONDARY STYLE:         <references/<name>.md>
VISUAL RULES:            <5–10 short rules, derived from primary + secondary>
ANTI-PATTERNS:           <5–10 things to avoid>
COMPONENT LANGUAGE:      <radius, depth, borders, icon weight, surface logic>
MOTION STYLE:            <duration range, easing, what moves, what doesn't>
ACCESSIBILITY PRIORITIES:<contrast, focus, motion-reduced, screen reader>
RESPONSIVE PRIORITIES:   <breakpoints, what reflows, what disappears, mobile fallbacks>
```

Every downstream prompt (`prompts/generate-new-screen.md`,
`prompts/redesign-existing-screen.md`, `prompts/landing-page-polish.md`,
`prompts/mobile-ui-polish.md`, `prompts/final-ui-qa.md`) assumes this
block exists.

---

## Sanity checks before locking in

Before locking the direction, run these three checks:

- **Audience check**: Would the actual target user describe this UI in
  the language we wrote in question 3? If we said "calm" and the user
  would say "exciting," we picked wrong.
- **Density check**: Does the chosen direction's density match question
  5? Editorial is low density; you cannot use it for a trading desk.
- **Anti-pattern check**: Read the "Anti-patterns" sections of both
  chosen references. If any of them contradicts the brief's required
  feature, swap the direction.

If any check fails, re-pick. Do not "make it work."
