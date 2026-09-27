export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

const decoder = new TextDecoder();

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<CommandResult> {
  const startedAt = performance.now();

  const child = new Deno.Command(command, {
    args,
    cwd,
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    try {
      child.kill("SIGKILL");
    } catch {
      // Process may have already exited.
    }
  }, timeoutMs);

  try {
    const output = await child.output();
    return {
      exitCode: output.code,
      stdout: decoder.decode(output.stdout),
      stderr: decoder.decode(output.stderr),
      durationMs: Math.round(performance.now() - startedAt),
      timedOut,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
