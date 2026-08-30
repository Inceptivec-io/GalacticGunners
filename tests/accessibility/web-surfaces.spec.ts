import AxeBuilder from "@axe-core/playwright";

import { expect, test } from "../e2e/fixtures/strictRuntime";

async function expectNoSeriousViolations(
  page: import("@playwright/test").Page,
) {
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = report.violations.filter(
    (violation) => ["critical", "serious"].includes(violation.impact ?? ""),
  );
  expect(
    serious,
    serious
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join("\n"),
  ).toEqual([]);
}

test("H015-A11Y-001__e2e_ordinary_user__public_launch_has_no_serious_accessibility_violations", async ({
  page,
  strictRuntime,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("region", { name: "Galactic Gunners launch" }),
  ).toBeVisible();
  await expectNoSeriousViolations(page);
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test("H015-A11Y-001__e2e_ordinary_user_negative__protected_login_surfaces_expose_labelled_controls", async ({
  page,
  strictRuntime,
}) => {
  for (const path of [
    "/account/login",
    "/command-post/login",
    "/inceptivec-gamification-admin/login",
  ]) {
    await page.goto(path);
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expectNoSeriousViolations(page);
  }
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
