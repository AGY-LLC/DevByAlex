# Reference direction: Mobile-Native Utility

Small focused tools on the phone: a single job done well. Timer,
scanner, converter, level, flashlight, file shortcut, micro-tracker.
The UI is the tool, not a vessel for content.

## When to use it

- Single-purpose mobile tools.
- Small productivity utilities and quick-action apps.
- Apple Watch / wearable companion surfaces.
- Widget-first products where the home-screen widget is the main UX.

## When not to use it

- Multi-feature consumer apps.
- Anything content-heavy.
- B2B and workflow tools.
- Anything where onboarding is mandatory and long.

## What it should feel like

Immediate. The user opens the app and the tool is *right there*. No
greeting, no welcome screen, no onboarding gauntlet. Press, get answer.

## Layout traits

- One screen. One job. Optional second screen for settings/history.
- The primary action dominates: large, centered, thumb-reachable.
- Secondary affordances live at the edges, small but discoverable.
- Settings live behind a gear in a corner, not behind a tab.
- Full-screen modes for results where appropriate (a scanner result,
  a calculator answer).

## Color tendencies

- Dark mode often default: utility apps live in pockets.
- One bold accent for the primary action.
- Functional colors for success / error.
- The OS's system color and font respected when sensible (it makes the
  app feel native).

## Typography tendencies

- System font (SF on iOS, Roboto on Android) by default.
- Display sizes for the *answer* (the number, the result).
- Body text minimal: utilities are not for reading.
- Numerals tabular if numbers change live.

## Component patterns

- Big primary button or single-tap surface.
- Haptic-rich micro-feedback on every tap.
- History tray as a bottom sheet, never a separate tab unless the app
  warrants it.
- Empty-state of history says "Use the tool. It'll show up here."
- Share sheet integration first-class (you almost always want to send
  the result somewhere).

## Navigation patterns

- Often no chrome at all. The home screen is the tool.
- Settings: a small icon in a corner.
- History: bottom sheet swipe-up.
- "About / paid / pro" tucked behind settings.

## Motion / interaction style

- Snappy. 100–150ms.
- Haptics on action, not on tap.
- Spring physics for sheets pulling up.
- Large-press affordances; long-press for advanced actions.
- Reduced motion gracefully replaces the spring sheet with a quick fade.

## Good inspiration categories

- Single-purpose iOS app categories (calculators, timers, levels,
  scanners, converters).
- Widget-led products (concept-level).
- App Clip / Instant App style flows.

## Anti-patterns to avoid

- Forcing account creation before the tool works.
- "Welcome!" / "Let me show you around!" tours for a utility.
- Push permission requests on first launch.
- Burying the primary action under marketing.
- Subscription paywalls on first tap before the user has experienced
  value once.
- A "feed" or "discover" tab in a utility app. It's a utility, not a
  feed.

## Example suitable products

- A timer / Pomodoro app.
- A barcode / QR scanner.
- A converter (units, currency, time zones).
- A level / measuring tool.
- A camera-based document scanner.
- A custom calculator (e.g., tip, dosage, mortgage).

## Example unsuitable products

- A social photo-sharing app.
- A content platform.
- A finance dashboard.
- A devtool.
- A long-form learning app.
