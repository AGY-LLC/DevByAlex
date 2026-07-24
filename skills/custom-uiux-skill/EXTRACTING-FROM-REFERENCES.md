# Extracting from large reference repos

This skill was inspired by the *structure* of large UI/UX skill packs
(catalogs of references, style routers, page overrides, checklists,
slash-command workflows). It is **not** a fork or copy of any of them.

If you're tempted to pull more material from a large UI/UX skill repo
(public or private), this file lays out what's safe to extract and what
isn't.

## What to extract

These are structural / conceptual ideas worth borrowing:

- **Design-data / model ideas**: the *shape* of how reference
  directions are described (when to use, when not to use, layout,
  color, type, motion). This skill's 13-section reference template is
  one example.
- **Style catalogs**: the idea of having multiple named directions
  the AI can route between. Borrow the *concept*; write your own
  contents.
- **Color palette concepts**: the idea of layered surfaces, semantic
  functional colors, dark-mode discipline, and accent-as-signature.
  Borrow the rules; pick your own values.
- **Typography pairing concepts**: the idea of two-family stacks,
  contrast pairings, and per-direction leans. Borrow the structure;
  pick your own pairings.
- **UX guideline structure**: accessibility, responsive, mobile-
  interaction, visual-quality, forms, navigation, performance,
  release checklists. Borrow the categories; write your own items.
- **Product / page pattern structure**: the format of "page job →
  primary action → divergences → scope → anti-patterns" for page
  overrides.
- **Checklist structure**: bulleted, scannable, severity-aware,
  with "common misses" sections.
- **Agent workflow structure**: read brief → diagnose → pick refs →
  load tokens → generate → checklists → AI-UI detector → final QA.
- **Slash-command structure**: purpose / when to use / inputs / files
  to read / steps / output format / safety / example.
- **Design-system generation ideas**: the idea of extracting from
  screenshots or code, clustering near-duplicates, snapping to a base
  grid, mapping semantic colors.
- **Page override ideas**: keeping overrides small, scoped, and
  documented.

The pattern: borrow the *organizational scaffolding*, not the contents.

## What NOT to extract

These are explicitly out of scope and unsafe to copy:

- **Do not execute scripts blindly.** No `install.sh`, `setup.py`,
  postinstall hooks, or random one-liners from a README.
- **Do not install the CLI blindly.** Even reputable looking CLIs
  can run arbitrary code on your machine and write to your
  filesystem.
- **Do not copy the implementation wholesale.** Borrowing structure is
  fine; copy-pasting files is not.
- **Do not depend on external package behavior.** This skill is
  Markdown-only on purpose. Adding a CLI or package dependency
  recreates the supply-chain risk we are avoiding.
- **Do not copy designs or copyrighted media.** Screenshots, logos,
  illustration assets, color palettes lifted pixel-for-pixel from
  named products, fonts the source repo redistributes. All of these
  are either copyrighted, trademarked, or both. Reference the
  *category* (independent magazine, indie iOS app, modern fintech
  console), not the brand.
- **Do not treat GitHub stars as a trust signal.** A repo with 10k
  stars can still be malicious, abandoned, or unmaintained. Evaluate
  it on its actual contents.
- **Do not let one aesthetic override product-specific design needs.**
  Many reference repos quietly embed one taste (modern SaaS with
  gradient blob hero) into "neutral" templates. The style router
  exists precisely to fight this.
- **Do not create scattered top-level slash commands** if `/uiux:*`
  namespacing is possible. `/critique-ui` floating in the global
  command space ages badly.

## A safe extraction process

If you find a reference repo you want to learn from:

1. **Read its README and SKILL/agent docs only.** Do not clone, do not
   install, do not run anything.
2. **Identify the structural ideas** (catalog format, checklist
   categories, workflow steps).
3. **Write down the ideas in your own words.** No copy-paste.
4. **Apply them to your own contents.** Your reference directions,
   your tokens, your checklists.
5. **Cite the inspiration in your own README.** "Inspired by the
   structure of <kind of resource>" is the right framing, not
   "based on <project-name>'s implementation."

## Why this matters

The dominant failure mode of AI-generated UI is "blend everything into
one generic SaaS template." The second dominant failure mode is "copy
a popular library wholesale and inherit its taste." Both produce work
that's forgettable at best and infringes at worst.

This skill is structurally generous (lots of references, lots of
checklists) precisely so the AI is never reaching into a single
aesthetic bucket. Keep that property when you extend.
