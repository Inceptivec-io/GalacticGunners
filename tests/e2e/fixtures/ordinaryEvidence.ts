import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Page, TestInfo } from "@playwright/test";

function safeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Stores evidence only after the normal Playwright journey has completed its
 * product-facing assertions. It deliberately has no scene, store, or API
 * shortcuts: callers provide the actions they actually performed.
 */
export async function captureOrdinaryJourney({
  page,
  testInfo,
  gate,
  route,
  actions,
  assertions,
}: {
  page: Page;
  testInfo: TestInfo;
  gate: string;
  route: string;
  actions: string[];
  assertions: string[];
}) {
  const root = process.env.GG_EVIDENCE_DIR;
  if (!root) return;

  const directory = path.join(root, "ordinary-browser", safeSegment(gate));
  const stem = safeSegment(testInfo.title);
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: path.join(directory, `${stem}.png`),
    fullPage: true,
  });
  await writeFile(
    path.join(directory, `${stem}.json`),
    `${JSON.stringify(
      {
        schema_version: "1.0",
        classification: "E2E_ORDINARY_USER",
        gate,
        route,
        tested_sha: process.env.GG_TESTED_SHA ?? null,
        test: testInfo.title,
        browser: testInfo.project.name,
        actions,
        assertions,
      },
      null,
      2,
    )}\n`,
  );
}
