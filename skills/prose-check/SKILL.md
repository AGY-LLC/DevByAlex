---
name: prose-check
description: >-
  Strip AI tells from any user-facing prose: including strings written
  directly in code (UI labels, button text, empty states, error messages,
  validation messages, toast/snackbar copy, modal titles and bodies,
  tooltips, in-app help, onboarding text, JSDoc/docstrings shown to users)
  as well as repo docs (README, CHANGELOG, release notes, CONTRIBUTING,
  docs/) and marketing surfaces. Flags throat-clearing openers, binary
  contrasts, dramatic fragmentation, false agency, passive voice, em dashes,
  vague declaratives, and adverb crutches. Treats prose quality as a coding
  workflow concern: fires on diffs that touch i18n message catalogs
  (messages.json, locales/, i18n/, en.ts), `<Button>` labels, `toast.*()`
  calls, `throw new Error("...")`, zod/yup error messages, empty-state
  components, `<Trans>`/`t("...")` keys, README/CHANGELOG edits, and any
  hardcoded human-facing string literal. Composes with /uiux-audit (when UI
  text needs cleanup) and /seo-audit (when on-page titles/descriptions are
  flagged).
---

# Prose check

Eliminate predictable AI writing patterns from prose. Adapted from
[hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) (MIT).

## Scope: Code Strings First, Docs Second

This skill treats prose as a coding workflow concern. The primary target is
**user-facing string literals living inside the codebase**, not just standalone
marketing pages:

- **UI strings**: button labels, link text, headings, section titles, form
  labels, placeholder text, helper text, empty states, loading states,
  modal/dialog titles and bodies, tooltips, snackbars/toasts, banners
- **Errors and validation**: `throw new Error("...")`, zod/yup/joi messages,
  form-validation copy, API error response messages exposed to users,
  `console.error` strings that bubble into Sentry breadcrumbs the user sees
- **i18n catalogs**: `messages.json`, `locales/en.json`, `i18n/en.ts`,
  `<Trans>` defaults, `t("key", { defaultMessage: "..." })`
- **Onboarding / in-product copy**: walkthroughs, tooltips, "what's new"
  panes, in-app announcements
- **Repo docs that ship to humans**: README, CHANGELOG, release notes,
  CONTRIBUTING, anything under `docs/` that's not pure reference
- **Marketing surfaces**: landing pages, pricing pages, blog posts,
  emails: still in scope, just one of many

**Skip for:**
- API reference docs (parameter tables, type signatures, machine-readable
  reference material)
- Inline code comments meant for other developers (`// TODO`, `// HACK
  around X`: different audience, different conventions)
- Log messages and observability output (`logger.info(...)`): these need
  to be parsable, not pretty
- Commit messages (those have their own conventions: see
  `marketer-copywriting`/repo style guide)
- Test names and assertion messages (signal-to-developer, not user-facing)

## When to invoke

- User asks to edit, polish, tighten, de-slop, or "make this not sound like AI"
- User is shipping any string a human user will read: including small
  ones (a single button label, a single error message, a single toast)
- After `/uiux-audit` or `/uiux-redesign` introduces new UI copy
- After `/seo-audit` surfaces weak titles, meta descriptions, or H1s
- Before merging a PR that adds user-facing strings (treat this like a
  lint pass)
- On README / CHANGELOG / release notes drafts before publishing

## Core rules

1. **Cut filler phrases.** Remove throat-clearing openers, emphasis crutches,
   business jargon, and adverbs. See [references/phrases.md](references/phrases.md).

2. **Break formulaic structures.** Avoid binary contrasts ("not X, it's Y"),
   negative listings, dramatic fragmentation, rhetorical setups, false
   agency. See [references/structures.md](references/structures.md).

3. **Use active voice.** Every sentence needs a human subject doing
   something. No passive constructions. No inanimate objects performing
   human actions ("the complaint becomes a fix" → name who fixed it).

4. **Be specific.** No vague declaratives ("The reasons are structural").
   Name the specific thing. No lazy extremes ("every," "always," "never")
   doing vague work.

5. **Put the reader in the room.** No narrator-from-a-distance voice.
   "You" beats "People." Specifics beat abstractions.

6. **Vary rhythm.** Mix sentence lengths. Two items beat three. End
   paragraphs differently. Em dashes are banned. Rewrite with commas,
   periods, colons, parentheses, or separate sentences. Never substitute a
   spaced hyphen between clauses.

7. **Trust readers.** State facts directly. Skip softening, justification,
   hand-holding.

8. **Cut quotables.** If it sounds like a pull-quote, rewrite it.

## Workflow

### Mode A: Prose blocks (README sections, blog posts, release notes, landing copy)

1. **Read the prose end to end** to absorb voice and intent.
2. **Sweep against phrases.md**: flag every banned phrase and adverb.
3. **Sweep against structures.md**: flag every binary contrast, fragment,
   passive construction, Wh- opener, em dash, and spaced hyphen used as an
   em-dash substitute.
4. **Rewrite, don't excuse.** Replace each flagged span with the direct
   form. Don't leave a comment saying "consider rewriting."
5. **Enforce the dash ban.** Run `rg -n --pcre2 '\x{2014}' <scope>` and require
   zero matches. Review `rg -n ' - ' <scope>` manually and rewrite every
   spaced hyphen that joins clauses or introduces an aside. Keep legitimate
   technical uses such as command syntax and data formats.
