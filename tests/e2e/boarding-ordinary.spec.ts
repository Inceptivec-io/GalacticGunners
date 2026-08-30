import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

async function holdKeyUntilAnnouncement(
  page: import("@playwright/test").Page,
  key: string,
  expected: string | RegExp,
) {
  const canvas = page.locator(".game-canvas-host canvas");
  await canvas.focus();
  await page.keyboard.down(key);
  try {
    await expect(page.locator("[data-game-announcement]")).toHaveText(
      expected,
      {
        timeout: 12_000,
      },
    );
  } finally {
    await page.keyboard.up(key);
  }
}

async function startLevelFour(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );
  const canvas = page.locator(".game-canvas-host canvas");
  await canvas.focus();
  await page.keyboard.down("Space");
  try {
    await expect(page.locator("[data-game-status]")).toHaveText(
      "Galactic Gunners gameplay started.",
    );
  } finally {
    await page.keyboard.up("Space");
  }

  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  for (let sequence = 1; sequence < 4; sequence += 1) {
    await expect(page.locator("[data-game-announcement]")).toHaveText(
      new RegExp(`Level ${sequence} complete\\. Continue available`),
      { timeout: 12_000 },
    );
    await canvas.click({
      position: { x: box.width / 2, y: box.height * 0.83 },
    });
    await expect(page.locator("[data-game-announcement]")).toHaveText(
      new RegExp(
        `Level ${sequence + 1}: Browser Assurance ${sequence + 1} started`,
      ),
      { timeout: 12_000 },
    );
  }
}

async function fireAtBoardingTarget(page: import("@playwright/test").Page) {
  await holdKeyUntilAnnouncement(
    page,
    "Space",
    /Boarding offer available\. Board or Continue the Shooter assault\./,
  );
}

test("H015-BOARD-001__e2e_ordinary_user__laser_hit_opens_visible_boarding_offer_and_escape_returns_to_shooter", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await canvas.click({
    position: { x: box.width * 0.4, y: box.height * 0.57 },
  });
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding active. Clear the frigate and reach the airlock.",
    { timeout: 12_000 },
  );

  await page.keyboard.press("Escape");
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding aborted. Shooter assault resumed.",
    { timeout: 12_000 },
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "boarding-entry-abort",
    route: "/ -> Play -> /play",
    actions: [
      "Started the public Play route and selected visible Continue controls into Level 4.",
      "Fired the normal player laser into the reachable boarding target.",
      "Selected the rendered Board control and pressed Escape from live Boarding.",
    ],
    assertions: [
      "The offer followed a player laser hit, Boarding became active, and Escape returned to the Shooter state.",
    ],
  });
});

test("H015-BOARD-001__e2e_ordinary_user_negative__boarding_does_not_open_without_hitting_the_anchor", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await page.waitForTimeout(800);
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    /Level 4: Browser Assurance 4 started/,
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "boarding-entry-abort",
    route: "/ -> Play -> /play",
    actions: [
      "Reached Level 4 through visible Continue controls and deliberately did not fire at the boarding target.",
    ],
    assertions: [
      "No Boarding offer opened without the physical player-laser hit.",
    ],
  });
});

test("H015-BOARD-001__e2e_ordinary_user__continue_declines_the_offer_without_entering_boarding", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await canvas.click({
    position: { x: box.width * 0.6, y: box.height * 0.57 },
  });
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding offer declined. Shooter assault resumed.",
    { timeout: 12_000 },
  );
  await page.waitForTimeout(300);
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "boarding-entry-abort",
    route: "/ -> Play -> /play",
    actions: [
      "Reached the authored Level 4 offer through normal player-laser input.",
      "Selected the rendered Continue action rather than Board.",
    ],
    assertions: [
      "Continue dismissed the offer and resumed Shooter gameplay without entering the Boarding scene.",
    ],
  });
});

test("H015-BOARD-005__e2e_ordinary_user__physical_boarding_combat_and_exit_return_to_the_shooter", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(90_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await canvas.click({
    position: { x: box.width * 0.4, y: box.height * 0.57 },
  });
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding active. Clear the frigate and reach the airlock.",
    { timeout: 12_000 },
  );

  await canvas.focus();
  await page.keyboard.down("d");
  await page.keyboard.down("Space");
  try {
    // The rendered interior is 4096px wide. Normal keyboard movement and fire
    // clear the authored patrol while physically traversing to the far airlock.
    await page.waitForTimeout(18_000);
  } finally {
    await page.keyboard.up("Space");
    await page.keyboard.up("d");
  }
  await page.keyboard.press("e");
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding complete. Shooter assault resumed.",
    { timeout: 15_000 },
  );
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "boarding-success-return",
    route: "/ -> Play -> /play",
    actions: [
      "Reached Level 4 through public entry and rendered Continue controls.",
      "Opened Boarding with a normal player-laser hit and the rendered Board control.",
      "Held normal movement and fire controls through the interior, then pressed E at the visible far airlock.",
    ],
    assertions: [
      "Live boarding combat cleared, the physical far exit accepted E only after the objective, and the Shooter checkpoint resumed.",
    ],
  });
});

test("H015-BOARD-005__e2e_ordinary_user_negative__entry_airlock_cannot_complete_boarding_before_the_far_exit", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await canvas.click({
    position: { x: box.width * 0.4, y: box.height * 0.57 },
  });
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding active. Clear the frigate and reach the airlock.",
    { timeout: 12_000 },
  );

  await page.keyboard.press("e");
  await page.waitForTimeout(500);
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding active. Clear the frigate and reach the airlock.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "boarding-success-return",
    route: "/ -> Play -> /play",
    actions: [
      "Entered the real Boarding interior and pressed E at its entry point without clearing or traversing it.",
    ],
    assertions: [
      "The entry cannot complete Boarding; the live interior remains active until its far-exit objective is met.",
    ],
  });
});
