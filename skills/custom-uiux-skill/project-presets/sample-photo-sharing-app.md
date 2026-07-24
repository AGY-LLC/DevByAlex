# Preset: Photo-sharing mobile app

A small-group photo-sharing app. Users post photos privately to a few
trusted friends. Reactions, comments, no algorithm, no ads.

## 1. Style diagnosis

| Question | Answer |
|---|---|
| Product category | Social (creation: posting; consumption: feed) |
| Target user | 18–35, daily phone-native, voluntarily showing up |
| Emotion | Warm, intimate, fun |
| Interaction mode | Social |
| Density | Medium |
| Platform | Mobile-first (iOS + Android) |
| Character | Playful + practical |
| Avoid | Heavy chrome, algorithm-driven feel, advertising surfaces, follower counts displayed everywhere |

## 2. Primary style

**`references/social-mobile.md`**: bottom-tab, edge-to-edge feed,
optimistic UI, gestural navigation, full-bleed photos.

## 3. Secondary style

**`references/playful-consumer.md`**: adds warmth: friendly empty
states, a peach/cream accent palette, character-led onboarding,
soft reactions instead of likes.

## 4. Visual rules

1. Photo is hero on every screen. Chrome shrinks on scroll.
2. Reactions are 6 expressive emoji, not a single heart.
3. No follower counts on profile: show "friends" as a small number.
4. Cream background, ink type, one warm coral accent.
5. Sans body 16px; usernames in slightly heavier weight.
6. Sticky bottom composer when DMing.
7. No timestamps in absolute hours / minutes during the day: use
   relative ("a moment ago", "this morning").
8. No ads, no "discover" tab, no algorithm cues.

## 5. Anti-patterns

- "Suggested for you" rails.
- Profile pages that display follower counts in large display type.
- Aggressive notification opt-in on first launch.
- Sticker / GIF stores that take over composer.
- Engagement bait ("Your friend X just posted!").

## 6. Suggested components

- Feed card (full-bleed photo, caption, reaction tray, comment count).
- DM thread (bubbles, sticky composer, reactions).
- Profile (avatar, short bio, friends count, grid of recent posts).
- Composer (camera-first, gallery picker, caption, audience selector).
- Reaction picker (long-press to open).
- Bottom tab bar: Feed / Friends / Compose / DMs / Profile.

## 7. Motion / interaction direction

- Spring on every gesture.
- Pull-to-refresh on feed.
- Optimistic reactions: heart appears before network confirms.
- Bottom sheets snap to detents.
- Haptics on send, on react, on long-press.
- Reduced motion: replace springs with 100ms ease-out; haptics remain.

## 8. Sample design-system notes

```
COLOR
  surface:    #FFF8F1 (cream)
  surface-2:  #FFEFE2
  ink:        #1B1B1F
  accent:     #E26B4F (coral)
  positive:   #4F7B5B
  warn:       #B5781E
  danger:     #B23A3A

TYPOGRAPHY
  ui:   geometric humanist sans, 16px, 1.45
  display: friendly soft serif for empty states + profile headers

SPACING
  unit: 4px
  feed gap: 20px between cards
  composer padding: 16px

RADIUS
  cards:    20px
  buttons:  pill (small) / 16px (wide)
  photos:   16px (or full bleed)

MOTION
  default press: spring (medium stiffness, low damping)
  page transition: 220ms ease-out slide
  reduced motion: 100ms fade, no spring
```

## 9. Sample page override: Composer

- Camera-first: opens directly to the camera; gallery is a swipe up.
- Caption field at the bottom over a slight gradient ramp so it stays
  legible on any photo.
- Audience selector chip at top right: defaults to last-used group;
  tap to change.
- Send button is a single large coral pill at the bottom.
- Discard: swipe down on the photo. Confirmation only if caption was
  entered.

## 10. Suggested `/uiux` workflow

1. `/uiux choose-style`: confirm social + playful split.
2. `/uiux extract-system`: generate the design system doc.
3. `/uiux page-override`: Feed, Composer, Profile, DM.
4. `/uiux generate-screen`: Onboarding, Settings, Friend management.
5. `/uiux mobile-polish`: every screen.
6. `/uiux detect-ai-ui`: particularly on empty states and onboarding.
7. `/uiux final-qa`: before ship.
