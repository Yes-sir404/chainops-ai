# ChainOps AI — Linux Development Setup

This guide explains how to prepare, validate, and run the ChainOps AI development environment on Linux.

The commands below are validated on Debian 13.

## Validated Toolchain

The following versions are known to work with the current ChainOps development environment:

| Tool | Validated version |
| --- | --- |
| Git | 2.47.3 |
| Deno | 2.9.7 |
| TypeScript | 6.0.3 |
| Foundry / Forge | 1.8.3 |
| Docker | 29.8.1 |
| Docker Compose | 5.5.1 |

These are validated versions, not necessarily strict minimum requirements.

Docker is not required for the current MCP compilation and testing workflow, but it will be used by later ChainOps services such as PostgreSQL and the control plane.

## Clone the Repository

```bash
git clone https://github.com/Yes-sir404/chainops-ai.git
cd chainops-ai
```

Verify the repository:

```bash
git status
```

## Repository Structure

The main repository structure is:

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
│   ├── architecture.md
│   └── development.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
└── .env.example
```

The current v0.1.0 workflow mainly uses:

```text
packages/contracts
packages/mcp-server
```

## Verify Required Tools

Check that the required tools are available:

```bash
git --version
deno --version
forge --version
docker --version
docker compose version
```

The current MCP workflow requires both `deno` and `forge` to be available on `PATH`.

## Validate the Solidity Workspace

Move into the contracts package:

```bash
cd packages/contracts
```

Check Solidity formatting:

```bash
forge fmt --check
```

Build the contracts:

```bash
forge build
```

Run the Foundry unit tests:

```bash
forge test -vv
```

The current ChainOps test fixture should report:

```text
3 passed
0 failed
```

Return to the repository root:

```bash
cd ../..
```

## Configure the MCP Server

Move into the MCP server package:

```bash
cd packages/mcp-server
```

Configure the ChainOps workspace and process timeouts:

```bash
export CHAINOPS_WORKSPACE_ROOT="../contracts"
export CHAINOPS_COMPILE_TIMEOUT_MS=60000
export CHAINOPS_TEST_TIMEOUT_MS=120000
```

### CHAINOPS_WORKSPACE_ROOT

Defines the filesystem boundary inside which ChainOps MCP tools are allowed to execute.

For local development:

```bash
export CHAINOPS_WORKSPACE_ROOT="../contracts"
```

Paths outside this workspace are rejected before Foundry is executed.

### CHAINOPS_COMPILE_TIMEOUT_MS

Maximum duration allowed for a Foundry compilation process:

```bash
export CHAINOPS_COMPILE_TIMEOUT_MS=60000
```

The current default is 60 seconds.

### CHAINOPS_TEST_TIMEOUT_MS

Maximum duration allowed for a Foundry test process:

```bash
export CHAINOPS_TEST_TIMEOUT_MS=120000
```

The current default is 120 seconds.

## Start the MCP Server

From `packages/mcp-server`:

```bash
deno task start
```

Expected startup output:

```text
ChainOps MCP server v0.1.0 running over stdio
```

The process then remains running because the server is waiting for MCP protocol traffic over stdio.

Use:

```text
Ctrl+C
```

to stop the server.

## Available MCP Tools

The current MCP server exposes:

```text
compile_contract
run_unit_tests
```

### compile_contract

`compile_contract` executes a restricted Foundry compilation:

```text
compile_contract
      |
      v
forge build
```

Example input:

```json
{
  "projectPath": "../contracts",
  "force": false
}
```

### run_unit_tests

`run_unit_tests` executes the Foundry unit-test suite:

```text
run_unit_tests
      |
      v
