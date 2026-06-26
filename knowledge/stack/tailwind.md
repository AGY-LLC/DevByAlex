---
id: stack-tailwind
title: "Tailwind CSS"
summary: "The utility-first CSS framework I use on nearly every web project. I was skeptical at first. I'm a convert."
tags: ["stack", "tailwind"]
updated: 2026-05-28
---
# Tailwind CSS

The utility-first CSS framework I use on nearly every web project. I was skeptical at first. I'm a convert.

---

## Pros

- Constraints make design faster — you're not inventing a spacing system every project
- Colocated styles with components is genuinely better than jumping between CSS files once you're used to it
- Excellent purging means production bundles are small
- Dark mode support is clean
- The config file is easy enough to extend for custom brand tokens
- `@apply` exists as an escape valve when you need it
- Great IDE integration with the official VS Code plugin

## Cons

- Long class strings are visually noisy — you adapt, but it's real
- Complex responsive + state variants (`md:hover:focus:...`) can get unwieldy
- Not ideal for highly custom design systems that deviate heavily from the defaults — you end up fighting the config
- Can make component extraction feel awkward (should I use `@apply`, extract a component, or live with the repetition?)
- Overrides and specificity can still cause pain in larger codebases with third-party UI libraries

## When I'd use it again

- Any React/Next.js project
- Projects with a small team where there's no dedicated CSS-heavy design system
- When I want to move fast and not think about CSS architecture

## When I'd avoid it

- Projects with a pre-existing CSS architecture that works well
- Teams where designers control the CSS and Tailwind is unfamiliar territory
- When you need truly custom, highly specific animations that fight utility patterns

## Alternatives

- **CSS Modules** — good option, especially in larger teams. More explicit, more verbose.
- **styled-components / Emotion** — CSS-in-JS, works but bundle size and runtime overhead have pushed me away
- **shadcn/ui** — I use this *with* Tailwind, not instead of it. It's a component layer on top.

## Current stance

**Default for styling.** I use it with shadcn/ui for component primitives on most new projects.

---

## Rules

- Extend Tailwind config with project brand tokens before writing custom inline styles
- Don't use arbitrary values (`w-[327px]`) unless truly necessary — it usually means rethinking the layout
- Use `cn()` (clsx + tailwind-merge) for conditional class concatenation. Don't string-concat class names.

## Preferences

- Keep component files: styles colocated, not extracted to separate CSS files
- Use `@layer components` sparingly — mostly for recurring patterns that don't justify a full component
- Extract components before reaching for `@apply` — the component is usually the right abstraction level

## AI notes

AI generates Tailwind class strings well. It sometimes uses deprecated class names from older versions (Tailwind v2 vs v3 changes, v4 changes). Specify the version.

Good for: generating responsive layout scaffolds, dark mode patterns, generating class strings for common UI elements.

Watch for: AI that invents class names that don't exist (`text-gray-350`), outdated `transition` utilities, incorrect arbitrary value syntax.
