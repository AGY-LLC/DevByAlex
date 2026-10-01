import { EXIT, MediaError } from "../lib/errors.ts";
import { commandRenderer } from "./command.ts";
import type { Renderer } from "./types.ts";

export type { Renderer, RenderRequest } from "./types.ts";

const BUILTIN: Record<string, () => Renderer> = {
  // The existing Remotion CLI, unchanged: `npx remotion render <id> <out> [args]`.
  remotion: () => commandRenderer("remotion", ["npx", "remotion", "render", "{target}", "{output}"]),
};

const extra: Record<string, () => Renderer> = {};

/** Register a renderer for another tool (library use). */
export function registerRenderer(name: string, make: () => Renderer): void {
  extra[name] = make;
}

/** `command` runs the dependency file's own `command` template, so a
 *  pipeline that is not Remotion (ffmpeg, an image generator) needs no code. */
export function getRenderer(name: string, command?: string[]): Renderer {
  if (name === "command") {
    if (!command?.length) throw new MediaError(EXIT.usage, `Renderer "command" needs a "command" array in the dependency file, using {target} and {output}.`);
    return commandRenderer("command", command);
  }
  const make = extra[name] ?? BUILTIN[name];
  if (!make) throw new MediaError(EXIT.usage, `Unknown renderer "${name}". Built in: ${Object.keys(BUILTIN).join(", ")}, command.`);
  return make();
}