forge test
```

Example input:

```json
{
  "projectPath": "../contracts"
}
```

Both tools return structured execution information including:

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

Neither tool exposes arbitrary shell execution.

## Validate the MCP Package

From `packages/mcp-server`, type-check the server:

```bash
deno task check
```

Run the linter:

```bash
deno lint
```

Check formatting:

```bash
deno fmt --check src tests deno.json
```

Run the automated MCP integration tests:

```bash
deno task test
```

The current integration suite verifies:

- MCP tool discovery
- successful contract compilation
- successful Foundry unit-test execution
- workspace path rejection
- Solidity compilation failure handling
- Foundry test failure handling

A successful run should report:

```text
6 passed
0 failed
```

## Complete Local Validation

Before opening a pull request, validate the MCP package:

```bash
cd packages/mcp-server

deno task check
deno lint
deno fmt --check src tests deno.json
deno task test
```

Then validate the Solidity workspace:

```bash
cd ../contracts

forge fmt --check
forge build
forge test -vv
```

All checks should complete successfully before code is merged.

## Environment File

The repository root contains:

```text
.env.example
```

Current development values include:

```env
POSTGRES_DB=chainops
POSTGRES_USER=chainops
POSTGRES_PASSWORD=chainops_dev
POSTGRES_PORT=5432

CHAINOPS_WORKSPACE_ROOT=../contracts
CHAINOPS_COMPILE_TIMEOUT_MS=60000
CHAINOPS_TEST_TIMEOUT_MS=120000
```

The PostgreSQL variables will be used by later ChainOps services.

For the current MCP workflow, export the `CHAINOPS_*` variables before starting the server.

## Continuous Integration

ChainOps uses GitHub Actions for continuous integration.

The workflow is defined in:

```text
.github/workflows/ci.yml
```

CI runs automatically on:

- pull requests
- pushes to `main`

The workflow contains two validation jobs.

### MCP Validation

The MCP validation job:

```text
Checkout repository
      ↓
Setup Deno
      ↓
Install Foundry
      ↓
Deno type check
      ↓
Deno lint
      ↓
Deno format check
      ↓
MCP integration tests
```

### Contracts Validation

The contracts validation job:

```text
Checkout repository
      ↓
Install Foundry
      ↓
Solidity format check
      ↓
Foundry build
      ↓
Foundry unit tests
```

A pull request should only be merged when both CI jobs pass.

## Security Properties

The current MCP execution layer includes the following safety boundaries:

- no arbitrary shell command parameter
- Foundry project paths restricted to an allowed workspace
- workspace escape and path traversal rejection
- compilation timeout
- test execution timeout
- structured MCP input validation
- structured MCP output
- execution failures returned as tool errors
- MCP protocol stdout separated from diagnostic logging

## Troubleshooting

### forge: command not found

Verify that Foundry is installed:

```bash
forge --version
```

If the command is unavailable, install Foundry and ensure `forge` is available on `PATH`.

### deno: command not found

Verify that Deno is installed:

```bash
deno --version
```

Ensure the Deno executable is available on `PATH`.

### Path outside the allowed ChainOps workspace

If a tool returns:

```text
Path is outside the allowed ChainOps workspace
```

verify that the requested project path resolves inside:

```bash
export CHAINOPS_WORKSPACE_ROOT="../contracts"
```

For the current development setup, the expected workspace is:

```text
packages/contracts
```

### MCP server appears to stay open

This is expected.

After:

```text
ChainOps MCP server v0.1.0 running over stdio
```

the server waits for MCP client traffic over stdio.

Use:

```text
Ctrl+C
```

to stop it.

### Deno exports warning

Deno may currently display:

```text
Warning "exports" field should be specified when specifying a "name".
```

This warning is non-blocking for the current v0.1.0 workflow.

It does not prevent:

- type checking
- linting
- formatting validation
- MCP integration tests
- CI validation

### Foundry generated files

Foundry generates directories such as:

```text
out/
cache/
```

These are build artifacts and are ignored by Git.

## Development Workflow

The recommended contribution workflow is:

```text
Issue
  ↓
Branch
  ↓
Implementation
  ↓
Local validation
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
GitHub Actions CI
  ↓
Review
  ↓
Merge
```

Do not merge changes into `main` when CI checks are failing.