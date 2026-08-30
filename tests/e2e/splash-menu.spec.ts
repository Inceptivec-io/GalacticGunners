import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

test("H015-LAUNCH-001__e2e_ordinary_user__fresh_play_shows_splash_before_menu", async ({
  page,
  strictRuntime,
}) => {
  await page.goto("/");
  const launchRequestedAt = Date.now();
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.locator(".game-canvas-host canvas")).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(
    "Galactic Gunners launch sequence.",
    { timeout: 25_000 },
  );
  await expect(page.locator("[data-game-splash-copy]")).toHaveText(
    "Copyright \u00a9 2026. Powered by Inceptivec. All rights reserved.\nCollaborators: Aurora Leonardi",
  );
  const remainingVisibleWindow = Math.max(
    0,
    1_850 - (Date.now() - launchRequestedAt),
  );
  if (remainingVisibleWindow > 0) {
    await page.waitForTimeout(remainingVisibleWindow);
  }
  await expect(page.getByRole("status")).toHaveText(
    "Galactic Gunners launch sequence.",
  );
  await expect(page.getByRole("status")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );
  const splashDuration = Number(
    await page
      .locator("[data-game-host]")
      .getAttribute("data-game-splash-duration-ms"),
  );
  expect(splashDuration).toBeGreaterThanOrEqual(1_900);
  expect(splashDuration).toBeLessThanOrEqual(3_000);
  await expect(page.locator("[data-game-splash-copy]")).toHaveCount(0);
  await expect(page.locator(".game-canvas-host canvas")).toBeFocused();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "splash-navigation",
    route: "/ -> Play -> /play",
    actions: [
      "Opened the public root route.",
      "Selected the visible Play link.",
      "Waited for the governed splash and Main Menu.",
    ],
    assertions: [
      "The splash remained visible for its governed duration.",
      "The exact governed copyright and collaborator copy was rendered.",
      "The canvas received usable Main Menu focus.",
    ],
  });
});

test("H015-LAUNCH-001__e2e_ordinary_user_negative__internal_navigation_does_not_replay_splash", async ({
  page,
  strictRuntime,
}) => {
  await page.goto("/play");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners launch sequence.",
    { timeout: 25_000 },
  );
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );
  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await canvas.click({
    position: { x: box!.width / 2, y: box!.height * 0.63 },
  });
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  await expect(page.locator("[data-game-announcement]")).toHaveText(
    /^Level 1: .+ started\.$/,
    { timeout: 5_000 },
  );
  await canvas.focus();
  await page.keyboard.down("KeyP");
  try {
    await expect(page.locator("[data-game-status]")).toHaveText(
      "Galactic Gunners paused. Resume, restart, or return to the main menu.",
    );
  } finally {
    await page.keyboard.up("KeyP");
  }
  await page.keyboard.down("KeyM");
  try {
    await expect(page.locator("[data-game-status]")).toHaveText(
      "Galactic Gunners main menu ready.",
    );
  } finally {
    await page.keyboard.up("KeyM");
  }
  await expect(page.locator("[data-game-status]")).not.toHaveText(
    "Galactic Gunners launch sequence.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "direct-deep-link",
    route: "/play",
    actions: [
      "Opened a new independent game entry and observed its launch splash.",
      "Started gameplay from the visible Main Menu action.",
      "Opened Pause with P and selected Main Menu with M.",
    ],
    assertions: [
      "A new independent entry remained capable of showing the splash.",
      "Internal return to the Main Menu did not replay the launch splash.",
    ],
  });
});
