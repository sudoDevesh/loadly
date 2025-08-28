#!/usr/bin/env node
import { createServerAndUI } from "../server/index.js";

const args = process.argv.slice(2);
const cmd = args[0] || "run";

async function main() {
  if (cmd === "run") {
    await createServerAndUI({ openBrowser: true });
    return;
  }

  if (cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log(
      `
Loadly CLI

Usage:
  loadly run        Start the server and open the UI
  loadly help       Show this help

Env:
  PORT=3000         Port to bind the UI and WebSocket
    `.trim()
    );
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
