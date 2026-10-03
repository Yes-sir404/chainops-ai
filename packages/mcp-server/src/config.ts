export interface ChainOpsConfig {
  workspaceRoot: string;
  compileTimeoutMs: number;
  testTimeoutMs: number;
}

export async function loadConfig(): Promise<ChainOpsConfig> {
  const configuredRoot = Deno.env.get("CHAINOPS_WORKSPACE_ROOT") ??
    "../contracts";
  const workspaceRoot = await Deno.realPath(configuredRoot);

  const rawCompileTimeout = Deno.env.get("CHAINOPS_COMPILE_TIMEOUT_MS") ??
    "60000";
  const compileTimeoutMs = Number.parseInt(rawCompileTimeout, 10);

  if (!Number.isFinite(compileTimeoutMs) || compileTimeoutMs < 1_000) {
    throw new Error("CHAINOPS_COMPILE_TIMEOUT_MS must be an integer >= 1000");
  }

  const rawTestTimeout = Deno.env.get("CHAINOPS_TEST_TIMEOUT_MS") ?? "120000";
  const testTimeoutMs = Number.parseInt(rawTestTimeout, 10);

  if (!Number.isFinite(testTimeoutMs) || testTimeoutMs < 1_000) {
    throw new Error(
      "CHAINOPS_TEST_TIMEOUT_MS must be an integer >= 1000",
    );
  }

  return { workspaceRoot, compileTimeoutMs, testTimeoutMs };
}
