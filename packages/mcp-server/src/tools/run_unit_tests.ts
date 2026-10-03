import * as z from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/server";
import type { ChainOpsConfig } from "../config.ts";
import { assertPathInsideWorkspace } from "../security.ts";
import { runCommand } from "../process.ts";

const inputSchema = z.object({
  projectPath: z.string().min(1).describe(
    "Path to a Foundry project inside CHAINOPS_WORKSPACE_ROOT",
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

export function registerRunUnitTestsTool(
  server: McpServer,
  config: ChainOpsConfig,
): void {
  server.registerTool(
    "run_unit_tests",
    {
      title: "Run Solidity Unit Tests",
      description:
        "Run Foundry unit tests with forge test. Execution is restricted to the configured ChainOps workspace.",
      inputSchema,
      outputSchema,
    },
    async ({ projectPath }) => {
      try {
        const safeProjectPath = await assertPathInsideWorkspace(
          projectPath,
          config.workspaceRoot,
        );

        const args = [
          "test",
          "--root",
          safeProjectPath,
        ];

        const result = await runCommand(
          "forge",
          args,
          safeProjectPath,
          config.testTimeoutMs,
        );

        const payload = {
          success: result.exitCode === 0 && !result.timedOut,
          ...result,
        };

        return {
          content: [{
            type: "text",
            text: payload.success
              ? `Tests completed successfully in ${payload.durationMs}ms.`
              : payload.timedOut
              ? `Tests timed out after ${payload.durationMs}ms.`
              : `Tests failed with exit code ${payload.exitCode}.`,
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
          content: [{
            type: "text",
            text: message,
          }],
          structuredContent: payload,
          isError: true,
        };
      }
    },
  );
}
