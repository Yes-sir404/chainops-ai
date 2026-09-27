import { McpServer } from "@modelcontextprotocol/server";
import { loadConfig } from "./config.ts";
import { registerCompileContractTool } from "./tools/compile_contract.ts";

export async function createChainOpsServer(): Promise<McpServer> {
  const config = await loadConfig();

  const server = new McpServer({
    name: "chainops-mcp-server",
    version: "0.1.0",
  });

  registerCompileContractTool(server, config);

  return server;
}
