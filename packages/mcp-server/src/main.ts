import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createChainOpsServer } from "./server.ts";

void serveStdio(createChainOpsServer);
console.error("ChainOps MCP server v0.1.0 running over stdio");
