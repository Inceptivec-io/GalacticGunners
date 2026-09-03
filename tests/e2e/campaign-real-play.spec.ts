import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

async function startCampaign(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners main menu ready.",
    { timeout: 25_000 },
  );
  await page.locator(".game-canvas-host canvas").press("Space");
  await expect(page.locator("[data-game-status]")).toHaveText(
    "Galactic Gunners gameplay started.",
  );
}

test("GG-CAMPAIGN-RUNTIME-004__e2e_ordinary_user__published_release_continue_loads_the_next_entry", async ({
  page,
  strictRuntime,
}) => {
  await startCampaign(page);
  const announcement = page.locator("[data-game-announcement]");
  await expect(announcement).toHaveText(
    /Level 1 complete.*Continue available/,
    {
      timeout: 10_000,
    },
  );

  const canvas = page.locator(".game-canvas-host canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");
  await canvas.click({ position: { x: box.width / 2, y: box.height * 0.83 } });
  await expect(announcement).toHaveText(
    /Level 2: Browser Assurance 2 started/,
    {
      timeout: 10_000,
    },
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "campaign-progression",
    route: "/ -> Play -> /play",
    actions: [
      "Started the public Play journey.",
      "Waited for ordinary Level 1 completion.",
      "Selected the visible Continue control.",
    ],
    assertions: ["Continue loaded the distinct Level 2 campaign entry."],
  });
});

test("GG-CAMPAIGN-RUNTIME-004__e2e_ordinary_user__continue_traverses_the_published_release_without_level_seven", async ({
  page,
  strictRuntime,
}) => {
  test.setTimeout(60_000);
  await startCampaign(page);
  const canvas = page.locator(".game-canvas-host canvas");
  const announcement = page.locator("[data-game-announcement]");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Gameplay canvas is unavailable.");

  for (let sequence = 1; sequence < 6; sequence += 1) {
    await expect(announcement).toHaveText(
      new RegExp(`Level ${sequence} complete\\. Continue available`),
      { timeout: 10_000 },
    );
    await canvas.click({
      position: { x: box.width / 2, y: box.height * 0.83 },
    });
    await expect(announcement).toHaveText(
      new RegExp(
        `Level ${sequence + 1}: Browser Assurance ${sequence + 1} started`,
      ),
      { timeout: 10_000 },
    );
  }

  await expect(announcement).toHaveText(
    /Campaign victory\. Level 6 complete\./,
    {
      timeout: 10_000,
    },
  );
  await page.waitForTimeout(500);
  await expect(announcement).not.toHaveText(/Level 7/);
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "campaign-progression",
    route: "/ -> Play -> /play",
    actions: [
      "Started an ordinary campaign from the public entry.",
      "Used visible Continue controls through Levels 1 to 6.",
    ],
    assertions: [
      "Each Continue selected the next pinned entry and Level 6 ended at final victory without Level 7.",
    ],
  });
});

test("GG-CAMPAIGN-RUNTIME-004__e2e_ordinary_user_negative__result_does_not_advance_without_continue_input", async ({
  page,
  strictRuntime,
}) => {
  await startCampaign(page);
  const announcement = page.locator("[data-game-announcement]");
  await expect(announcement).toHaveText(
    /Level 1 complete.*Continue available/,
    {
      timeout: 10_000,
    },
  );
  await page.waitForTimeout(500);
  await expect(announcement).toHaveText(/Level 1 complete.*Continue available/);
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "campaign-progression",
    route: "/ -> Play -> /play",
    actions: [
      "Started an ordinary campaign and did not select Continue after Level 1 completion.",
    ],
    assertions: [
      "The result panel remained on Level 1 until explicit user input.",
    ],
  });
});
