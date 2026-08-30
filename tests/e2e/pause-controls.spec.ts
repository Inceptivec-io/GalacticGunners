import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

async function startGameplay(page: import("@playwright/test").Page) {
  await page.goto("/play");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );
  await holdKeyUntilStatus(page, "Space", "Galactic Gunners gameplay started.");
}

async function holdKeyUntilStatus(
  page: import("@playwright/test").Page,
  key: string,
  expected: string | RegExp,
) {
  await page.locator(".game-canvas-host canvas").focus();
  await page.keyboard.down(key);
  try {
    await expect(page.locator("[data-game-status]")).toHaveText(expected);
  } finally {
    await page.keyboard.up(key);
  }
}

test("H015-PAUSE-001__e2e_ordinary_user__keyboard_pause_and_resume_preserve_playable_runtime", async ({
  page,
  strictRuntime,
}) => {
  await startGameplay(page);
  await holdKeyUntilStatus(page, "KeyP", /Galactic Gunners paused/);
  await holdKeyUntilStatus(page, "KeyP", "Galactic Gunners gameplay started.");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "splash-navigation",
    route: "/play",
    actions: [
      "Started ordinary gameplay.",
      "Pressed P to pause.",
      "Pressed P to resume.",
    ],
    assertions: [
      "The paused state resumed to the playable Shooter without losing the runtime.",
    ],
  });
});

test("H015-PAUSE-002__e2e_ordinary_user_negative__repeated_pause_resume_does_not_leave_a_black_or_lost_runtime", async ({
  page,
  strictRuntime,
}) => {
  await startGameplay(page);
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await holdKeyUntilStatus(page, "KeyP", /Galactic Gunners paused/);
    await holdKeyUntilStatus(
      page,
      "Escape",
      "Galactic Gunners gameplay started.",
    );
  }
  await expect(page.locator(".game-canvas-host canvas")).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "splash-navigation",
    route: "/play",
    actions: [
      "Repeated visible keyboard pause and resume controls three times.",
    ],
    assertions: [
      "The game canvas remained visible and playable after repeated state transitions.",
    ],
  });
});
