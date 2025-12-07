import { jest } from "@jest/globals";
import { _test, runLoadTest } from "../../core/engine.js";

const { fillTemplate, pickWeighted } = _test;

describe("runLoadTest", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("counts success responses and tracks endpoints", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    const updates = [];
    const config = {
      endpoints: [{ url: "http://x", method: "GET" }],
      headers: {},
      duration: 0.1, // 100ms
      concurrency: 1,
      rampUp: 0,    
    };

    const result = await runLoadTest(config, (u) => updates.push(u));

    expect(result.success).toBeGreaterThan(0);
    expect(result.failure).toBe(0);
    expect(result.codes[200]).toBe(result.total);
    expect(updates.length).toBeGreaterThan(0);

    // ✅ Verify endpoints are tracked
    expect(result.endpoints).toEqual([{ url: "http://x", method: "GET" }]);
  });

  test("counts failure responses (non-OK status) and tracks endpoints", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const config = {
      endpoints: [{ url: "http://x" }],
      duration: 0.1,
      concurrency: 1,
      rampUp: 0,  
    };

    const result = await runLoadTest(config, () => {});

    expect(result.success).toBe(0);
    expect(result.failure).toBeGreaterThan(0);
    expect(result.codes[500]).toBe(result.total);

    // Endpoint tracking
    expect(result.endpoints).toEqual([{ url: "http://x", method: undefined }]);
  });

  test("counts fetch error as ERR and tracks endpoints", async () => {
    fetchMock.mockRejectedValue(new Error("boom"));

    const config = {
      endpoints: [{ url: "http://x" }],
      duration: 0.1,
      concurrency: 1,
      rampUp: 0, 
    };

    const result = await runLoadTest(config, () => {});

    expect(result.failure).toBeGreaterThan(0);
    expect(result.codes.ERR).toBe(result.total);
    expect(result.endpoints).toEqual([{ url: "http://x", method: undefined }]);
  });

  test("respects abortSignal and tracks endpoints", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    const abortController = new AbortController();
    const config = {
      endpoints: [{ url: "http://x" }],
      duration: 1, // 1 second
      concurrency: 1,
      rampUp: 0,  
    };

    const promise = runLoadTest(config, () => {}, abortController.signal);

    // Abort after ~100ms
    setTimeout(() => abortController.abort(), 100);

    const result = await promise;

    expect(result.total).toBeGreaterThan(0);
    expect(result.elapsedSec).toBeLessThan(1.5);
    expect(result.endpoints).toEqual([{ url: "http://x", method: undefined }]);
  });

  test("aggregates latency metrics and tracks endpoints", async () => {
    fetchMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, status: 200 }), 10))
    );

    const config = {
      endpoints: [{ url: "http://x" }],
      duration: 0.2,
      concurrency: 1,
      rampUp: 0, 
    };

    const result = await runLoadTest(config, () => {});

    expect(result.avg).toBeGreaterThan(0);
    expect(result.p95).toBeGreaterThan(0);
    expect(result.codes[200]).toBe(result.total);
    expect(result.endpoints).toEqual([{ url: "http://x", method: undefined }]);
  });
});

describe("fillTemplate", () => {
  test("replaces {{timestamp}} with current time", () => {
    const result = fillTemplate("time={{timestamp}}");
    expect(result).toMatch(/^time=\d{13}$/);
  });

  test("replaces {{uuid}} with a UUID", () => {
    const result = fillTemplate("id={{uuid}}");
    expect(result).toMatch(/^id=[0-9a-f-]{36}$/);
  });

  test("replaces {{randint:a,b}} with number in range", () => {
    const result = fillTemplate("n={{randint:5,10}}");
    const n = Number(result.replace("n=", ""));
    expect(n).toBeGreaterThanOrEqual(5);
    expect(n).toBeLessThanOrEqual(10);
  });

  test("recursively fills objects and arrays", () => {
    const input = {
      x: "{{randint:1,1}}",
      arr: ["{{uuid}}", "{{timestamp}}"],
    };
    const result = fillTemplate(input);
    expect(result.x).toBe("1");
    expect(result.arr[0]).toMatch(/[0-9a-f-]{36}/);
    expect(result.arr[1]).toMatch(/\d{13}/);
  });

  test("returns null/undefined unchanged", () => {
    expect(fillTemplate(null)).toBeNull();
    expect(fillTemplate(undefined)).toBeUndefined();
  });
});

describe("pickWeighted", () => {
  test("picks element with higher weight more often", () => {
    const endpoints = [
      { url: "a", weight: 1 },
      { url: "b", weight: 10 },
    ];

    let countA = 0;
    let countB = 0;
    for (let i = 0; i < 500; i++) {
      const ep = pickWeighted(endpoints);
      if (ep.url === "a") countA++;
      else if (ep.url === "b") countB++;
    }

    expect(countB).toBeGreaterThan(countA);
  });

  test("returns last endpoint if no earlier return", () => {
    const endpoints = [{ url: "a" }];
    const ep = pickWeighted(endpoints);
    expect(ep.url).toBe("a");
  });
});
