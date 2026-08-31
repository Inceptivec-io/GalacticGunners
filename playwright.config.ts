import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.GG_RUNTIME_URL ?? "http://localhost:3002";
const captureRuntimeEvidence = process.env.GG_RUNTIME_EVIDENCE === "1";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["junit", { outputFile: "test-results/playwright-junit.xml" }],
  ],
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
