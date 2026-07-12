---
id: design-universal-rules
title: "Universal UI/UX Design Rules"
summary: "Timeless design principles that apply regardless of visual style, branding, platform, or theme: 31 rules plus the pre-ship Universal Checklist. Every design decision, sweep, and critique in the workflow holds these; the named style (PRIMARY × SECONDARY) colors them, never overrides them."
tags: ["design", "uiux", "principles", "checklist", "universal"]
updated: 2026-07-11
---
# Universal UI/UX Design Rules

*A collection of timeless design principles that apply regardless of visual
style, branding, platform, or theme.*

> **How the workflow uses this file.** These rules are style-independent and
> non-negotiable: `/plan-design` commits a style *on top of* them,
> `/plan-wireframes` frames to them, builders build to them, and the
> **design-critic** agent judges every screenshot against the Universal
> Checklist at the bottom before a design change may be marked done. A style
> choice never licenses breaking a universal rule.

## 1. Clarity Above Everything

The user should never have to guess.

Every screen should answer:

- Where am I?
- What can I do?
- What happens if I tap this?
- What should I do next?

If something requires explanation, redesign it first.

## 2. Visual Hierarchy

Users don't read. They scan.

Create obvious hierarchy through:

- Size
- Weight
- Color
- Position
- Contrast
- Spacing

The eye should naturally know what to look at first.

## 3. One Primary Action

Every screen should have a clear primary action.

Good: Continue · Send · Save · Buy

Bad: five equally important buttons.

Users shouldn't have to decide what matters.

## 4. Reduce Cognitive Load

Every decision costs mental energy.

Remove unnecessary:

- buttons
- words
- icons
- settings
- choices

Good design feels obvious.

## 5. Consistency

Identical things should behave identically.

Use consistent:

- spacing
- typography
- button styles
- animations
- iconography
- colors
- terminology

Predictability builds confidence.

## 6. Recognition Over Memory

Never force users to remember information.

Show:

- previous choices
- recent items
- suggestions
- history
- autocomplete
- visible navigation

Humans recognize faster than they recall.

## 7. Progressive Disclosure

Only show complexity when needed.

Reveal advanced controls gradually. Simple first. Power later.

## 8. Immediate Feedback

Every action should produce feedback.

Examples:

- loading state
- animation
- vibration
- success checkmark
- progress indicator

Never leave users wondering if something happened.

## 9. Every Element Needs a Purpose

If removing an element improves the interface… remove it.

Everything should justify its existence.

## 10. Whitespace Is Functional

Whitespace is not empty.

It creates:

- grouping
- focus
- hierarchy
- readability
- elegance

Crowded interfaces feel difficult.

## 11. Group Related Things

Humans naturally perceive nearby elements as related.

Use spacing before borders. Distance communicates relationships.

## 12. Minimize User Effort

Good interfaces do work for users.

Examples:

- autofill
- smart defaults
- remembered settings
- automatic formatting
- suggested actions

The best interaction is often no interaction.

## 13. Prevent Errors

Don't just display errors. Prevent them.

Examples:

- disabled buttons
- validation while typing
- previews
- confirmations for destructive actions

Design should stop mistakes before they happen.

## 14. Errors Should Be Recoverable

When mistakes happen, explain:

- what happened
- why
- how to fix it

Never blame the user.

## 15. Readability First

Typography is communication.

Prioritize:

- sufficient size
- line spacing
- contrast
- readable fonts
- reasonable line lengths

Pretty typography that is hard to read is bad typography.

## 16. Color Should Communicate

Never rely solely on color.

Use color to reinforce meaning: success, warning, error, emphasis.

Meaning should still exist in grayscale.

## 17. Motion Should Explain

Animation is communication.

Good animation explains:

- where something came from
- where it went
- what changed
- what belongs together

Motion should clarify: not decorate.

## 18. Respect Attention

Attention is limited.

Avoid:

- unnecessary notifications
- autoplay
- flashing elements
- popups
- interruptions

Every interruption has a cost.

## 19. Build Trust

Interfaces should feel reliable.

Use:

- honest wording
- predictable behavior
- clear pricing
- visible security
- transparent permissions

Never surprise users.

## 20. Accessibility Is Good Design

Design for everyone.

Support:

- keyboard navigation
- screen readers
- high contrast
- larger text
- touch targets
- color blindness

Accessibility improves usability for all users. (The workflow's hard floor is
WCAG 2.2 AA: see [`../stack/uiux.md`](../stack/uiux.md).)

## 21. Speed Feels Like Quality

Perceived speed matters.

Techniques:

- skeleton loading
- optimistic updates
- progressive loading
- caching
- instant feedback

People judge quality by responsiveness.

## 22. Minimize Friction

Ask only for information that is necessary now.

Don't require:

- account creation
- unnecessary permissions
- lengthy forms

Delay requests until users understand the value.

## 23. Keep Navigation Predictable

Users should always know:

- where they are
- where they've been
- where they can go

Navigation should disappear into habit.

## 24. Make Important Things Easy to Reach

Frequently used actions should require fewer taps. Rare actions can be hidden.

Optimize for common workflows.

## 25. Design for Failure

Assume:

- no internet
- slow loading
- API failures
- empty states
- missing data

Graceful failure is part of good design.

## 26. Empty States Should Teach

Empty screens should answer:

- Why is this empty?
- What can I do next?

Always provide a path forward.

## 27. Confirmation for Destructive Actions

Deleting files, accounts, payments, or anything irreversible should require
confirmation. Minor actions should not.

## 28. Make Success Feel Rewarding

Celebrate progress.

Examples:

- subtle animations
- completion states
- checkmarks
- encouraging copy

Positive reinforcement improves engagement.

## 29. Optimize for the User's Goal

Users don't care about your features. They care about completing their task.

Everything should help them reach their goal faster.

## 30. Good Design Is Invisible

The highest compliment: "I didn't have to think."

Users notice bad interfaces. Great interfaces disappear.

## 31. Show, Don't Tell: the UI Is Not the Decision Log

Specs, ADRs, and design decisions guide what gets built. They are **never
pasted into the product**. Users should understand what a section is for from
its layout, hierarchy, labels, and content: not from a paragraph explaining
it.

Tells that internal thinking leaked into the UI:

- a descriptive sentence or paragraph under every section header
- copy that explains *why* the product works the way it does, unprompted
- headings that name a feature the way the spec does, not the way the user
  thinks about their task
- onboarding, empty states, or settings that read like documentation

If a section needs a preamble to be understood, redesign the section (Rule 1),
don't annotate it. Helper text is reserved for the few places users genuinely
need it, a teaching empty state (Rule 26), a consequential setting, and even
there it's one short sentence, not an explanation of the design.

## Universal Checklist

Before shipping a screen, and this is the checklist the **design-critic**
agent runs over every screenshot: ask:

- [ ] Is the purpose immediately obvious?
- [ ] Is there one clear primary action?
- [ ] Can anything be removed?
- [ ] Is the hierarchy obvious?
- [ ] Does every action have feedback?
- [ ] Are mistakes prevented?
- [ ] Can mistakes be recovered?
- [ ] Is navigation predictable?
- [ ] Is it accessible?
- [ ] Does it feel fast?
- [ ] Is typography easy to read?
- [ ] Is spacing intentional?
- [ ] Does motion clarify?
- [ ] Does color communicate meaning?
- [ ] Is it free of internal-decision text: no explanatory paragraph doing work the layout should do?
- [ ] Would a first-time user understand it?

If the answer to all of these is yes, the design is likely strong regardless of
visual style.

## Golden Rule

> **A beautiful interface attracts users. A clear interface keeps them.**
