# ChainOps AI Architecture

## Core boundary

ChainOps deliberately separates four responsibilities:

1. **Reasoning** — agents decide what should happen next.
2. **Tool execution** — MCP tools perform explicitly allowed operations.
3. **Workflow control** — the control plane persists state and applies retry/policy rules.
4. **Authorization** — transaction signing/deployment is gated independently from the LLM.

## Sprint 1

```text
MCP Client / Inspector
        |
        v
ChainOps MCP Server
        |
        +-- compile_contract
                |
                v
             forge build
                |
                v
        Foundry workspace
```

`compile_contract` is constrained to `CHAINOPS_WORKSPACE_ROOT` and does not accept arbitrary commands.
