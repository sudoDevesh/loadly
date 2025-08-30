import { jest } from "@jest/globals";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to CLI (bin/cli.js in project root)
const CLI_PATH = path.resolve(__dirname, "../../bin/cli.js");

// Mock server/index.js correctly (relative to project root, not __tests__)
jest.unstable_mockModule("../../server/index.js", () => ({
  createServerAndUI: jest.fn(),
}));

describe("Loadly CLI", () => {
  let createServerAndUI;
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(async () => {
    jest.resetModules();

    ({ createServerAndUI } = await import("../../server/index.js"));

    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should call createServerAndUI on 'run'", async () => {
    process.argv = ["node", "cli", "run"];
    await import(pathToFileURL(CLI_PATH).href);

    expect(createServerAndUI).toHaveBeenCalledWith({ openBrowser: true });
  });

  test("should print help on 'help'", async () => {
    process.argv = ["node", "cli", "help"];
    await import(pathToFileURL(CLI_PATH).href);

    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/Usage:/));
  });

  test("should exit with error on unknown command", async () => {
    process.argv = ["node", "cli", "unknown"];
    await import(pathToFileURL(CLI_PATH).href);

    expect(errorSpy).toHaveBeenCalledWith("Unknown command: unknown");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  test("should handle errors from main().catch", async () => {
    process.argv = ["node", "cli", "run"];

    // Force createServerAndUI to reject
    createServerAndUI.mockRejectedValueOnce(new Error("boom"));

    await import(pathToFileURL(CLI_PATH).href);

    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
