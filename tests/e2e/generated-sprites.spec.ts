import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

test("H015-SPRITE-001__e2e_ordinary_user__root_launch_uses_portable_generated_shooter_derivatives", async ({
  page,
  strictRuntime,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.locator(".game-canvas-host canvas")).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );

  const spriteRequests = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => name.includes("gg-runtime-assets")),
  );

  expect(spriteRequests).toEqual(
    expect.arrayContaining([
      expect.stringContaining("generated/sprites/ships/player_ship_v003.png"),
      expect.stringContaining("generated/sprites/ships/enemy_scout_v003.png"),
      expect.stringContaining("generated/sprites/objects/nuke_burst_v003.png"),
    ]),
  );
  expect(spriteRequests).not.toContainEqual(
    expect.stringContaining("gg_nuke_burst_v002_horizontal.png"),
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "ordinary-sprite-runtime",
    route: "/ -> Play -> /play -> Main Menu",
    actions: ["Opened the public route.", "Selected the visible Play action."],
    assertions: [
      "The ordinary runtime loaded generated Shooter derivatives.",
      "The oversized canonical nuke-burst sheet was not fetched by the browser.",
    ],
  });
});
