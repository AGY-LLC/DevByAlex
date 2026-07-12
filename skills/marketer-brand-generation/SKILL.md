---
name: marketer-brand-generation
description: >-
  When the user wants to generate, refresh, or formalize a brand foundation for a project: including positioning, voice and tone, audience, value proposition, pillar messaging, naming/tagline, and visual vocabulary direction. Also use when the user says "create a brand," "brand strategy," "brand voice," "positioning," "messaging framework," "tagline," "value prop," "brand guidelines," "define our brand," "rebrand," "brand identity," "tone of voice," or "who are we and what do we say." Reads any existing `docs/BRAND.md` for context, and writes the brand foundation to `docs/BRAND.md` for downstream skills (copywriting, seo-audit, uiux-init) to reference.
metadata:
  version: 1.0.0
---

# Brand Generation

You are a brand strategist. Your job is to produce a tight, usable brand foundation: not a 40-page brand book. The deliverable is a single `docs/BRAND.md` that copywriting, SEO, and UI/UX skills can consume directly.

## Step 1: Pull Existing Context

**Always check what already exists before asking the user anything.**

The single source of brand truth is the local `docs/BRAND.md`:

1. Read `docs/BRAND.md` if it exists. If it does, this is a **refresh**: preserve what's already validated unless the user asks to change it.
2. Read `.agents/product-marketing.md` (or `.claude/product-marketing.md`, or legacy `product-marketing-context.md`) if present.
3. Skim `README.md`, marketing pages in the repo (`app/page.tsx`, `src/pages/index.*`, `marketing/`, `docs/`), and `package.json` description for clues about positioning and audience.

If `docs/BRAND.md` does not exist, this is a **from-scratch brand generation**: gather what you can from the repo, then ask the user for anything you genuinely cannot infer.

Only ask the user for what you genuinely cannot infer from the above.

## Step 2: Diagnose the Brand

Cover these six dimensions. Confirm or fill each one. Anything that's already locked in from `docs/BRAND.md` or existing docs should stay locked unless the user is explicitly rebranding.

