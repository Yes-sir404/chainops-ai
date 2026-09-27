/**
 * Resolve a user-provided path and guarantee that it stays within the configured
 * ChainOps workspace. This is a core safety boundary because tool arguments may
 * eventually be produced by an LLM.
 */
export async function assertPathInsideWorkspace(
  requestedPath: string,
  workspaceRoot: string,
): Promise<string> {
  const target = await Deno.realPath(requestedPath);
  const root = await Deno.realPath(workspaceRoot);

  const separator = root.includes("\\") ? "\\" : "/";
  const rootWithSeparator = root.endsWith(separator) ? root : `${root}${separator}`;

  if (target !== root && !target.startsWith(rootWithSeparator)) {
    throw new Error(`Path is outside the allowed ChainOps workspace: ${requestedPath}`);
  }

  return target;
}
