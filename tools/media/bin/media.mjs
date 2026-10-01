#!/usr/bin/env node
// Entry point. Node >= 22.18 runs the TypeScript sources directly (type
// stripping), so there is no build step and nothing to keep in sync.
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(`media: Node ${process.versions.node} is too old; need >= 22.18 (TypeScript type stripping).`);
  process.exit(2);
}
const { run } = await import("../src/cli.ts");
process.exitCode = await run(process.argv.slice(2));
