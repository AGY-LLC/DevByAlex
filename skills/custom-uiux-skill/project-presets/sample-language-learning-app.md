# Preset: Language learning app

A reflective language learning app aimed at adult learners who value
quality over streak-shaming. The user does 10–20 minutes a day,
mostly on mobile.

## 1. Style diagnosis

| Question | Answer |
|---|---|
| Product category | Education (creation: speaking, writing practice) |
| Target user | Adult self-learner, 25–55, owns a phone, voluntarily showing up daily |
| Emotion | Calm, focused, gently encouraging |
| Interaction mode | Workflow (one lesson at a time) |
| Density | Low |
| Platform | Mobile-first responsive (also a web review surface) |
| Character | Calm + practical |
| Avoid | Owl-mascot guilt trips, streak shaming, gamification overload, AI-sparkle "magic" framing |

## 2. Primary style

**`references/calm-japanese-mindful.md`**: the user opens the app to
*concentrate*. The system should make one screen, one task, breathe.

## 3. Secondary style

**`references/ai-native-productivity.md`**: adds the streaming AI tutor
feedback, inline diff for "here's what your sentence almost said," and
a quiet right-rail AI sidekick on the web review surface. The AI is a
*tutor*, not a sparkle feature.

## 4. Visual rules

1. One primary action per screen. The lesson is the only thing on the
   lesson screen.
2. Cream / off-white surface. Indigo type. One warm earth-tone accent.
3. Body 17px, leading 1.7. Generous side margins on mobile.
4. No streaks gamified. Show consistency as a quiet 30-day grid, no
   confetti when a day is logged.
5. AI feedback streams in a small card under the user's answer; the
   model name is not displayed.
6. Motion: 300ms ease-out fades. Nothing bounces.
7. Dark mode is a deep slate, not pitch black.
8. Numerals tabular.

## 5. Anti-patterns

- Owl mascot or any guilt-trip avatar.
- "Streak lost!" punitive screen.
- AI gradient / sparkle on tutor feedback.
- Bottom tab bar with 5 tabs: limit to 3.
- Auto-play audio on screen entry.
- Confetti for completing a lesson.

## 6. Suggested components

- "Today's lesson" home card (one task, one CTA).
- Sentence-practice composer with inline AI diff feedback.
- Tab bar (3 tabs): Today, Library, Profile.
- 30-day consistency grid (quiet dots, no fireworks).
- Audio player chrome (waveform, slow-play, repeat).
- Permissions explainer (one sentence before each OS modal).

## 7. Motion / interaction direction

- Lesson advance: 300ms crossfade.
- AI feedback: tokens stream with subtle cursor; card fades in once
  complete.
- Buttons: 100ms press-down with light haptic; no spring.
- Reduced motion: all transitions become instant; streaming text still
  streams (it's meaningful).

## 8. Sample design-system notes

```
COLOR
  surface:        #FBF8F1 (cream)
  surface-2:      #F1EDE3
  ink:            #1F1F2E
  accent:         #B85A3E (terracotta)
  positive:       #4F7048
  warn:           #B47B1F
  danger:         #8C2F2F

TYPOGRAPHY
  display: humanist serif, 32–40px headers
  body:    humanist sans, 17px, 1.7 leading
  mono:    JetBrains Mono, only for vocab IDs and IPA

SPACING
  base unit: 4px; container padding 20–24px on mobile, 80–96px desktop
  vertical rhythm: multiples of 8px

RADIUS
  small surfaces: 8px
  cards:          16px
  buttons:        full pill (when small) or 12px (when wide)

MOTION
  default: 300ms ease-out
  press:   100ms ease-out
  prefers-reduced-motion: snap (0ms)
```

## 9. Sample page override: Lesson screen

- Header: lesson number + topic in small caps; no progress bar.
- Single content card: the prompt, then the user's answer area, then
  (post-submit) the AI feedback card.
- Bottom: one primary CTA, "Continue" or "Try again."
- No tab bar visible during a lesson. The user is in flow.
- On submit: 800ms gentle fade, AI feedback streams; "Continue" CTA
  appears only when feedback is complete.

## 10. Suggested `/uiux` workflow

1. `/uiux choose-style`: confirm calm + AI-native split.
2. `/uiux extract-system`: generate `docs/DESIGN.md` from the diagnosis.
3. `/uiux page-override`: for Lesson, Today, Library, and Profile.
4. `/uiux generate-screen`: for each new screen.
5. `/uiux mobile-polish`: pass on every mobile surface.
6. `/uiux detect-ai-ui`: run before review.
7. `/uiux final-qa`: run before ship.
