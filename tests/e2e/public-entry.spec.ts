import { expect, test } from './fixtures/strictRuntime';

test('H015-ENTRY-001__e2e_ordinary_user__root_play_enters_governed_launch', async ({ page, strictRuntime }) => {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Galactic Gunners launch' })).toBeVisible();
  await page.getByRole('link', { name: 'Play' }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.locator('.game-host')).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test('H015-ENTRY-001__e2e_ordinary_user_negative__runtime_failure_is_not_silently_ignored', async ({ page }) => {
  const failed = await page.request.get('/api/does-not-exist');
  expect(failed.status()).toBeGreaterThanOrEqual(400);
});
