import { expect, test } from "./fixtures/strictRuntime";

async function waitForMenu(page: import("@playwright/test").Page) {
  await page.goto("/play");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );
}

async function clickStartControl(page: import("@playwright/test").Page) {
  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await canvas.click({
    position: { x: box!.width / 2, y: box!.height * 0.63 },
  });
}

test("GG-NAVIGATION-001__e2e_ordinary_user__keyboard_confirmation_starts_gameplay_once", async ({
  page,
  strictRuntime,
}) => {
  await waitForMenu(page);
  await page.locator(".game-canvas-host canvas").press("Space");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test("GG-NAVIGATION-001__e2e_ordinary_user__mouse_selects_visible_start_control", async ({
  page,
  strictRuntime,
}) => {
  await waitForMenu(page);
  await clickStartControl(page);
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test("GG-NAVIGATION-001__e2e_ordinary_user__touch_selects_visible_start_control", async ({
  page,
  strictRuntime,
}) => {
  test.skip(
    !("hasTouch" in test.info().project.use) ||
      !test.info().project.use.hasTouch,
    "Touch behaviour runs in the mobile project.",
  );
  await waitForMenu(page);
  await clickStartControl(page);
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test("GG-NAVIGATION-001__e2e_ordinary_user_negative__duplicate_mouse_activation_does_not_restart_or_error", async ({
  page,
  strictRuntime,
}) => {
  await waitForMenu(page);
  await clickStartControl(page);
  await clickStartControl(page);
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
