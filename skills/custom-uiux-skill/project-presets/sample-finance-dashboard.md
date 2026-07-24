# Preset: Trading / finance dashboard

A live trading & portfolio dashboard for active traders. Desktop-
dominant, multi-monitor friendly, live data, keyboard-first.

## 1. Style diagnosis

| Question | Answer |
|---|---|
| Product category | Data (workflow) |
| Target user | Active trader, technically literate, desktop-first, daily use, money on the line |
| Emotion | Confident, fast, calm under load, trustworthy |
| Interaction mode | Data + workflow |
| Density | High |
| Platform | Desktop-first responsive (light mobile companion for monitoring) |
| Character | Technical + premium |
| Avoid | Consumer-fintech pastels on data screens, gradient hero on dashboard, animated number counters, dark patterns |

## 2. Primary style

**`references/finance-trading-dashboard.md`**: multi-pane,
keyboard-shortcut-rich, dark by default, semantic green/red used only
for meaning.

## 3. Secondary style

**`references/technical-devtool.md`**: command palette as front door,
persistent left rail with saved views, dense tables with column
toggles, mono everywhere numbers matter.

## 4. Visual rules

1. Dark mode default. Light mode tuned (not pure white).
2. Functional color is reserved: green up, red down, amber risk, blue
   info. No decorative use.
3. Single brand accent for selection only; everything else neutral.
4. All numbers tabular and mono. Currency symbols thin.
5. Dense rows (28–32px). Frozen first column. Resizable everything.
6. Sparkline in every relevant cell.
7. Confirmation modals on destructive or high-value actions echo the
   exact number being changed.
8. No gradient anywhere on data surfaces.
9. Command palette (Ctrl/Cmd-K) opens *everything*.

## 5. Anti-patterns

- Pastel candy palette on data screens.
- Animated number counters (treat live numbers as live, not as a show).
- Hover-only critical info (positions, P&L).
- Spinners on individual cells: use a row shimmer.
- "Welcome back!" greeting on the dashboard.
- Centered hero on the dashboard. There is no hero.
- Sale-page-style banners ("Try Pro for 50% off!") in trading flow.

## 6. Suggested components

- Resizable, persistable tile grid for the dashboard.
- Frozen-header / frozen-first-column tables.
- Inline sparklines.
- Live tick blink (1px border pulse on price change, reduced-motion-
  aware).
- Right-side detail drawer (don't navigate away on row select).
- Saved views and named filters.
- Order-entry form with keyboard hints next to fields.
- Audit log on every important action.

## 7. Motion / interaction direction

- Snap, 80–150ms.
- No bounce, no spring.
- Hover reveals precise; never block the cell underneath.
- Live tick: 1px border pulse + subtle color flash (reduced-motion
  removes the flash, keeps the pulse).
- Modal open: 120ms fade-in; backdrop dim 25% (not 50%, you still want
  to see your other panels).

## 8. Sample design-system notes

```
COLOR (dark default)
  surface:    #0B0D11
  surface-2:  #131722
  surface-3:  #1A2030
  ink:        #E8ECF2
  ink-dim:    #8C95A8
  border:     #1F2533

  accent:     #5E8DFF (selection / primary)
  up:         #2EBD85
  down:       #E55B66
  warn:       #D9A23A
  info:       #5EA0FF

TYPOGRAPHY
  ui-sans:   Inter / IBM Plex Sans
  mono:      JetBrains Mono / Geist Mono (numerics, IDs)
  sizes: dense rows 12.5px; chrome 13px; headers 14–15px

SPACING
  base: 4px
  table row: 28–32px
  panel padding: 12px
  rail width: 56px collapsed, 220px expanded

RADIUS
  surfaces: 4–6px
  buttons:  6px
  pills:    full (status tags only)

MOTION
  default: 120ms ease-out
  live-tick: 600ms border pulse loop, reduced-motion-safe
  modal: 120ms fade
```

## 9. Sample page override: Positions table

- Frozen first column: instrument.
- Sticky header. Resizable columns. Persisted per-user.
- Live P&L cell has a sparkline behind the number (50% opacity).
- Row click: opens right drawer with full position detail.
- Right-click on row: context menu (Add to watchlist, Set alert, Close,
  Export row).
- Bulk actions: select multiple, bulk close with a confirmation modal
  that echoes total notional being closed.
- No row animations on data update, just the 1px pulse on the cell
  that changed.

## 10. Suggested `/uiux` workflow

1. `/uiux choose-style`: confirm finance + technical split.
2. `/uiux extract-system`: generate `docs/DESIGN.md`.
3. `/uiux page-override`: Dashboard, Positions, Order Entry, Alerts.
4. `/uiux generate-screen`: Settings, Audit, Compliance pages.
5. `/uiux critique`: pass on existing screens for density and meaning.
6. `/uiux detect-ai-ui`: particularly on marketing-adjacent surfaces.
7. `/uiux final-qa`: before ship.
