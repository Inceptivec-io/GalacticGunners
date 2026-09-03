import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const baseURL = process.env.GG_RUNTIME_URL ?? "http://localhost:3002";
const captureRuntimeEvidence = process.env.GG_RUNTIME_EVIDENCE === "1";
const outputDir = process.env.GG_PLAYWRIGHT_OUTPUT_DIR ?? "test-results";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  // Runtime evidence is fail-closed: a retry would conceal a first-attempt race.
  retries: 0,
  reporter: [
    ["list"],
    ["junit", { outputFile: path.join(outputDir, "playwright-junit.xml") }],
  ],
  outputDir,
  use: {
    baseURL,
    trace: captureRuntimeEvidence ? "on" : "on-first-retry",
    video: captureRuntimeEvidence ? "on" : "retain-on-failure",
    screenshot: captureRuntimeEvidence ? "on" : "only-on-failure",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
    { name: "chromium-mobile-touch", use: { ...devices["Pixel 7"] } },
    { name: "chromium-tablet-touch", use: { ...devices["iPad (gen 7)"] } },
  ],
  timeout: 30_000,
});