6. **Score the result** (see below). If under 35/50, revise again.
7. **Report:** show before/after for non-trivial rewrites; list every
   banned phrase removed; deliver final score.

### Mode B: Code strings (UI labels, errors, validation, toasts, i18n catalogs)

Short strings can't carry rhythm or paragraph structure, so the rule set
collapses to a tighter checklist. Apply *all* of these and skip scoring,
these strings either pass or get rewritten.

1. **Find the strings.** Grep the diff or the path the user pointed at for:
   - JSX text nodes and prop values that hold human text (`<Button>...</Button>`,
     `label="..."`, `placeholder="..."`, `title="..."`, `aria-label="..."`)
   - Error throws (`throw new Error("...")`, `throw new TRPCError({ message: "..." })`)
   - Toast/snackbar calls (`toast.success(...)`, `toast.error(...)`, `Snackbar`)
   - Validation messages (zod `.message("...")`, yup `.required("...")`, react-hook-form rules)
   - i18n catalog values (`en.json`, `messages.json`, `locales/en.ts`, `<Trans>` defaults)
   - Empty / loading / error state copy in dedicated components
2. **Apply the string-tier rules:**
   - **One job per string.** A button says what it does. An error says what
     went wrong. A toast confirms the result. No editorializing.
   - **No throat-clearing.** Strip "Oops!", "Sorry,", "Looks like", "It seems",
     "Unfortunately", "Just": they delay the actual message.
   - **No filler adverbs.** "Successfully saved" → "Saved". "Please try again" →
     "Try again". "Currently loading" → "Loading".
   - **Active voice with a clear subject.** Prefer "We couldn't reach the
     server" over "The server could not be reached". For inanimate UI text
     where "we" is wrong, name the actual subject ("Payment failed") instead
     of passive ("Payment could not be processed").
   - **Specific, not vague.** "Something went wrong" → name the something
     ("Couldn't load orders"). "Invalid input" → name what's invalid
     ("Email is required").
   - **No em dashes in micro-copy.** Buttons, labels, errors, and toasts
     must not contain them. A spaced hyphen is not an acceptable substitute.
     Rewrite with a period, colon, comma, parentheses, or separate sentences.
   - **No exclamation marks unless the brand voice explicitly allows them.**
     Default-off; check `docs/BRAND.md` voice adjectives.
   - **Sentence case for UI text** unless the design system uses title case.
     Match the project's existing convention: don't introduce a new one.
   - **No trailing periods on single-sentence button labels, headings, or
     menu items.** Periods on full-sentence body copy and tooltips are fine.
   - **Interpolation safety.** `"Hello, ${name}!"` where `name` could be empty
     produces "Hello, !": flag and suggest a default or guard. (Overlaps with
     `launch-readiness` copy-quality pass: note overlap, don't duplicate.)
   - **i18n keys describe purpose, not text.** `"errors.networkUnavailable"`
     beats `"errors.somethingWentWrong"`. Flag keys that lock English wording.
3. **Cross-check against `docs/BRAND.md` if it exists.** Voice adjectives and
   anti-adjectives apply to the smallest strings, not just landing copy. A
   "Get started 🚀" CTA on a brand that has "calm" / "not exclamatory" voice
   is a finding.
4. **Rewrite in place.** For UI strings, deliver the replacement as a unified
   diff or `Edit` call: these go straight into code, not into a "prose
   report".
5. **Report briefly**: for code-string mode, the output is the diff plus a
   one-line rationale per change. Skip the 5-dimension score; it doesn't
   apply to micro-copy.

## Quick checks (before delivery)

- Any adverbs? Kill them.
- Any passive voice? Find the actor, make them the subject.
- Inanimate thing doing a human verb ("the decision emerges")? Name the person.
- Sentence starts with What/When/Where/Which/Who/Why/How? Restructure.
- Any "here's what/this/that" throat-clearing? Cut to the point.
- Any "not X, it's Y" contrasts? State Y directly.
- Three consecutive sentences match length? Break one.
- Paragraph ends with punchy one-liner? Vary it.
- Em dash anywhere? Rewrite the sentence to remove it.
- Spaced hyphen joining clauses? Rewrite it. Do not use a hyphen as a
  typographic substitute.
- Vague declarative ("The implications are significant")? Name the implication.
- Narrator-from-a-distance ("Nobody designed this")? Put the reader in the scene.
- Meta-joiners ("The rest of this essay...")? Delete. Let the essay move.

## Scoring

Rate 1-10 on each dimension:

| Dimension    | Question                              |
|--------------|---------------------------------------|
| Directness   | Statements or announcements?          |
| Rhythm       | Varied or metronomic?                 |
| Trust        | Respects reader intelligence?         |
| Authenticity | Sounds human?                         |
| Density      | Anything cuttable?                    |

Below 35/50: revise again before delivering.

## Output format

When invoked on existing prose, return:

```
## Edits

[for each non-trivial rewrite]
- BEFORE: <original span>
  AFTER:  <rewritten span>
  WHY:    <rule violated: e.g. "binary contrast", "passive voice", "adverb">

## Removed
- <phrase 1>
- <phrase 2>
...

## Final prose
<the cleaned text, ready to paste>

## Score
Directness: x/10
Rhythm: x/10
Trust: x/10
Authenticity: x/10
Density: x/10
Total: xx/50: [ship | revise]
```

## Examples

See [references/examples.md](references/examples.md) for before/after
transformations.
