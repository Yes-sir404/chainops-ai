# ChainOps MCP Server

Local MCP server exposing tightly-scoped smart-contract engineering tools.

## V0.1 tools

- `compile_contract` — invokes `forge build` only inside `CHAINOPS_WORKSPACE_ROOT`.
- `run_unit_tests` — invokes `forge test` only inside `CHAINOPS_WORKSPACE_ROOT`.

## Requirements

- Deno 2+
- Foundry (`forge` available on PATH)

## Run

From `packages/mcp-server`:

```bash
export CHAINOPS_WORKSPACE_ROOT="../contracts"
export CHAINOPS_COMPILE_TIMEOUT_MS=60000
export CHAINOPS_TEST_TIMEOUT_MS=120000
deno task start
```

On PowerShell:

```powershell
$env:CHAINOPS_WORKSPACE_ROOT="../contracts"
$env:CHAINOPS_COMPILE_TIMEOUT_MS="60000"
$env:CHAINOPS_TEST_TIMEOUT_MS="120000"
deno task start
```

The server uses stdio. Do not print normal application logs to stdout; stdout is reserved for MCP protocol traffic.  