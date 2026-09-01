import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

test("H015A-010__e2e_ordinary_user__gameplay_cursor_hides_after_idle_and_reveals_on_pointer_motion", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(30_000);
  await page.goto("/");
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );

  const canvas = page.locator(".game-canvas-host canvas");
  await canvas.focus();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );

  await page.mouse.move(300, 300);
  await expect
    .poll(() => canvas.evaluate((element) => element.style.cursor))
    .toBe("");

  await page.waitForTimeout(5_250);
  await expect
    .poll(() => canvas.evaluate((element) => element.style.cursor))
    .toBe("none");

  await page.mouse.move(340, 320);
  await expect
    .poll(() => canvas.evaluate((element) => element.style.cursor))
    .toBe("");
  expect(strictRuntime.unexpectedFailures).toEqual([]);

  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "gameplay-cursor-idle",
    route: "/ -> Play -> /play",
    actions: [
      "Entered the game through the rendered Play link and Main Menu action.",
      "Moved the mouse during active gameplay, waited beyond the governed idle interval, then moved it again.",
    ],
    assertions: [
      "The canvas cursor hid only after idle gameplay and returned immediately on ordinary pointer movement.",
    ],
  });
});
