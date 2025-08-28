# Loadly ⚡

Modern, lightweight API load testing with a local React UI. Install globally, run a single command, configure endpoints in the browser, and watch live analytics stream in.

* Install: npm i -g loadly (or npm i -g @sudoDevesh/loadly if using a scoped name)
* Run: loadly run
* UI: http://localhost:3000 (auto-opens)
* Requires: Node.js 18+

---

## 📽️ Demo Video

[![Watch the demo](https://cdn.sanity.io/images/9tcahs1q/production/7e43866807c0af93dd1c9679bd011452c3b39628-1280x720.png?w=2000&fit=max&auto=format)](https://youtu.be/SgiNto-QxrM)


## Why Loadly?

Most load-testing tools force a choice:

* Powerful but config-heavy scripts and CLIs
* Or pretty UIs that are slow to set up and hard to automate

Loadly blends both:

* Single command startup
* Zero config to get going
* Intuitive UI for defining scenarios
* Real-time metrics without cloud accounts or agents
* 100% local: data never leaves the machine

Think “Postman + k6, but simpler, prettier, and developer-friendly.” Define endpoints and headers like in Postman; hit Run and get live charts and percentiles like k6—without a learning curve.

---

## What You Get

* One command to launch: loadly run
* Local web UI for configuration and dashboards
* Multiple endpoints per test with weights and JSON bodies
* Simple templating: {{uuid}}, {{timestamp}}, {{randint:min,max}}
* Live metrics: RPS, success/failure, p95 latency, memory usage, status code breakdown
* Final JSON summary for copy/paste or export
* Runs entirely on the local machine (no external services)

---

## Target Audience

* Solo devs / indie hackers who want quick API load tests
* Startups / small teams who don’t want to set up JMeter/k6
* Open-source developers who value a simple, pretty, developer-first tool



## Quick Start

1. Install (Node 18+)

* npm i -g loadly

2. Run

* loadly run

3. Configure in UI

* Concurrency: number of virtual users (e.g., 20)
* Duration: seconds to run (e.g., 30)
* Headers (JSON): e.g., { "Content-Type": "application/json" }
* Endpoints (JSON array), example:
  \[
  { "url": "https://httpbin.org/get", "method": "GET", "weight": 2 },
  { "url": "https://httpbin.org/post", "method": "POST", "body": { "id": "{{uuid}}", "ts": "{{timestamp}}" } }
  ]

4. Click “Start Testing” and watch live metrics. A final summary appears when complete.

Tip: Test a local API at http://localhost:4000 and mix fast, slow, flaky, and 404 endpoints to exercise the dashboard.

---

## How Loadly Calculates “How Many Requests?”

Loadly is time-bound, not count-bound:

* Concurrency sets parallel workers
* Duration sets how long they run
* Throughput emerges from endpoint latency, failures, and network conditions

Total requests ≈ throughput (RPS) × duration. Increase concurrency for more pressure; increase duration for steadier percentile estimates.

---

## Feature Highlights

* Multiple endpoints with weights
* JSON bodies + templating:

  * {{uuid}} — random UUID per request
  * {{timestamp}} — epoch ms at send time
  * {{randint:a,b}} — integer within \[a, b]

* Live dashboard:

  * Total, Success, Failures
  * RPS (requests per second)
  * Avg and p95 latency (ms)
  * Memory (RSS/Heap)
  * Status code distribution

* Abort on UI close (tests stop when the tab/socket closes)
* Final JSON summary for logs or export

---

## Architecture Overview

* CLI: launches a local server and opens the browser
* Backend: Express + WebSocket for control and telemetry
* Engine: Node-based HTTP runner with templating and weighted endpoint selection
* Frontend: React app served statically; connects via WebSocket for live updates

Everything is self-contained and local—no databases or external services.

---

## Developer Ergonomics

* One-command start, zero boilerplate
* JSON-based configuration with live feedback
* Clear error messages on invalid input
* Works with any HTTP API—REST, JSON-RPC, GraphQL over HTTP, internal services
* Port override: set PORT=8080 loadly run

---

## Install and Run

* Global install:

  * npm i -g loadly

* Launch:

  * loadly run

* Custom port:

  * PORT=8080 loadly run

* Health check:

  * http://localhost:3000/health → { "ok": true }

Requires Node.js 18+.

---

## Troubleshooting

* “Cannot GET /”

  * Build artifacts missing: ensure the UI is being served from ui/dist. If developing from source, rebuild the UI.

* WebSocket not updating

  * Ensure the CLI is running and the UI is opened from the same host/port (localhost:3000). If using a separate UI dev server, point WS to the backend port or open the built UI.

* fetch is not defined

  * Requires Node 18+ (engine uses global fetch).

---

## Contributing

* Fork the repo and clone locally
* Install root and UI dependencies, then build the UI
* Start in dev:

  * npm run dev

* UI live dev:

  * cd ui \&\& npm run dev (Vite @ 5173)

Please open issues for bugs, feature requests, or ideas. PRs welcome.

---

## License

MIT

---

## Philosophy

* Minimal setup, maximal feedback
* Local-first by default (privacy-friendly)
* Human-friendly UI with developer-focused power
* Designed to scale with the developer’s needs—from a smoke test to iterative performance tuning

Loadly replaces “spin up a toolchain” friction with a simple flow: run a command, paste endpoints, click Run, and learn fast.

