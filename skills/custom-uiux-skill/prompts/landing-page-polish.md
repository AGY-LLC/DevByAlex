# Prompt: landing-page-polish

A landing page is the highest-leverage UI in most products. This prompt
polishes it to feel deliberate and on-brand, without slipping into the
default SaaS template.

## Inputs

- The landing page source (HTML/JSX/etc.).
- The style choice block.
- The brand adjectives + "avoid" list from the brief.

## Behavior

1. Read the page top to bottom. Write down its current sections in
   order.
2. For each section, ask:
   - What is this section's *one* job?
   - Is the job clear in 3 seconds?
   - Is this section necessary, or is it template inertia?
3. Identify and remove template inertia. Common offenders:
   - Generic centered hero with three CTAs.
   - "Trusted by" logo strip pasted high.
   - Bento grid of feature cards.
   - Animated number counters.
   - Stock testimonials in identical card format.
   - A pricing table that looks like every other pricing table.
4. Rewrite the page section-by-section using the chosen reference
   patterns. The hero, in particular, must reflect the *primary*
   reference, not "modern SaaS default."
5. Tighten the copy to fit the brand voice. Replace "Modern, clean,
   beautiful" with concrete language.
6. Verify performance: hero image weight, font loading, CLS, LCP.
7. Run `prompts/generic-ai-ui-detector.md` on the result.

## Output format

1. A "before / after" section list: what stayed, what changed, what
   was deleted, what was added.
2. The new code.
3. Performance notes (asset weights, LCP element, font-loading
   strategy).
4. The standard design notes block from `prompts/generate-new-screen.md`.

## Safety / quality checks

- Do not delete legal / required content (privacy link, accessibility
  statement, compliance notes). Move them, don't remove them.
- Do not add a video hero unless the brief asks for one; they're
  expensive in performance and rarely improve conversion.
- Do not slip a gradient sparkle hero in.
- The primary CTA must be a single, obviously primary affordance. If
  there are 3, you have no CTA.
- Mobile first: read the page in 375px width before finalizing.

## Example invocation

> "Use prompts/landing-page-polish.md on src/app/(marketing)/page.tsx.
> The product is the AI notes app. The current hero feels like a Vercel
> template."
