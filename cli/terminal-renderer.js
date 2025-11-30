// terminal-renderer.js
import readline from "node:readline";
import Table from "cli-table3";
import pc from "picocolors";

let lastRender = 0;

export function renderTerminal(update) {
  const now = Date.now();
  if (now - lastRender < 500) return;
  lastRender = now;

  const stats = update || {};

  const total = stats.total ?? 0;
  const success = stats.success ?? 0;
  const failure = stats.failure ?? 0;

  const successRate =
    total > 0 ? ((success / total) * 100).toFixed(2) : "0.00";

  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  console.log(pc.bold(pc.blue("🚀 LOADLY Running Test...\n")));

  const table = new Table({
    head: [pc.cyan("Metric"), pc.cyan("Value")]
  });

  table.push(
    ["Requests Sent", pc.green(total)],
    ["Requests/sec", pc.yellow((stats.rps ?? 0).toFixed(2))],
    ["Avg Latency", pc.magenta((stats.avg ?? 0).toFixed(2) + " ms")],
    ["P95", pc.magenta((stats.p95 ?? 0).toFixed(2) + " ms")],
    ["Errors", failure > 0 ? pc.red(failure) : pc.green("0")],
    ["Success Rate", pc.green(successRate + "%")]
  );

  console.log(table.toString());
}
