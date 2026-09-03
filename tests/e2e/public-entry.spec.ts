import { expect, test } from "./fixtures/strictRuntime";
import { captureOrdinaryJourney } from "./fixtures/ordinaryEvidence";

test("GG-PRODUCT-ENTRY-001__e2e_ordinary_user__root_play_enters_governed_launch", async ({
  page,
  strictRuntime,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Galactic Gunners launch" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.locator(".game-host")).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "ordinary-entry",
    route: "/ -> Play -> /play",
    actions: [
      "Opened the public root route.",
      "Selected the visible Play link.",
    ],
    assertions: [
      "The customer entered the governed game route through the public Play boundary.",
    ],
  });
});

test("GG-PRODUCT-ENTRY-001__e2e_ordinary_user_negative__boot_request_failure_surfaces_a_safe_error", async ({
  page,
  strictRuntime,
}) => {
  strictRuntime.allowHttpFailure(/\/api\/v1\/campaign-runs\/start\/$/, 503);
  strictRuntime.allowConsoleError(
    /Failed to load resource: the server responded with a status of 503/,
  );
  await page.route("**/api/v1/campaign-runs/start/", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "Campaign service unavailable for this hostile test.",
      }),
    }),
  );

  await page.goto("/");
  await page.getByRole("link", { name: "Play" }).click();
  await expect(page.locator('[data-game-status][role="alert"]')).toHaveText(
    /Unable to start Galactic Gunners runtime/,
    { timeout: 25_000 },
  );
  expect(strictRuntime.unexpectedFailures).toEqual([]);
  await captureOrdinaryJourney({
    page,
    testInfo: test.info(),
    gate: "entry-service-failure",
    route: "/ -> Play -> /play",
    actions: [
      "Opened the public root route.",
      "Selected Play while the campaign-start endpoint returned a governed service failure.",
    ],
    assertions: [
      "The product surfaced a safe runtime error instead of starting an incomplete game.",
    ],
  });
});
