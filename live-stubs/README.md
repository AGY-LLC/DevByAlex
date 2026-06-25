# Live skill stubs

These are **thin pointers**, not skills. Each `<name>/SKILL.md` here defers to the
canonical skill body served **live** by the BuildsByAlex MCP brain
(<https://buildsbyalex.com/mcp>) via that skill's `skill_<slug>` tool.

## Why

`install.sh` used to vendor a full copy of every reused skill into each target
app's `.claude/skills/`. A copy is a frozen snapshot: improve a skill and every
already-onboarded repo is stale until you re-run the installer against it — the
"re-add it onto every repo" treadmill.

For skills the brain already serves, we ship a stub instead. Update the brain
once and **every onboarded repo is current on its next run, with zero
re-vendoring**, and the repo footprint shrinks from a full skill to a few lines.

## The split

| Tier | Source of truth | Lives in the repo as | Updates |
|---|---|---|---|
| **Live reused skills** (11) | BuildsByAlex brain | a stub in `live-stubs/` | real-time |
| **Vendored reused skills** | `~/.claude/skills` (copied) | a full copy | re-vendor on change |
| **Native workflow skills + agents** | this repo (`skills/`, `agents/`) | a full copy | re-vendor on change |
| **Project state** (`docs/STATUS.md`, …) | the target repo | local files | per-project, never shared |

A reused skill may be **live** only once `list_skills` on the brain returns it —
otherwise the stub would point at a `skill_<slug>` tool that does not exist.

### Currently live (served by the brain)

`test-suite-developer`, `scout`, `issue-checker`, `fix-errors`,
`staging-smoke-test`, `launch-readiness`, `prose-check`, `seo-audit`,
`accessibility-critique`, `ios-audit`, `create-demo`

### Still vendored (brain does not serve them yet)

- `marketer-brand-generation`, `marketer-copywriting` — reused skills not yet on
  the brain.
- The **native** workflow skills (`init-ai`, `plan-*`, `dev-*`, `launch-*`) and
  the 5 agents — these are edited *here* and are not on the brain. To make them
  live too, publish them to the brain, then move their names into the live
  registry below (the stub mechanism is identical).

## Editing

`live-stubs/` is generated — do not hand-edit. Change the `LIVE` registry in
[`../sync/gen-live-stubs.sh`](../sync/gen-live-stubs.sh), run it, and commit:

```bash
./sync/gen-live-stubs.sh
```

## Runner requirement

A stub needs the BuildsByAlex MCP connected to load its live body. That token is
already the one external dependency `/dev-schedule` wires into cloud/CI runs, so
attended and scheduled runs both have it. If it's missing, the stub stops and
asks the user to connect it rather than silently doing nothing.
