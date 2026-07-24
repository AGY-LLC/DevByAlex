# Project brief template

Fill this out before generating any UI. If you don't have an answer for a
field, write `unknown` rather than skipping it: `unknown` tells the AI to
ask. Empty fields tell the AI to invent, which is how you get generic UI.

Copy this template into your project as `docs/UIUX-BRIEF.md` (or wherever
your team keeps design docs).

---

## 1. App name

```
<app name, no marketing copy>
```

## 2. Product category

Pick one dominant: content / workflow / social / commerce / data /
creation / utility / education / wellness / entertainment / infrastructure.
You may add a secondary in parentheses.

```
<category, e.g. "creation (workflow)">
```

## 3. Target users

Describe in plain language. Include role, technical literacy, age range,
typical device, and whether use is voluntary or required.

```
<who they are, what they do, where they use it>
```

## 4. Main user goals

The top 3 things a user comes to this product to accomplish, ranked.

```
1.
2.
3.
```

## 5. Business goal

The thing the *business* wants the user to do (sign up, subscribe, return,
share, complete a task, buy, etc.). One sentence.

```
<one sentence>
```

## 6. Platform

Pick one: web / mobile (iOS) / mobile (Android) / mobile (cross-platform) /
desktop / responsive equal / mobile-first responsive / desktop-first
responsive.

```
<platform>
```

## 7. Existing stack

Framework, UI library, design system if any, deployment target.

```
<e.g. Next.js + Tailwind + shadcn/ui, Vercel>
```

## 8. Brand adjectives

3–5 short adjectives. No "modern" or "clean": those are not brand
adjectives, they are aspirations.

```
<adjective 1>, <adjective 2>, <adjective 3>
```

## 9. Things to avoid

3–7 things this product must not look like. Be specific.

```
- no sparkle / AI gradient backgrounds
- no centered-hero "for [audience], by [team]" SaaS template
- no bento grid feature blocks
- ...
```

## 10. Competitors or inspiration categories

Real products in adjacent space (for context, not to copy) and visual
*categories* you like.

```
Competitors:
- <product>: what it gets right
- <product>: what it gets wrong

Inspiration categories:
- <e.g. independent magazines>
- <e.g. Japanese stationery brands>
- <e.g. terminal aesthetics>
```

## 11. Preferred interaction model

Touch-first, keyboard-first, mouse-first, voice/agent-first, or a
specific mix.

```
<e.g. "keyboard-first on desktop, touch on mobile">
```

## 12. Visual density

low / medium / high. Match this honestly to the task: a power tool with
"low" density will feel toy-like.

```
<density>
```

## 13. Accessibility requirements

Pick the floor (WCAG AA is the assumed minimum). Note any specifics:
contrast above AA, motion-reduced mode required, screen-reader audited,
high-contrast palette toggle, regulatory needs (Section 508, ADA).

```
<requirements>
```

## 14. Existing design system, if any

URL or path to tokens, components, brand guide. If none, write `none`
and the skill will generate one.

```
<path or "none">
```

## 15. Page / screen being worked on

Single page or list of pages in scope for this pass.

```
- <screen 1>
- <screen 2>
```

## 16. Current UI problems

What is broken or off about the current UI? Write as observations, not
solutions. "Hero feels generic" is good. "Replace hero with a video" is
not: that's a fix.

```
- 
- 
- 
```

## 17. Desired outcome

What does success look like after this pass? Be concrete. "Users
understand what the product does in 5 seconds" is good. "Make it pop" is
not.

```
- 
- 
- 
```

---

## Optional sections

These are not required but help the router and downstream prompts.

### 18. Known constraints

Performance budget, asset limits, locked tokens, regulatory or legal
copy, partner integrations that dictate layout.

### 19. Out of scope

Features, surfaces, or pages explicitly excluded from this design pass.

### 20. Reference assets the user is providing

Mocks, screenshots, brand guide PDFs, color palettes, fonts already
licensed. List paths.
