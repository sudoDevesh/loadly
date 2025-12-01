import { jest } from "@jest/globals";
import { renderTerminal } from "../../cli/terminal-renderer.js";
import readline from "node:readline";

// 🎨 Disable ALL picocolors so tests read plain text
jest.mock("picocolors", () => ({
  bold: (x) => x,
  blue: (x) => x,
  cyan: (x) => x,
  green: (x) => x,
  yellow: (x) => x,
  magenta: (x) => x,
  red: (x) => x,
}));

describe("renderTerminal", () => {
  let logSpy;
  let cursorSpy;
  let clearSpy;
  let fakeNow;
  const advanceTime = (ms) => (fakeNow += ms);

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    cursorSpy = jest.spyOn(readline, "cursorTo").mockImplementation(() => {});
    clearSpy = jest
      .spyOn(readline, "clearScreenDown")
      .mockImplementation(() => {});

    // Fake clock
    fakeNow = 1000;
    jest.spyOn(Date, "now").mockImplementation(() => fakeNow);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getOutput = () => logSpy.mock.calls.join("\n");

  test("renders table with correct metrics", () => {
    advanceTime(600);

    renderTerminal({
      total: 10,
      success: 8,
      failure: 2,
      rps: 50.15,
      avg: 120.12,
      p95: 180.55,
    });

    const out = getOutput();
    expect(out).toContain("Requests Sent");
    expect(out).toContain("10");
    expect(out).toContain("8");
    expect(out).toContain("2");
  });

  test("does not render if called again within 500ms", () => {
    advanceTime(600);
    renderTerminal({ total: 1 });

    logSpy.mockClear();

    advanceTime(200);
    renderTerminal({ total: 2 });

    expect(logSpy).not.toHaveBeenCalled();
  });

  test("renders again after 500ms", () => {
    advanceTime(600);
    renderTerminal({ total: 1 });
    logSpy.mockClear();
    advanceTime(600);
    renderTerminal({ total: 2 });
    expect(logSpy).toHaveBeenCalled();
  });
});
