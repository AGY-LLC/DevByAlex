# How DevByAlex skills stay current

> DevByAlex is **fully self-contained**. Every skill and every best-practice
> playbook is a committed copy in the repo — nothing is served live from an
> external brain. This records what ships, where it comes from, and how an edit
> propagates to onboarded apps.

DBA = **DevByAlex** (this repo, `AGY-LLC/DevByAlex`).

This used to be a two-tier model where the reused skills were served *live* from
the BuildsByAlex (BBA) MCP brain via thin stubs. **That brain is decommissioned.**
There are no live stubs and no runtime dependency on any MCP — everything is
vendored. The old `live-stubs/` directory and `sync/gen-live-stubs.sh` are gone.

---

## What ships (all vendored, all committed)

| What | Lives in this repo as | Installed into an app as | Updates |
|---|---|---|---|
| **All skills** — the workflow stages (`init-ai`, `plan-*`, `dev-*`, `launch-*`) and the supporting skills they call (`scout`, `fix-errors`, `issue-checker`, `test-suite-developer`, `staging-smoke-test`, `launch-readiness`, `prose-check`, `seo-audit`, `accessibility-critique`, `ios-audit`, `create-demo`, `marketer-brand-generation`, `marketer-copywriting`) — plus agents | `skills/`, `agents/` | a committed copy in `<app>/.claude/` | manual re-vendor |
| **Best-practice knowledge** (playbooks, stack notes, checklists) | `knowledge/` | a committed copy in `<app>/.claude/knowledge/` | manual re-vendor |
| **Doc templates** (`STATUS`, `SPEC`, `DECISIONS`, …) | `templates/` | stamped into `<app>/docs/` by `init-ai` | per-project, not shared |
| **Project state** (`docs/STATUS.md`, …) | — | local to the app | per-project, never shared |

`install.sh` copies `skills/`, `agents/`, `templates/`, and `knowledge/` into
`<app>/.claude/`. A clone or CI checkout of an onboarded app therefore carries the
**entire** workflow with no network dependency — no MCP, no token, no brain.

## Why everything is committed (not served live)

- **"Part of the project" beats "served live."** A committed copy travels with the
  repo, so a clone or unattended CI run carries the exact workflow it was built
  against and can load every stage without anything being reachable.
- **Reproducibility.** A skill change served live could shift an app's behavior
  non-reproducibly between runs. Local copies pin the workflow to a known version
  (stamped in `.claude/.devbyalex.json`).
- **Resilience.** When the upstream brain went away, nothing in an onboarded app
  broke — because nothing depended on it at run time. That is the whole point.

The trade-off of copies is that an upstream improvement doesn't reach an app until
it's re-vendored. That cost is one command (below), and the propagation is
**deliberate, never automatic**, so a scheduled build can't shift underfoot.

## The update pipeline

```
  edit a skill / playbook in this repo ─► commit ─► (per app)  install.sh <app> --update
                                                    (all apps)  install.sh --update-all
        each app's .claude/ skills+agents+templates+knowledge re-vendored to the
        new version; .claude/.devbyalex.json restamped; docs/STATUS untouched
```

The stamp records the version + git ref each app was vendored from, so an update
reports `old_ref -> new_ref`, and `--update-all` finds every onboarded app via the
local `.onboarded-apps` registry. `/dev-update` is the in-app skill that runs the
same re-vendor for the current app.

## Updating the borrowed skills / knowledge themselves

Some skills (`scout`, `seo-audit`, `marketer-*`, …) and the `knowledge/` were
originally sourced from the broader skill library and the BBA brain repo; they're
now native copies in this repo. To refresh them, copy the newer bodies into
`skills/` / `knowledge/`, commit, then push to apps with the update pipeline
above. There is no generator step and no live tier to keep in
sync — what's in the repo is the source of truth.
