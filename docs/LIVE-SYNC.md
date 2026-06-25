# How DevByAlex skills stay current

> Answers the recurring question: *should DevByAlex's own skills live inside the
> BuildsByAlex brain so they update live?* **Decision: no — native skills stay
> local and committed; only the reused skills are served live.** This records the
> two-tier model and why the split is where it is.

DBA = **DevByAlex** (this repo, `AGY-LLC/DevByAlex`).
BBA = **BuildsByAlex** (`AGY-LLC/BuildsByAlex`), Alex's personal-brain MCP server.

---

## The two tiers

| Tier | What | Source of truth | In an onboarded app | Updates |
|---|---|---|---|---|
| **Reused skills** (11) | scout, fix-errors, launch-readiness, … — shared across the brain, not DBA-specific | the skills source BBA indexes (`skill_<slug>` tools) | a **thin stub** in `live-stubs/` | **live** — edit on the brain, every repo current next run, zero re-vendoring |
| **Native workflow skills** (15) + agents (5) | `init-ai`, `plan-*`, `dev-*`, `launch-*` — the DevByAlex workflow itself | **this repo** (`skills/`, `agents/`) | a **committed copy** | **manual** — re-vendor with `install.sh --update` / `/dev-update` |

The reused skills were already on BBA (they're general-purpose), so stubbing them
was a free win — the stub just points at a `skill_<slug>` the brain already
serves. See [live-stubs/README.md](../live-stubs/README.md).

## Why native skills stay local (not hosted in BBA)

Hosting the native bodies in BBA would make them live too, but it was a
deliberate **no**:

- **"Part of the project" beats "served live."** A committed copy travels with the
  repo — a clone or CI checkout carries the exact workflow it was built against,
  with no runtime dependency on the brain being reachable to even load a stage.
- **Reproducibility.** A mid-build skill change served live could shift an app's
  behavior non-reproducibly between runs. Local copies pin the workflow to a
  known version (stamped in `.claude/.devbyalex.json`).
- **The update cost is small and now one command.** The only downside of copies —
  propagating an edit — is handled by `install.sh --update` (one app) /
  `--update-all` (every onboarded app) / the `/dev-update` skill. Updates are
  deliberate, never automatic, so a scheduled build can't shift underfoot.

`brain/` stays methodology-only; the skills source stays the home for the
*reused* executable skills. DBA's own skills are the repo's job.

## The update pipeline (native skills)

```
  edit a skill in this repo ─► commit ─► (per app)  install.sh <app> --update
                                         (all apps)  install.sh --update-all
        each app's .claude/ skills+agents+templates re-vendored to the new
        version; .claude/.devbyalex.json restamped; docs/STATUS untouched
```

The stamp records the version + git ref each app was vendored from, so an update
reports `old_ref -> new_ref` and `--update-all` can find every onboarded app via
the local `.onboarded-apps` registry.

## If this ever needs to change

Should a native skill genuinely need live serving (e.g. an urgent fix across many
live apps), the reused-skill mechanism is identical: publish that one skill to the
skills source BBA indexes and flip its name to a stub. That's the lever ADR-0007
used in reverse when it *removed* `marketer-*` from BBA — membership in the skills
source is the on/off switch for "served live." Default stays local.
