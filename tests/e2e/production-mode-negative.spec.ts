import { expect, test } from "./fixtures/strictRuntime";

test("GG-PRODUCT-MODEL-001__e2e_ordinary_user_negative__qa_query_cannot_enable_diagnostic_globals", async ({
  page,
  strictRuntime,
}) => {
  await page.goto("/play?qa=hostile");
  await page.waitForTimeout(2_200);
  const diagnostics = await page.evaluate(() => ({
    hostile: Boolean(window.__GALACTIC_GUNNERS_HOSTILE__),
    slice: Boolean(window.__GALACTIC_GUNNERS_SLICE_QA__),
    menu: Boolean(window.__GALACTIC_GUNNERS_MENU_QA__),
    pause: Boolean(window.__GALACTIC_GUNNERS_PAUSE_QA__),
    boarding: Boolean(window.__GALACTIC_GUNNERS_BOARDING_QA__),
  }));
  expect(diagnostics).toEqual({
    hostile: false,
    slice: false,
    menu: false,
    pause: false,
    boarding: false,
  });
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
