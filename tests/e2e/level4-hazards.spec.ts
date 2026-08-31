import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

async function startLevelFour(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );
  const canvas = page.locator(".game-canvas-host canvas");
  await canvas.press("Space");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );

  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  const announcement = page.locator("[data-game-announcement]");
  for (let sequence = 1; sequence < 4; sequence += 1) {
    await expect(announcement).toHaveText(
      new RegExp(`Level ${sequence} complete\\. Continue available`),
      { timeout: 12_000 },
    );
    await canvas.click({
      position: { x: box.width / 2, y: box.height * 0.83 },
    });
    await expect(announcement).toHaveText(
      new RegExp(
        `Level ${sequence + 1}: Browser Assurance ${sequence + 1} started`,
      ),
      { timeout: 12_000 },
    );
  }
  return { canvas, announcement };
}

test("H015-GAME-006__e2e_ordinary_user__player_laser_destroys_the_authored_level_four_comet", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  const { canvas, announcement } = await startLevelFour(page);
  await canvas.focus();
  await page.keyboard.down("Space");
  try {
    await expect(announcement).toHaveText("Comet destroyed.", {
      timeout: 12_000,
    });
  } finally {
    await page.keyboard.up("Space");
  }
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "level4-hazards",
    route: "/ -> Play -> /play",
    actions: [
      "Entered gameplay through the public Play route.",
      "Used visible Continue controls to reach Level 4.",
      "Held the normal Fire control until the authored comet was physically destroyed.",
    ],
    assertions: [
      "The Level 4 comet used its governed runtime emitter and resolved through normal player-laser collision.",
    ],
  });
});

test("H015-GAME-006__e2e_ordinary_user_negative__level_four_hazard_does_not_destroy_without_player_fire", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  const { announcement } = await startLevelFour(page);
  await page.waitForTimeout(900);
  await expect(announcement).not.toHaveText("Comet destroyed.");
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "level4-hazards",
    route: "/ -> Play -> /play",
    actions: ["Reached Level 4 and deliberately supplied no Fire input."],
    assertions: [
      "The authored comet did not report a false player-laser destruction without collision input.",
    ],
  });
});
