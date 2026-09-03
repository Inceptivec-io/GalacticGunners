import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.GG_RUNTIME_URL ?? "http://localhost:3002";
const testedSha = process.env.GG_TESTED_SHA ?? "UNSPECIFIED";
const outputDir = path.resolve(
  process.env.GG_EVIDENCE_DIR ??
    "docs/evidence/navigation-and-pause",
);
mkdirSync(outputDir, { recursive: true });

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function qaState(page) {
  return page.evaluate(() => window.__GALACTIC_GUNNERS_SLICE_QA__);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-gpu", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  hasTouch: true,
  isMobile: true,
});
const consoleErrors = [];
const networkFailures = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("requestfailed", (request) =>
  networkFailures.push(`FAILED ${request.url()}`),
);
page.on("response", (response) => {
  if (response.status() >= 400)
    networkFailures.push(`${response.status()} ${response.url()}`);
});

try {
  await page.goto(`${baseUrl}/play?qa=diagnostics`, {
    waitUntil: "domcontentloaded",
    timeout: 15_000,
  });
  await page.waitForSelector("canvas", { timeout: 10_000 });
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_SPLASH_QA__?.scene === "SplashScene",
    { timeout: 15_000 },
  );
  const splash = await page.evaluate(
    () => window.__GALACTIC_GUNNERS_SPLASH_QA__,
  );
  await page.screenshot({
    path: path.join(outputDir, "01-governed-launch-splash.png"),
    fullPage: true,
  });
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === "MainMenuScene",
    { timeout: 5_000 },
  );
  const splashDuration = await page.evaluate(
    (startedAt) => window.__GALACTIC_GUNNERS_MENU_QA__.createdAt - startedAt,
    splash.startedAt,
  );
  assert(
    splash.durationMs === 4_000 &&
      splashDuration >= 3_700 &&
      splashDuration <= 5_400,
    `Splash duration ${splashDuration}ms is not a four-second launch hold.`,
  );
  const menu = await page.evaluate(() => window.__GALACTIC_GUNNERS_MENU_QA__);
  assert(
    menu?.heroKeyArt ===
      "GG-KEYART-KEY-ART-POSTERS-GG-HERO-IMAGE-PLAYER-FIGHTING-V002-4K-UHD-MASTER",
    "Main menu does not use approved hero key art after splash.",
  );
  const focusedCanvas = await page.evaluate(
    () => document.activeElement?.tagName === "CANVAS",
  );
  assert(
    focusedCanvas,
    "Splash completion did not restore keyboard focus to the game canvas.",
  );

  // Launch presentation is verified above in the ordinary browser flow.
  // Use the deterministic runtime harness for the interactive pause contract
  // so this check does not depend on an unrelated campaign-release request.
  await page.goto(`${baseUrl}/play?qa=hostile`, {
    waitUntil: "domcontentloaded",
    timeout: 15_000,
  });
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === "MainMenuScene",
    { timeout: 8_000 },
  );
  await page.locator("canvas").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_SLICE_QA__?.scene === "Level1Scene",
    { timeout: 8_000 },
  );
  const beforePause = await qaState(page);
  await page.keyboard.press("p");
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_PAUSE_QA__?.scene === "PauseScene",
    { timeout: 5_000 },
  );
  const pause = await page.evaluate(() => window.__GALACTIC_GUNNERS_PAUSE_QA__);
  await page.screenshot({
    path: path.join(outputDir, "02-pause-actions-visible.png"),
    fullPage: true,
  });
  assert(
    pause?.backdrop?.texture === "translucent-overlay" &&
      pause.backdrop.alpha > 0 &&
      pause.backdrop.alpha < 1,
    `Pause backdrop is not translucent: ${JSON.stringify(pause?.backdrop)}`,
  );
  assert(
    ["RESUME", "RESTART", "MAIN MENU"].every((label) =>
      pause.visibleTexts.includes(label),
    ),
    "Pause actions are incomplete.",
  );
  await page.waitForTimeout(650);
  const frozen = await qaState(page);
  assert(
    Math.abs(frozen.playerX - beforePause.playerX) <= 1 &&
      Math.abs(frozen.playerY - beforePause.playerY) <= 1 &&
      frozen.score === beforePause.score &&
      frozen.lives === beforePause.lives &&
      frozen.formationDropY === beforePause.formationDropY,
    "Gameplay changed while paused.",
  );

  const canvas = await page.locator("canvas").boundingBox();
  const resume = pause.actions.find((action) => action.action === "resume");
  assert(canvas && resume, "Pause Resume touch target is unavailable.");
  await page.touchscreen.tap(
    canvas.x + (resume.x * canvas.width) / pause.viewport.width,
    canvas.y + (resume.y * canvas.height) / pause.viewport.height,
  );
  await page.waitForFunction(
    () =>
      !window.__GALACTIC_GUNNERS_PAUSE_QA__ &&
      window.__GALACTIC_GUNNERS_SLICE_QA__?.scene === "Level1Scene",
    { timeout: 5_000 },
  );
  await page.waitForTimeout(300);
  await page.locator("canvas").focus();
  await page.keyboard.press("p");
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_PAUSE_QA__?.scene === "PauseScene",
    { timeout: 5_000 },
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () =>
      !window.__GALACTIC_GUNNERS_PAUSE_QA__ &&
      window.__GALACTIC_GUNNERS_SLICE_QA__?.scene === "Level1Scene",
    { timeout: 5_000 },
  );

  await page.waitForTimeout(300);
  await page.locator("canvas").focus();
  await page.keyboard.press("p");
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_PAUSE_QA__?.scene === "PauseScene",
    { timeout: 5_000 },
  );
  await page.keyboard.press("m");
  await page.waitForFunction(
    () => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === "MainMenuScene",
    { timeout: 5_000 },
  );
  assert(
    !(await page.evaluate(() => Boolean(window.__GALACTIC_GUNNERS_PAUSE_QA__))),
    "Pause surface remained after Main Menu navigation.",
  );
  await page.waitForTimeout(2_300);
  assert(
    await page.evaluate(
      () => window.__GALACTIC_GUNNERS_MENU_QA__?.scene === "MainMenuScene",
    ),
    "Splash reappeared during internal navigation.",
  );

  assert(
    consoleErrors.length === 0,
    `Console errors: ${consoleErrors.join(" | ")}`,
  );
  assert(
    networkFailures.length === 0,
    `Network failures: ${networkFailures.join(" | ")}`,
  );
  const result = {
    tested_sha: testedSha,
    base_url: baseUrl,
    generated_at: new Date().toISOString(),
    splash_four_seconds: true,
    splash_focus_restored: true,
    pause_freezes_gameplay: true,
    pause_touch_resume: true,
    pause_keyboard_resume: true,
    pause_main_menu_navigation: true,
    splash_not_repeated_on_internal_navigation: true,
    console_errors: consoleErrors,
    network_failures: networkFailures,
    result: "PASS",
  };
  writeFileSync(
    path.join(outputDir, "navigation-and-pause-verification.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
