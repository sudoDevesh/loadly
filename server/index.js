import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import pc from "picocolors";
import open from "open";
import { runLoadTest } from "../core/engine.js";
import { parseClientConfig } from "./ws-schema.js";
import { renderTerminal } from "../cli/terminal-renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

export async function createServerAndUI({ port = DEFAULT_PORT, openBrowser = false } = {}) {
  const app = express();

  // Serve built UI if present
  const uiDist = path.resolve(__dirname, "../ui/dist");
  app.use(express.static(uiDist));

  // Health check
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // SPA fallback to index.html so GET / works even if there are no direct file matches
  app.get("*", (req, res, next) => {
    if (req.accepts("html")) {
      const indexPath = path.join(uiDist, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) next();
      });
    } else {
      next();
    }
  });

  const server = app.listen(port, () => {
    console.log(pc.green(`\nLoadly UI: ${pc.bold(`http://localhost:${port}`)}`));
    console.log(pc.dim(`Serving static UI from: ${uiDist}`));
  });

  // WebSocket for control + telemetry
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    // Greet client
    ws.send(JSON.stringify({ type: "hello", data: { version: "0.1.0" } }));

    ws.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
        return;
      }

      if (msg.type === "start") {
        let config;
        try {
          config = parseClientConfig(msg.data);
        } catch (e) {
          ws.send(JSON.stringify({ type: "error", error: e.message }));
          return;
        }

        const controller = new AbortController();
        ws.on("close", () => controller.abort());

        try {
          const result = await runLoadTest(
            config,
            (update) => {
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: "update", data: update }));
              }
              renderTerminal(update);
            },
            controller.signal
          );

          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: "result", data: result }));
          }
        } catch (e) {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: "error", error: e.message }));
          }
        }
      }
    });
  });

  if (openBrowser) {
    try {
      await open(`http://localhost:${port}`);
    } catch (e) {
      console.log(pc.yellow(`Could not auto-open browser: ${e.message}`));
    }
  }

  return { app, server };
}

// Allow `node server/index.js --dev`
if (process.argv.includes("--dev")) {
  createServerAndUI({ openBrowser: true }).catch((e) => {
    console.error("Failed to start server:", e);
    process.exit(1);
  });
}
