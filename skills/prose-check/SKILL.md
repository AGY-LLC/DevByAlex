---
name: prose-check
description: >-
  Improve user-facing prose while preserving the writer's voice and aligning
  every edit with the product's established brand. Use for UI copy, errors,
  validation messages, onboarding, marketing pages, emails, README files,
  release notes, and other prose that ships to people when the user asks to
  polish, tighten, de-slop, make copy sound human, or check brand fit. Read
  docs/BRAND.md when present and treat its voice, tone, audience, vocabulary,
  and examples as the primary standard. Flag em dashes, unclear or repetitive
  writing, formulaic AI patterns, and copy that conflicts with the brand.
  Do not shorten prose by default or mechanically ban adverbs, passive voice,
  rhetorical questions, fragments, softening, or other normal human choices.
---

# Prose check

Improve the prose without sanding off its personality.

The goal is not maximum brevity or generic "clean" writing. The goal is copy
that sounds like this product, suits the moment, and reads as if a thoughtful
person wrote it.

## Authority

Resolve style decisions in this order:

1. Follow the user's explicit direction for the current task.
2. Read `docs/BRAND.md` when it exists. Treat its voice, tone, audience,
   vocabulary, and examples as the source of truth.
3. Match strong, established copy on the same product surface.
4. Adapt to the audience and the job of the text.
5. Use the general heuristics in this skill only when the sources above do not
   answer the question.

Do not use a generic heuristic to overrule the brand. If the brand is warm,
playful, patient, literary, technical, exuberant, or deliberately formal,
preserve those qualities.

If `docs/BRAND.md` is missing or too vague, inspect nearby approved copy and
state the voice you inferred before making broad changes. Do not invent a new
brand voice during a prose pass.

## Non-negotiable principles

- **Preserve voice.** Keep the writer's point of view, warmth, cadence, humor,
  and level of formality unless they conflict with the brand or the user's
  direction.
- **Edit for a reason.** Change text only when the revision improves brand fit,
  clarity, accuracy, rhythm, or usefulness. "Shorter" is not enough.
- **Prefer the smallest effective edit.** Do not rewrite a passage merely
  because another version is possible.
- **Keep natural variation.** Human prose uses short and long sentences,
  fragments, questions, asides, hedges, repetition, passive voice, and
  occasional adverbs. Judge each choice in context.
- **Protect meaning.** Do not remove qualifications, emotional nuance,
  reassurance, or necessary explanation to increase directness.
- **Keep em dashes out.** Rewrite em dashes with punctuation or sentence
  structure that preserves the original rhythm. Never substitute a spaced
  hyphen between clauses.

## Scope

Review:

- UI labels, headings, helper text, empty states, loading states, dialogs,
  tooltips, snackbars, banners, and onboarding
- User-visible errors and validation messages
- i18n message values and default copy
- Marketing pages, pricing pages, blog posts, and emails
- README files, changelogs, release notes, and human-facing documentation

Skip:

- API reference tables and machine-readable documentation
- Internal code comments
- Logs and observability output
- Test names and assertion messages
- Commit messages

## Review method

### 1. Establish the voice

Read the relevant brand guidance and surrounding copy before editing. Write a
brief internal voice brief using concrete traits, such as:

- warm and encouraging, never chirpy
- expert but conversational
- playful in celebrations, calm in errors
- concise in controls, patient in onboarding

Avoid empty labels such as "authentic" or "engaging" unless the brand defines
what they mean.

### 2. Identify real problems

Flag a phrase or structure when at least one of these is true:

- It conflicts with the brand brief.
- It obscures the meaning or the next action.
- It repeats often enough to sound templated.
- It makes a claim vaguer, stronger, or less accurate than the evidence.
- It creates an unintended tone, such as coldness, hype, condescension, or
  false intimacy.
- It contains an em dash.

Treat the items in
[references/phrases.md](references/phrases.md) and
[references/structures.md](references/structures.md) as review signals, not
automatic violations. A single adverb, passive sentence, rhetorical question,
fragment, three-item list, or conversational opener can be exactly right.

### 3. Revise in context

Preserve as much of the original as possible. Read the revised paragraph or UI
flow aloud. Check whether it still has breath, warmth, and varied rhythm.

Do not:

- compress an explanation until it sounds like a command
- turn every sentence into subject-verb-object form
- replace a friendly transition with an abrupt statement
- remove reassurance from stressful or high-stakes moments
- force "you" into copy where it creates fake intimacy or blame
- remove a useful hedge that expresses real uncertainty
- replace distinctive language with generic SaaS copy

### 4. Check the surface

Apply different expectations to different jobs:

- **Controls:** Make the action easy to predict. Brevity usually helps.
- **Errors and validation:** Say what happened and what the person can do.
  Keep reassurance when the brand or situation calls for it.
- **Onboarding and help:** Optimize for confidence and comprehension, not the
  fewest words.
- **Marketing and editorial:** Preserve narrative rhythm, personality, and
  emotional range. Repetition or fragments may be intentional.
- **Technical docs:** Favor precision and useful transitions. Passive voice is
  acceptable when the actor is unknown or irrelevant.

### 5. Enforce the dash check

Run:

```bash
rg -n --pcre2 '\x{2014}' <scope>
```

Require zero prose matches. Review `rg -n ' - ' <scope>` manually for spaced
hyphens used as clause separators. Keep legitimate technical syntax and data
formats.

## Code strings

For short UI strings, skip prose scoring and check the string in its full UI
state:

- A control accurately predicts its action.
- An error names the problem when known and offers a useful next step.
- A success message confirms what changed.
- Tone matches the emotional context and `docs/BRAND.md`.
- Sentence case, punctuation, and terminology match the product.
- Interpolation remains grammatical when values are empty or unusual.
- i18n keys describe purpose rather than locking in the English wording.
- No em dash appears.

Do not automatically remove "please," "sorry," "just," exclamation marks, or
other conversational language. Keep or revise them based on brand fit, context,
and repetition.

## Final evaluation

Rate prose blocks from 1 to 10 on:

| Dimension          | Question |
|--------------------|----------|
| Brand fit          | Does this sound unmistakably consistent with the stated brand? |
| Clarity            | Can the intended reader understand the meaning and next step? |
| Voice preservation | Did the edit retain the writer's warmth, personality, and intent? |
| Rhythm             | Does the prose have natural movement and sentence variety? |
| Context fit        | Is the tone right for this surface and emotional moment? |

Do not ship a rewrite with voice preservation below 8. Restore the original
language and make smaller edits.

## Output

For prose blocks, return:

```markdown
## Brand basis
<The brand guidance and nearby examples used for the edit>

## Edits
- BEFORE: <original span>
  AFTER:  <revised span>
  WHY:    <specific brand, clarity, rhythm, or context reason>

## Final prose
<The revised text, ready to paste>

## Evaluation
Brand fit: x/10
Clarity: x/10
Voice preservation: x/10
Rhythm: x/10
Context fit: x/10
```

Do not list unchanged "banned phrases." Mention passages deliberately kept when
they might look unusual but fit the brand.

For code strings, return the diff and one short rationale per meaningful
change. Prefer no edit over a neutral rewrite that loses character.

See [references/examples.md](references/examples.md) for context-sensitive
examples.
