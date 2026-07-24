# Prompt: generic-ai-ui-detector

Scans a UI for signs that it was autocompleted from common AI defaults.
A single tell is a yellow flag. Two or more, and it reads as generic
output and must be redesigned.

## The tells

Group A: visual defaults

1. **Sparkle / wand / glitter icons** used to signal "AI."
2. **Rainbow / iridescent gradients** on the hero or AI features.
3. **Glassmorphism** (blurred translucent panels with thin borders) as
   a default surface.
4. **`rounded-2xl` on every element**: buttons, cards, inputs, modals
   all wearing the same radius.
5. **Pastel "blur orb" backgrounds** behind the hero.
6. **Sparkle confetti** on completion of any action.
7. **Faux "glow" rings** around primary CTAs.

Group B: layout defaults

8. **Centered hero with three CTAs** ("Primary", "Watch demo",
   "See pricing").
9. **3-up bento grid of feature cards.**
10. **"Trusted by" logo strip** stuck immediately under the hero.
11. **Pricing tables that look like every other pricing table** (3
    plans, "most popular" middle, identical card height).
12. **"How it works" 3-step strip** with a numbered icon, headline,
    one-sentence description.
13. **Identical animated number counters** ("10k+ users, 99.9% uptime")
    in the hero.
14. **Carousel of "we shipped these features this month" cards.**

Group C: copy & content defaults

15. **"Modern, clean, intuitive"** as adjectives the product uses about
    itself.
16. **"Built for [audience]"** "**by [team]**" boilerplate.
17. **Headline that names a feature instead of a value** (e.g. "AI-
    powered task management for teams").
18. **Microcopy that overuses 🚀 ✨ 💡 emojis** as bullet markers.
19. **AI-narrator first person** in product UI ("I've drafted this for
    you…").
20. **"As seen in" press logo strip** with logos the product hasn't
    actually appeared in.

Group D: interaction defaults

21. **Hover-only critical information.**
22. **Spinner where a skeleton should be.**
23. **Modal-on-modal stacks** for any non-destructive action.
24. **Auto-playing video / audio hero.**
25. **"Are you sure you want to leave?" interstitials** trying to keep
    users on the page.

## Behavior

1. Walk the screen. For each tell on the list, mark **present /
   absent / partial**.
2. If two or more are present in the same view, flag the screen as
   "reads as generic AI output."
3. For each present tell, propose a *specific* replacement grounded in
   the chosen primary reference's component patterns. Not "be more
   creative": concrete, in-context.

## Output format

```
SCREEN:                 <name or file path>
TELLS PRESENT:          <count>
DETAILS:
  - <tell #>: <evidence (file/line or region)>
       replacement: <concrete idea>
OVERALL:                <pass | borderline | reads as generic>
```

## Safety / quality checks

- A tell is not automatically wrong; context matters. A trusted-by
  logo strip can be fine if real and *placed thoughtfully*. The
  detector is a flag, not a verdict.
- Always cite where you saw the tell.
- Replacements must respect the chosen references; don't trade one
  generic for another.

## Example invocation

> "Use prompts/generic-ai-ui-detector.md on src/app/(marketing)/page.tsx.
> Style basis: editorial + creative studio."
