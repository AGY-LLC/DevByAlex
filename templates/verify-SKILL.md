---
name: verify
description: "Checks this repo is green before a commit: lint, typecheck and tests in every workspace the change touches. Claude Code runs a project skill named verify right before committing."
---

# verify

Run, from the repo root, the `lint`, `typecheck` and `test` scripts that each
touched workspace's `package.json` defines (for example
`pnpm --filter <workspace> run test`); skip a script a workspace doesn't
define and say so. E2E suites are not part of this; the feature loop runs
them.

Any failure stops the commit: fix the cause, never skip, weaken or delete a
test (hard rule in `docs/DECISIONS.md`). Report each command and its result in
one line.
