import crypto from "node:crypto";
import { performance } from "node:perf_hooks";

export function fillTemplate(value) {
  if (value == null) return value;
  const replaceInString = (s) =>
    s
      .replace(/\{\{timestamp\}\}/g, String(Date.now()))
      .replace(/\{\{uuid\}\}/g, crypto.randomUUID())
      .replace(/\{\{randint:(-?\d+),(-?\d+)\}\}/g, (_, a, b) => {
        const min = parseInt(a, 10),
          max = parseInt(b, 10);
        return String(Math.floor(Math.random() * (max - min + 1)) + min);
      });
  if (typeof value === "string") return replaceInString(value);
  if (Array.isArray(value)) return value.map(fillTemplate);
  if (typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value)) out[k] = fillTemplate(value[k]);
    return out;
  }
  return value;
}

export function pickWeighted(endpoints) {
  const sum = endpoints.reduce((a, e) => a + (e.weight || 1), 0);
  let r = Math.random() * sum;
  for (const e of endpoints) {
    r -= e.weight || 1;
    if (r <= 0) return e;
  }
  return endpoints[endpoints.length - 1];
}

export async function runLoadTest(config, onUpdate, abortSignal) {
  const { endpoints, headers, duration, concurrency, rampUp = 0 } = config;
  const tStart = Date.now();
  const tEnd = tStart + duration * 1000;

  const stats = { total: 0, success: 0, failure: 0, times: [], codes: {} };

  const sendUpdate = () => {
    const elapsed = (Date.now() - tStart) / 1000;
    const count = stats.times.length || 1;
    const avg = stats.times.reduce((a, b) => a + b, 0) / count;
    const sorted = stats.times.slice().sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const mem = process.memoryUsage();
    onUpdate({
      total: stats.total,
      success: stats.success,
      failure: stats.failure,
      rps: stats.total / Math.max(elapsed, 0.001),
      avg,
      p95,
      memory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal },
      elapsedSec: elapsed,
      codes: stats.codes,
    });
  };

  async function oneRequest() {
    const ep = pickWeighted(endpoints);
    const finalHeaders = { ...(headers || {}), ...(ep.headers || {}) };
    const body = ep.body !== undefined ? fillTemplate(ep.body) : undefined;
    const init = {
      method: ep.method || "GET",
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };
    const t0 = performance.now();
    try {
      const res = await fetch(ep.url, init);
      const dt = performance.now() - t0;
      stats.times.push(dt);
      stats.total++;
      stats.codes[res.status] = (stats.codes[res.status] || 0) + 1;
      if (res.ok) stats.success++;
      else stats.failure++;
    } catch (e) {
      const dt = performance.now() - t0;
      stats.times.push(dt);
      stats.total++;
      stats.codes["ERR"] = (stats.codes["ERR"] || 0) + 1;
      stats.failure++;
    }
  }

  let lastUpdate = 0;
  async function worker() {
    while (Date.now() < tEnd && !(abortSignal?.aborted)) {
      await oneRequest();
      const now = Date.now();
      if (now - lastUpdate > 250) {
        lastUpdate = now;
        sendUpdate();
      }
    }
  }
  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    const delay = rampUp > 0 ? (rampUp * 1000 * i) / concurrency : 0;
    workers.push(
      (async () => {
        if (delay > 0) await new Promise((res) => setTimeout(res, delay));
        await worker();
      })()
    );
  }
  await Promise.all(workers);
  //await Promise.all(Array.from({ length: concurrency }, () => worker()));
  sendUpdate();

  const elapsed = (Date.now() - tStart) / 1000;
  const avg = stats.times.length ? stats.times.reduce((a, b) => a + b, 0) / stats.times.length : 0;
  const sorted = stats.times.slice().sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const mem = process.memoryUsage();

  return {
    total: stats.total,
    success: stats.success,
    failure: stats.failure,
    rps: stats.total / Math.max(elapsed, 0.001),
    avg,
    p95,
    memory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal },
    elapsedSec: elapsed,
    codes: stats.codes,
  };
}

// helper export for testing
export const _test = { fillTemplate, pickWeighted };
