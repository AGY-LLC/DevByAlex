import { spawn } from "node:child_process";
import type { Renderer, RenderRequest } from "./types.ts";

/** Run a command template; `{target}` and `{output}` are substituted. */
export function commandRenderer(name: string, template: string[]): Renderer {
  const fill = (req: RenderRequest, out: string) => template.map((a) => a.replaceAll("{target}", req.target).replaceAll("{output}", out));
  return {
    name,
    describe: (req) => [...fill(req, "<run>/outputs/" + req.output.split("/").pop()), ...req.args],
    render: (req) =>
      new Promise((resolve) => {
        const [cmd, ...rest] = fill(req, req.output);
        const child = spawn(cmd, [...rest, ...req.args], { cwd: req.cwd, stdio: "inherit" });
        child.on("error", () => resolve({ exitCode: 127 }));
        child.on("close", (code) => resolve({ exitCode: code ?? 1 }));
      }),
  };
}
