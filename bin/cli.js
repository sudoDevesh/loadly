#!/usr/bin/env node
import { createServerAndUI } from "../server/index.js";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const cmd = args[0] || "run";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to package.json
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const localVersion = pkg.version;

function getLatestVersion(pkgName) {
  try {
    return execSync(`npm view ${pkgName} version`).toString().trim();
  } catch {
    return null;
  }
}

async function main() {
  if (cmd === "-v" || cmd === "--version" || cmd === "version") {
    console.log(`Loadly CLI version: ${localVersion}`);

    const latest = getLatestVersion(pkg.name);
    if (!latest) {
      console.log("⚠️  Could not check latest version from npm.");
      return;
    }

    if (latest !== localVersion) {
      console.log(`\n🚀 A new version is available: ${latest}`);
      console.log(`👉 Update with:`);
      console.log(`   npm i -g ${pkg.name}@latest\n`);
    } else {
      console.log("\n👍 You are using the latest version!");
    }
    return;
  }

  if (cmd === "run") {
    await createServerAndUI({ openBrowser: true });
    return;
  }

  if (cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log(
      `
Loadly CLI

Usage:
  loadly run            Start the server and open the UI
  loadly -v | version   Show CLI version & update info
  loadly help           Show this help

Env:
  PORT=3000             Port to bind the UI and WebSocket
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
