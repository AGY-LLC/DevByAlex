# Prompt: choose-style

Use this when you need to pick the primary and secondary visual
direction for a product. This prompt drives `style-router.md` to produce
the canonical "style choice block" that downstream prompts read.

## Inputs

- A filled `project-brief-template.md` (or the live conversation
  context, if no brief exists yet).
- Optional: screenshots of competitors or "vibe" references the user
  has provided.

## Behavior

1. Read the brief end-to-end. If any of these fields are missing or
   unclear, ask the user 3–5 targeted questions before continuing:
   product category, target user, emotion, density, platform, things
   to avoid.
2. Walk through the 10 diagnostic questions in `style-router.md`. Write
   down each answer briefly.
3. Use the picker table in `style-router.md` to nominate a primary and
   secondary candidate.
4. Read the nominated `references/<primary>.md` and
   `references/<secondary>.md` end-to-end before locking in.
5. Run the three sanity checks at the end of the router (audience,
   density, anti-pattern).
6. If any check fails, re-pick. Do not "make it work."

## Output format

Produce exactly this block (copy-paste into `docs/DESIGN.md`):

```
PRODUCT CATEGORY:        <…>
TARGET USER:             <…>
BUSINESS / USER GOAL:    <…>
EMOTIONAL TONE:          <…>
INTERACTION DENSITY:     <low | medium | high>
PRIMARY STYLE:           <references/<name>.md, one-sentence why>
SECONDARY STYLE:         <references/<name>.md, one-sentence why>
VISUAL RULES:
  - <5–10 rules derived from the chosen pair>
ANTI-PATTERNS:
  - <5–10 things this UI must avoid>
COMPONENT LANGUAGE:      <radius, depth, borders, icon weight, surface logic>
MOTION STYLE:            <duration range, easing, what moves, what doesn't>
ACCESSIBILITY PRIORITIES:<contrast, focus, motion-reduced, screen reader>
RESPONSIVE PRIORITIES:   <breakpoints, what reflows, what disappears, mobile fallbacks>
```

## Safety / quality checks

- No single fixed aesthetic. Re-derive every time.
- If you find yourself defaulting to "modern SaaS gradient hero," stop
  and pick again.
- Never override the brief's "avoid" list: those are non-negotiable.

## Example invocation

> "Use prompts/choose-style.md on docs/UIUX-BRIEF.md to choose a visual
> direction for the AI notes app we're starting."
