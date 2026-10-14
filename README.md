# ChainOps AI

**Agentic DevOps infrastructure for smart contracts.**

ChainOps AI is designed to turn high-level smart-contract requirements into a controlled workflow for generation, compilation, testing, security analysis, simulation, approval, deployment, and verification.

## Architecture

```text
Next.js UI
    |
Spring Boot Control API
    |
Python Agent Runtime
    |
MCP
    |
Deno ChainOps MCP Server
    |
Foundry / Slither / EVM RPC
```

The key engineering rule is that LLM reasoning never equals execution authority. Agents call tightly-scoped tools; deployment authorization lives behind a separate policy and approval boundary.

## Current milestone — v0.1.0

Sprint 1 implements the first executable slice:

```text
MCP client
   |
compile_contract
   |
forge build
   |
structured result
```

### Repository

```text
chainops-ai/
├── apps/
│   ├── agent-runtime/
│   ├── control-api/
│   └── web/
├── packages/
│   ├── contracts/
│   └── mcp-server/
├── docs/
├── docker-compose.yml
└── .env.example
```

## Requirements

- Deno 2+
- Foundry
- Docker (for PostgreSQL; not required for the first MCP tool)

## 1. Validate the sample contract

```bash
cd packages/contracts
forge build
```

## 2. Start the MCP server

```bash
cd packages/mcp-server
export CHAINOPS_WORKSPACE_ROOT=../contracts
deno task start
```

PowerShell:

```powershell
cd packages/mcp-server
$env:CHAINOPS_WORKSPACE_ROOT="../contracts"
deno task start
```

## 3. Inspect the MCP server

Use an MCP-compatible inspector/client to invoke `compile_contract` with:

```json
{
  "projectPath": "../contracts",
  "force": false
}
```

Expected structured result:

```json
{
  "success": true,
  "exitCode": 0,
  "durationMs": 1234,
  "timedOut": false,
  "stdout": "...",
  "stderr": ""
}
```

## Security properties already present

- no arbitrary shell command parameter
- Foundry project path restricted to an allow-listed workspace
- process timeout
- structured tool input/output validation
- execution errors returned to the model as tool errors
- MCP stdout kept separate from diagnostic stderr

## Development

For Linux setup, local validation, MCP commands, environment variables, troubleshooting, and CI instructions, see:

[`docs/development.md`](docs/development.md)

## Current v0.1.0 foundation

The current development foundation includes:

- `compile_contract` MCP tool
- `run_unit_tests` MCP tool
- Foundry contract test fixtures
- automated MCP integration tests
- workspace path isolation
- process timeouts
- GitHub Actions continuous integration

## Next

The next phase introduces the agent runtime and the first bounded agentic workflow:

```text
requirement
    ↓
Planner Agent
    ↓
Solidity Developer Agent
    ↓
compile_contract
    ↓
run_unit_tests
    ↓
bounded repair loop
```

Planned next components:

1. Python FastAPI agent runtime
2. explicit MCP client
3. Planner Agent
4. Solidity Developer Agent
5. Testing Agent
6. bounded generate → compile → test → repair loop