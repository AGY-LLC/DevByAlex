---
name: verify
description: "Checks this repo is green before a commit: lint, typecheck and tests in every workspace the change touches. Claude Code runs a project skill named verify right before committing code."
---

# verify

Run the `lint`, `typecheck` and `test` scripts that each touched workspace's
`package.json` defines, with `pnpm -C <dir> run <script>` (for example
`pnpm -C web run test`; `--filter` exits 0 when nothing matches). A change to
root config, the lockfile or `pnpm-workspace.yaml` touches every workspace.
Skip a script a workspace doesn't define and say so. E2E suites are not part
of this; the feature loop runs them.

Any failure stops the commit: fix the cause, never skip, weaken or delete a
test (hard rule in `docs/DECISIONS.md`). A suite that can't start for an
environment reason (no local database) is reported as not run, never as
green. Report each command and its result in one line.
