---
name: verify
description: "Checks this repo is green before a commit: lint, typecheck and tests in every workspace the change touches. Claude Code runs a project skill named verify right before committing code."
---

# verify

Run the `lint`, `typecheck` and `test` scripts that each touched workspace's
`package.json` defines, with the package manager the root lockfile names:
`pnpm -C <dir> run <script>` (not `--filter`, which exits 0 when nothing
matches), `npm --prefix <dir> run <script>` or another manager's
equivalent. A change to root config, the lockfile or the workspace list
touches every workspace. Skip a script a workspace doesn't define and say so.
E2E suites are not part of this; the feature loop runs them.

Any failure stops the commit: fix the cause, never skip, weaken or delete a
test (hard rule in `docs/DECISIONS.md`). A suite that can't start or skips
itself for an environment reason (no local database) is reported as not run,
never as green. Report each command and its result in one line.
