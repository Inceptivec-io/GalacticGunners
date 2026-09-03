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
    /Boardable alien incapacitated\. Fly within range to Board or Continue\./,
  );
}

async function approachBoardingTarget(page: import("@playwright/test").Page) {
  const canvas = page.locator(".game-canvas-host canvas");
  await canvas.focus();
  // The browser-assurance scenario keeps the disabled Frigate in the player's
  // centre lane. Use normal upward movement to reach its authored envelope.
  await page.keyboard.down("w");
  try {
    await page.waitForTimeout(1_850);
    await expect(page.locator("[data-game-announcement]")).toHaveText(
      /Boarding offer available\. Board or Continue the Shooter assault\./,
      { timeout: 12_000 },
    );
  } finally {
    await page.keyboard.up("w");
  }
}

async function selectBoardWithKeyboard(page: import("@playwright/test").Page) {
  await holdKeyUntilAnnouncement(
    page,
    "Enter",
    "Boarding active. Clear the frigate and reach the airlock.",
  );
}

async function selectContinueWithTouch(page: import("@playwright/test").Page) {
  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await canvas.click({
    position: { x: box.width * 0.58, y: box.height * 0.23 },
  });
}

test("GG-BOARDING-001__e2e_ordinary_user__laser_hit_opens_visible_boarding_offer_and_escape_returns_to_shooter", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);
  await approachBoardingTarget(page);

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await holdKeyUntilAnnouncement(
    page,
    "Enter",
    "Boarding active. Clear the frigate and reach the airlock.",
  );

  // Escape is intentionally pause-only. The visible abort action requires a
  // second deliberate confirmation before a live Boarding run may return.
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners paused. Resume, restart, or return to the main menu.",
  );
  const pauseActionY = box.height / 2 + 156;
  await canvas.click({ position: { x: box.width / 2, y: pauseActionY } });
  await page.waitForTimeout(150);
  await canvas.click({ position: { x: box.width / 2, y: pauseActionY } });
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
      "Selected the rendered Board control, paused with Escape, and confirmed the visible Boarding abort action.",
    ],
    assertions: [
      "The offer followed a player laser hit, Boarding became active, and only the confirmed abort returned to the Shooter state.",
    ],
  });
});

test("GG-BOARDING-001__e2e_ordinary_user_negative__boarding_does_not_open_without_hitting_the_anchor", async ({
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

test("GG-BOARDING-001__e2e_ordinary_user__continue_declines_the_offer_without_entering_boarding", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);
  await approachBoardingTarget(page);

  await selectContinueWithTouch(page);
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding declined. The incapacitated target will expire.",
    { timeout: 12_000 },
  );
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding opportunity expired. Shooter assault continued.",
    { timeout: 12_000 },
  );
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

test("GG-BOARDING-005__e2e_ordinary_user__physical_boarding_combat_and_exit_return_to_the_shooter", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(90_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);
  await approachBoardingTarget(page);

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await selectBoardWithKeyboard(page);

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

test("GG-BOARDING-005__e2e_ordinary_user_negative__entry_airlock_cannot_complete_boarding_before_the_far_exit", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);
  await approachBoardingTarget(page);

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await selectBoardWithKeyboard(page);

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

test("GG-BOARDING-006__e2e_ordinary_user__escape_pauses_resumes_and_requires_confirmed_abort", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);
  await approachBoardingTarget(page);
  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await selectBoardWithKeyboard(page);

  await page.keyboard.press("Escape");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners paused. Resume, restart, or return to the main menu.",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );

  await page.keyboard.press("Escape");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners paused. Resume, restart, or return to the main menu.",
  );
  const pauseActionY = box.height / 2 + 156;
  await canvas.click({ position: { x: box.width / 2, y: pauseActionY } });
  await page.waitForTimeout(150);
  await canvas.click({ position: { x: box.width / 2, y: pauseActionY } });
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding aborted. Shooter assault resumed.",
    { timeout: 12_000 },
  );
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
      "Entered live Boarding through normal public gameplay, used Escape to pause and resume, then selected the visible abort action twice.",
    ],
    assertions: [
      "Escape pauses rather than aborts, Escape resumes, and Boarding abort only occurs after the explicit confirmation action before returning to Shooter.",
    ],
  });
});

test("GG-BOARDING-003__e2e_ordinary_user__boarding_player_fire_collides_with_and_eliminates_a_live_alien", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);
  await approachBoardingTarget(page);
  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await selectBoardWithKeyboard(page);

  await holdKeyUntilAnnouncement(
    page,
    "Space",
    /Boarding target alien-01 eliminated\./,
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "boarding-entry-abort",
    route: "/ -> Play -> /play",
    actions: [
      "Entered Boarding through public gameplay and held the normal fire key against the first live patrol alien.",
    ],
    assertions: [
      "A live player projectile collision eliminated the authored alien and emitted the gameplay result only after that collision.",
    ],
  });
});

test("GG-BOARDING-003__e2e_ordinary_user_negative__boarding_alien_is_not_eliminated_without_player_fire", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startLevelFour(page);
  await fireAtBoardingTarget(page);
  await approachBoardingTarget(page);
  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await selectBoardWithKeyboard(page);

  await page.waitForTimeout(1_500);
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    "Boarding active. Clear the frigate and reach the airlock.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "boarding-entry-abort",
    route: "/ -> Play -> /play",
    actions: [
      "Entered the live Boarding interior and deliberately supplied no movement or fire input.",
    ],
    assertions: [
      "No alien-elimination result occurred without a real player projectile collision.",
    ],
  });
});
