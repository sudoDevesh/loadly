// Very light validation for incoming config
export function parseClientConfig(input) {
  const cfg = input || {};
  if (!Array.isArray(cfg.endpoints) || cfg.endpoints.length === 0) {
    throw new Error("'endpoints' must be a non-empty array");
  }
  const duration = Number(cfg.duration ?? 30);
  const concurrency = Number(cfg.concurrency ?? 10);
  if (!(duration > 0) || !(concurrency > 0)) {
    throw new Error("'duration' and 'concurrency' must be > 0");
  }
  const headers = cfg.headers && typeof cfg.headers === "object" ? cfg.headers : {};
  const endpoints = cfg.endpoints.map((e) => ({
    url: String(e.url),
    method: String(e.method || "GET").toUpperCase(),
    headers: e.headers && typeof e.headers === "object" ? e.headers : undefined,
    body: e.body !== undefined ? e.body : undefined,
    weight: Number(e.weight || 1)
  }));

  return { duration, concurrency, headers, endpoints };
}
