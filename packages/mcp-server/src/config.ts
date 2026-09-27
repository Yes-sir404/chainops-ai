export interface ChainOpsConfig {
  workspaceRoot: string;
  compileTimeoutMs: number;
}

export async function loadConfig(): Promise<ChainOpsConfig> {
  const configuredRoot = Deno.env.get("CHAINOPS_WORKSPACE_ROOT") ?? "../contracts";
  const workspaceRoot = await Deno.realPath(configuredRoot);

  const rawTimeout = Deno.env.get("CHAINOPS_COMPILE_TIMEOUT_MS") ?? "60000";
  const compileTimeoutMs = Number.parseInt(rawTimeout, 10);

  if (!Number.isFinite(compileTimeoutMs) || compileTimeoutMs < 1_000) {
    throw new Error("CHAINOPS_COMPILE_TIMEOUT_MS must be an integer >= 1000");
  }

  return { workspaceRoot, compileTimeoutMs };
}
