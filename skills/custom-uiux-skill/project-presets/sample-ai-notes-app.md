# Preset: AI notes / productivity app

An AI-augmented notes app for knowledge workers. Users write, the AI
helps summarize, link, rewrite, and answer questions about their notes.
Web-first; mobile companion for capture and read.

## 1. Style diagnosis

| Question | Answer |
|---|---|
| Product category | Creation + workflow (knowledge work) |
| Target user | Knowledge worker, 25–55, technically literate, desktop-dominant |
| Emotion | Calm, focused, confident, fast |
| Interaction mode | Creation + workflow |
| Density | Medium (low in the editor, medium in the sidebar) |
| Platform | Desktop-first responsive (web + mobile companion) |
| Character | Premium + practical |
| Avoid | Sparkle/magic AI framing, gradient hero, "let me explain like you're 5" copy, cluttered toolbar, hidden tool-call activity |

## 2. Primary style

**`references/ai-native-productivity.md`**: editor + sidebar, streaming
output, inline diff, slash commands, command palette.

## 3. Secondary style

**`references/premium-editorial.md`**: note pages feel like real
documents. Serif option for long-form. Generous reading width. The note
*looks* like a piece of writing.

(For an audience of engineers, swap secondary for
`references/technical-devtool.md`: denser editor, mono everywhere, the
command palette is the front door.)

## 4. Visual rules

1. Editor canvas is the hero. Toolbars hide until focus moves to them.
2. Two type stacks: serif for long-form note bodies (toggleable), sans
   for chrome and short notes.
3. One signature accent, used on AI streaming pulse, focus ring, and
   primary CTA only.
4. Tool-call activity is always visible in a small line above the
   streaming text ("searched 3 notes → drafting…").
5. Inline diff for any AI edit; accept/reject per hunk.
6. Command palette (Ctrl/Cmd-K) is the front door.
7. Dark mode is a real mode: deep slate, not inverted.
8. No mascot. No persona name. The model is a tool.

## 5. Anti-patterns

- Sparkle / wand icons next to every AI feature.
- A "New chat" button that destroys context with no confirmation.
- AI gradient backgrounds in the chat or settings.
- "I'm thinking…" placeholder text: show what it's actually doing.
- A welcome modal on every login.
- A free-floating circular AI button that always sits on top of content.

## 6. Suggested components

- Editor with slash-command menu (insert heading, ask AI, summarize…).
- Right-side AI sidebar (collapsible to icon strip).
- Command palette.
- Inline diff viewer for proposed edits.
- Citations bar: small chips of source-note titles below each AI
  message; hover for preview, click to jump.
- Workspace tree (left sidebar): collapsible groups, search at top.
- Composer at the bottom of the AI sidebar with a focus-ring pulse
  while streaming.

## 7. Motion / interaction direction

- 120–180ms ease-out for everything except streaming.
- Streaming text uses a thin breathing cursor.
- Sidebar collapse: 200ms ease-in-out.
- Focus ring pulses subtly *only* while streaming, *only* with motion
  allowed.
- Reduced motion: no pulses, no sidebar slide, instant snap.

## 8. Sample design-system notes

```
COLOR
  surface:        #FAFAF7 (paper, light) / #0E0F12 (slate, dark)
  surface-2:      #F1F1EC / #16181C
  ink:            #1A1A22 / #E9E9EE
  accent:         #5A6CFF (used sparingly: composer focus, primary CTA)
  positive:       #3F8F58
  warn:           #B07F25
  danger:         #B7423A

TYPOGRAPHY
  ui-sans:    Inter / Geist
  body-serif: Source Serif Pro or similar (toggleable)
  mono:       JetBrains Mono (code, IDs, tool-call traces)
  sizes: editor 16px, chat 14px, dense lists 13px

SPACING
  base: 4px
  editor padding: 32–64px desktop / 20px mobile
  sidebar width: 260px (expanded) / 56px (collapsed)

RADIUS
  small surfaces: 6px
  cards:          10px
  buttons:        8px
  pills:          full

MOTION
  default: 140ms ease-out
  sidebar: 200ms ease-in-out
  streaming cursor: 800ms loop, motion-reduced disables loop
  prefers-reduced-motion: 0ms snap everywhere except meaningful streaming
```

## 9. Sample page override: Note page (editor)

- Single column, 720–800px wide on desktop, centered.
- Title set in serif at 32px; body 16px serif if "long-form" mode is on,
  otherwise sans.
- Toolbar appears only when text is selected (floating, follows
  selection).
- "Ask AI about selection" appears in the selection toolbar.
- Right sidebar is collapsed by default on this surface; open it
  yourself when you need it.
- No word counter at the top: it's quietly in the status bar.

## 10. Suggested `/uiux` workflow

1. `/uiux choose-style`: confirm AI-native + editorial (or technical).
2. `/uiux extract-system`: generate the design system doc.
3. `/uiux page-override`: Editor, Sidebar, AI thread, Settings.
4. `/uiux generate-screen`: Workspace home, Onboarding, Search.
5. `/uiux critique`: pass on existing screens.
6. `/uiux detect-ai-ui`: particularly on AI surfaces.
7. `/uiux final-qa`: before ship.
