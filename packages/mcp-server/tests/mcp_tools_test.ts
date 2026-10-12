import assert from "node:assert/strict";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { createChainOpsServer } from "../src/server.ts";

Deno.test("MCP server exposes the expected tools", async () => {
  const server = await createChainOpsServer();

  const client = new Client({
    name: "chainops-test-client",
    version: "0.1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const { tools } = await client.listTools();

    const toolNames = tools
      .map((tool) => tool.name)
      .sort();

    assert.deepEqual(toolNames, [
      "compile_contract",
      "run_unit_tests",
    ]);
  } finally {
    await client.close();
    await server.close();
  }
});

Deno.test("compile_contract successfully compiles the Foundry fixture", async () => {
  const server = await createChainOpsServer();

  const client = new Client({
    name: "chainops-test-client",
    version: "0.1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "compile_contract",
      arguments: {
        projectPath: "../contracts",
        force: true,
      },
    });

    assert.equal(result.isError, false);

    const output = result.structuredContent as {
      success: boolean;
      exitCode: number;
      durationMs: number;
      timedOut: boolean;
      stdout: string;
      stderr: string;
    };

    assert.equal(output.success, true);
    assert.equal(output.exitCode, 0);
    assert.equal(output.timedOut, false);
    assert.ok(output.durationMs >= 0);
  } finally {
    await client.close();
    await server.close();
  }
});

Deno.test("run_unit_tests successfully runs the Foundry fixture", async () => {
  const server = await createChainOpsServer();

  const client = new Client({
    name: "chainops-test-client",
    version: "0.1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "run_unit_tests",
      arguments: {
        projectPath: "../contracts",
      },
    });

    assert.equal(result.isError, false);

    const output = result.structuredContent as {
      success: boolean;
      exitCode: number;
      durationMs: number;
      timedOut: boolean;
      stdout: string;
      stderr: string;
    };

    assert.equal(output.success, true);
    assert.equal(output.exitCode, 0);
    assert.equal(output.timedOut, false);
    assert.ok(output.durationMs >= 0);

    assert.ok(
      output.stdout.includes("ChainOpsExampleTest"),
      "expected Foundry to execute the permanent ChainOps test fixture",
    );
  } finally {
    await client.close();
    await server.close();
  }
});

Deno.test("run_unit_tests rejects paths outside the ChainOps workspace", async () => {
  const server = await createChainOpsServer();

  const client = new Client({
    name: "chainops-test-client",
    version: "0.1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "run_unit_tests",
      arguments: {
        projectPath: "..",
      },
    });

    assert.equal(result.isError, true);

    const output = result.structuredContent as {
      success: boolean;
      exitCode: number;
      durationMs: number;
      timedOut: boolean;
      stdout: string;
      stderr: string;
    };

    assert.equal(output.success, false);
    assert.equal(output.exitCode, -1);
    assert.equal(output.durationMs, 0);
    assert.equal(output.timedOut, false);
    assert.equal(output.stdout, "");

    assert.ok(
      output.stderr.includes("outside the allowed ChainOps workspace"),
      "expected workspace isolation error",
    );
  } finally {
    await client.close();
    await server.close();
  }
});

Deno.test("compile_contract reports Solidity compilation failures", async () => {
  const server = await createChainOpsServer();

  const client = new Client({
    name: "chainops-test-client",
    version: "0.1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "compile_contract",
      arguments: {
        projectPath: "../contracts/fixtures/broken-contract",
        force: true,
      },
    });

    assert.equal(result.isError, true);

    const output = result.structuredContent as {
      success: boolean;
      exitCode: number;
      durationMs: number;
      timedOut: boolean;
      stdout: string;
      stderr: string;
    };

    assert.equal(output.success, false);
    assert.notEqual(output.exitCode, 0);
    assert.equal(output.timedOut, false);
    assert.ok(output.durationMs >= 0);

    assert.ok(
      output.stdout.length > 0 || output.stderr.length > 0,
      "expected compiler diagnostics",
    );
  } finally {
    await client.close();
    await server.close();
  }
});

Deno.test("run_unit_tests reports failing Foundry tests", async () => {
  const server = await createChainOpsServer();

  const client = new Client({
    name: "chainops-test-client",
    version: "0.1.0",
  });

  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "run_unit_tests",
      arguments: {
        projectPath: "../contracts/fixtures/failing-tests",
      },
    });

    assert.equal(result.isError, true);

    const output = result.structuredContent as {
      success: boolean;
      exitCode: number;
      durationMs: number;
      timedOut: boolean;
      stdout: string;
      stderr: string;
    };

    assert.equal(output.success, false);
    assert.notEqual(output.exitCode, 0);
    assert.equal(output.timedOut, false);
    assert.ok(output.durationMs >= 0);

    assert.ok(
      output.stdout.includes("intentional test failure") ||
        output.stderr.includes("intentional test failure"),
      "expected Foundry test failure diagnostics",
    );
  } finally {
    await client.close();
    await server.close();
  }
});
