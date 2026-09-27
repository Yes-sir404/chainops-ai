# ChainOps MCP Server

Local MCP server exposing tightly-scoped smart-contract engineering tools.

## V0.1 tool

- `compile_contract` — invokes `forge build` only inside `CHAINOPS_WORKSPACE_ROOT`.

## Requirements

- Deno 2+
- Foundry (`forge` available on PATH)

## Run

From `packages/mcp-server`:

```bash
export CHAINOPS_WORKSPACE_ROOT=../contracts
deno task start
```

On PowerShell:

```powershell
$env:CHAINOPS_WORKSPACE_ROOT="../contracts"
deno task start
```

The server uses stdio. Do not print normal application logs to stdout; stdout is reserved for MCP protocol traffic.
