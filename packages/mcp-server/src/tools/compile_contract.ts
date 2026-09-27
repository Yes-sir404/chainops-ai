import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ChainOpsConfig } from "../config.ts";
import { assertPathInsideWorkspace } from "../security.ts";
import { runCommand } from "../process.ts";

const inputSchema = z.object({
  projectPath: z.string().min(1).describe(
    "Path to a Foundry project inside CHAINOPS_WORKSPACE_ROOT",
  ),
  force: z.boolean().optional().default(false).describe(
    "Pass --force to forge build and ignore the compilation cache",
  ),
});

const outputSchema = z.object({
  success: z.boolean(),
  exitCode: z.number().int(),
  durationMs: z.number().int().nonnegative(),
  timedOut: z.boolean(),
  stdout: z.string(),
  stderr: z.string(),
});

export function registerCompileContractTool(
  server: McpServer,
  config: ChainOpsConfig,
): void {
  server.registerTool(
    "compile_contract",
    {
      title: "Compile Solidity Contract",
      description:
        "Compile a Foundry Solidity project with forge build. Execution is restricted to the configured ChainOps workspace.",
      inputSchema,
      outputSchema,
    },
    async ({ projectPath, force }) => {
      try {
        const safeProjectPath = await assertPathInsideWorkspace(
          projectPath,
          config.workspaceRoot,
        );

        const args = ["build", "--root", safeProjectPath, "--json"];
        if (force) args.push("--force");

        const result = await runCommand(
          "forge",
          args,
          safeProjectPath,
          config.compileTimeoutMs,
        );

        const payload = {
          success: result.exitCode === 0 && !result.timedOut,
          ...result,
        };

        return {
          content: [{
            type: "text",
            text: payload.success
              ? `Compilation succeeded in ${payload.durationMs}ms.`
              : `Compilation failed with exit code ${payload.exitCode}.`,
          }],
          structuredContent: payload,
          isError: !payload.success,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const payload = {
          success: false,
          exitCode: -1,
          durationMs: 0,
          timedOut: false,
          stdout: "",
          stderr: message,
        };

        return {
          content: [{ type: "text", text: message }],
          structuredContent: payload,
          isError: true,
        };
      }
    },
  );
}
