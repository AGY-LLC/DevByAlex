/** A renderer turns a declared target into one output file. Adapters only run
 *  the tool; dependency resolution, provenance and filing are the toolkit's. */
export interface RenderRequest {
  /** Absolute directory the renderer runs in (the dependency file's root). */
  cwd: string;
  target: string;
  /** Absolute path the output must be written to. */
  output: string;
  args: string[];
}

export interface Renderer {
  name: string;
  /** The argv recorded in the manifest (paths may be symbolic). */
  describe(req: RenderRequest): string[];
  render(req: RenderRequest): Promise<{ exitCode: number }>;
}
