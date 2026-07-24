# Reference direction: Social Mobile

Feeds, profiles, DMs, posts, reactions. Touch-first. The product *is*
the interaction, not the chrome around it. Performance and habit-forming
loops matter more than polish in many surfaces.

## When to use it

- Feed-based social products (photo, video, text, audio).
- DM / messaging products.
- Small-group community apps.
- Habit-forming consumer products with social loops.

## When not to use it

- Anything desktop-first.
- Workflow or productivity tools.
- B2B SaaS: social-mobile patterns read as unserious.

## What it should feel like

Alive. Personal. Fast. The user opens the app and sees something new in
under a second. The interface fades; the content is the experience.

## Layout traits

- Tab bar at the bottom with 3–5 tabs; central tab is often a posting
  action.
- Edge-to-edge feed cards; minimal chrome.
- Full-screen story-style content modes.
- Headers shrink/disappear on scroll.
- Modal sheets (drawn from the bottom) replace many full-page nav steps.

## Color tendencies

- Black-and-white plus one bold brand accent.
- Profile color accents allowed (a per-user vibe).
- Light + dark modes both first-class.
- Avoid corporate blue. Pick a color that feels like the community.

## Typography tendencies

- A geometric humanist sans for UI (SF Pro on iOS, Inter on others).
- Display sizes for usernames and profile headers.
- Mono allowed for IDs and timestamps in moderation surfaces.
- 15–17px body; small caps for status labels.

## Component patterns

- Like/heart/reaction picker with haptics.
- Comment composers anchored to the keyboard.
- Stories / reels strip at the top.
- Long-press menus for moderation and quick actions.
- Toast notifications top-anchored (so they don't fight tab bar).
- Skeleton placeholders that match the real layout exactly.

## Navigation patterns

- Bottom tab bar; the central "+" button posts or composes.
- Swipe-back gesture must be respected everywhere.
- Deep links into post / DM / profile open the right tab.
- Search is global and lives in its own tab.

## Motion / interaction style

- Spring-based on tap and drag.
- Pull-to-refresh on feeds.
- Bottom sheets snap to detents.
- Optimistic UI on likes, sends, follows: the action should *appear*
  to succeed before the network confirms.
- Haptic feedback on key actions.

## Good inspiration categories

- Mobile-first social apps (concept-level).
- Camera apps and their share sheets.
- Messaging apps with creative reaction sets.

## Anti-patterns to avoid

- Desktop-mindset two-column layouts on mobile.
- Heavy modals that break swipe-back.
- Engagement-bait notifications.
- Toasts that obscure the action they confirm.
- Hiding mute / block / report behind too many taps.
- Counters that animate excessively ("100k likes" counting up live).
- Aggressive dark patterns ("are you sure you want to leave?" with
  bright "stay" buttons).

## Example suitable products

- A photo-sharing app.
- A short-video app.
- A group chat / community app.
- A consumer fitness app with social feed.
- A music-discovery app with shareable taste profiles.

## Example unsuitable products

- A finance dashboard.
- A B2B CRM.
- A devtool console.
- A long-form reading product (use editorial instead).
- A meditation app (use calm/wellness instead).