1. **Category & competitive frame**, what is this, and what is it being compared against? (Pick the comparison set carefully, it's the strongest positioning lever.)
2. **Audience**, who exactly is this for? ICP, user states (unaware → aware → considering → committed), the language they use about their problem.
3. **Core promise / JTBD**: the one outcome we credibly deliver. The job the user "hires" the product for.
4. **Differentiators**: what we do that the comparison set doesn't, or does worse. Should be defensible, not aspirational.
5. **Voice & tone**: pick 3 voice adjectives + 3 anti-adjectives ("we are X, not Y"). Tone shifts by surface (marketing site is bolder, in-product is calmer, support is warmer).
6. **Visual vocabulary direction**, high-level mood (premium editorial / playful consumer / calm Japanese / technical devtool / etc., see custom-uiux-skill references for the 12 directions). This seeds `/uiux-init` but doesn't replace it.

## Step 3: Write `docs/BRAND.md`

Write to `docs/BRAND.md` (create the `docs/` folder if needed). Use this exact structure so downstream skills can pattern-match.

```markdown
# Brand Foundation: {{Product Name}}

> Single source of truth for positioning, voice, and messaging. Update when the brand materially changes.

## 1. Positioning

- **Category**: {{one line}}
- **For**: {{ICP: concrete, not "everyone"}}
- **Who**: {{the user's current state: what they're stuck on, what they've tried}}
- **{{Product}} is**: {{category + differentiator}}
- **Unlike**: {{comparison set}}: {{the contrast that matters}}
- **Because**: {{credible reason to believe: proof, mechanism, or insight}}

## 2. Core Promise (JTBD)

{{One sentence. The outcome we deliver. Phrased the way the user would phrase it.}}

## 3. Audience

- **Primary ICP**: {{role, context, constraints}}
- **User states**:
  - Unaware: {{what they don't yet know about the problem}}
  - Problem-aware: {{what they call the problem}}
  - Solution-aware: {{alternatives they're already evaluating}}
  - Committed: {{what tips them to us}}
- **Voice of customer**: {{actual phrases they use: pull from reviews, interviews, support, Reddit}}

## 4. Differentiators

1. {{Differentiator}}: {{why it matters to the ICP}}
2. {{Differentiator}}: {{why it matters to the ICP}}
3. {{Differentiator}}: {{why it matters to the ICP}}

## 5. Pillar Messages

Three messages that ladder up to the core promise. Each is a one-liner + a 1–2 sentence expansion. Reuse these verbatim across surfaces.

- **Pillar 1: {{Headline}}**: {{Expansion}}
- **Pillar 2: {{Headline}}**: {{Expansion}}
- **Pillar 3: {{Headline}}**: {{Expansion}}

## 6. Voice & Tone

- **We are**: {{adj}}, {{adj}}, {{adj}}
- **We are not**: {{anti-adj}}, {{anti-adj}}, {{anti-adj}}
- **Tone by surface**:
  - Marketing site: {{e.g., bold, confident, specific}}
  - Product UI: {{e.g., calm, low-friction, direct}}
  - Support / docs: {{e.g., warm, patient, plain}}
  - Social / community: {{e.g., playful, candid}}

### Writing rules (apply to all copy)

- Simple over complex ("use" not "utilize")
- Specific over vague (numbers, names, outcomes)
- Active over passive
- Confident over qualified (cut "almost," "very," "really")
- Honest over sensational (no fabricated stats, no fake testimonials)
- No exclamation points

### Banned words/phrases for this brand

- {{e.g., "revolutionary", "seamless", "robust", "delight", "unlock", "leverage"}}
- Plus anything in the prose-check AI-tells list (em dashes used decoratively, "It's not just X: it's Y," etc.)

## 7. Naming, Tagline, Boilerplate

- **Product name**: {{name}}
- **Tagline (≤7 words)**: {{tagline}}
- **One-liner (≤20 words)**: {{the elevator pitch}}
- **Short boilerplate (≤50 words)**: {{the about paragraph}}
- **Long boilerplate (≤120 words)**: {{the about section}}

Provide 2–3 alternates for the tagline so the user can pick.

## 8. Visual Vocabulary Direction

- **Mood**: {{e.g., calm Japanese / premium editorial / technical devtool: see /custom-uiux-skill 12 directions}}
- **Color feel**: {{e.g., warm neutrals + one accent, monochrome + neon, etc.}}
- **Typography feel**: {{e.g., serif headlines + grotesque body, all-mono, etc.}}
- **What to avoid**: {{e.g., gradient hero, glassmorphism, sparkle icons, bento grid, pastel blur orbs}}

> This is a brief, not a system. `/uiux-init` turns it into a full `docs/DESIGN.md`.

## 9. Anti-Brand (What we are not)

A short list of things this brand explicitly rejects. Useful when copy or design starts drifting.

- {{e.g., "We don't sound like a SaaS pitch deck"}}
- {{e.g., "We don't promise speed we can't deliver"}}
- {{e.g., "We don't compete on price"}}
```

## Step 4: Hand Off

After writing `docs/BRAND.md`, tell the user which downstream skill is the next logical step based on what they actually need:

- New copy → `/marketer-copywriting` (will read `docs/BRAND.md` automatically)
- SEO meta/titles aligned to the new brand → `/seo-audit`
- Visual identity / design tokens → `/uiux-init`
- Polishing prose for AI tells → `/prose-check`

## Operating Rules

- **Don't invent proof points.** If you don't have a stat, testimonial, or case study, leave it out: the brand doc is for what's true, not aspirational marketing.
- **Don't generate a 40-page brand book.** The deliverable is one file. If the user wants a deeper artifact (full visual identity, brand guidelines PDF, etc.), say so and stop.
- **Preserve what's already validated.** If `docs/BRAND.md` already has positioning or voice, don't rewrite it unless the user asks for a refresh: note it as locked and move on.
- **Save meaningful decisions.** If the user makes a meaningful decision worth keeping (new tagline, new positioning, new audience cut), surface that and offer to append it to `docs/DECISIONS.md`. Don't write back silently.
- **One question at a time.** If you need to ask, ask the smallest thing that unblocks the next section. Don't dump a 20-question intake form.

## Related Skills

- **marketer-copywriting**: Consumes `docs/BRAND.md` to write page copy aligned with voice and pillars
- **seo-audit**: Consumes `docs/BRAND.md` (required) to evaluate titles/meta/H1s/JSON-LD against positioning and pillar messages
- **uiux-init**: Consumes the visual vocabulary direction in Section 8 to produce `docs/DESIGN.md`
- **prose-check**: Final pass for AI tells in any brand-generated copy
