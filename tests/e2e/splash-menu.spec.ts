import { expect, test } from './fixtures/strictRuntime';

test('H015-LAUNCH-001__e2e_ordinary_user__fresh_play_shows_splash_before_menu', async ({ page, strictRuntime }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Play' }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.locator('.game-canvas-host canvas')).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Galactic Gunners launch sequence.', { timeout: 25_000 });
  const splashStartedAt = Date.now();
  await expect(page.getByRole('status')).toHaveText('Galactic Gunners main menu ready.', { timeout: 25_000 });
  expect(Date.now() - splashStartedAt).toBeGreaterThanOrEqual(1_800);
  await expect(page.locator('.game-canvas-host canvas')).toBeFocused();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test('H015-LAUNCH-001__e2e_ordinary_user_negative__internal_navigation_does_not_replay_splash', async ({ page, strictRuntime }) => {
  await page.goto('/play');
  await expect(page.locator('[data-game-status]')).toHaveText('Galactic Gunners main menu ready.', { timeout: 25_000 });
  const canvas = page.locator('.game-canvas-host canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height * 0.63 } });
  await expect(page.locator('[data-game-status]')).toHaveText('Galactic Gunners gameplay started.');
  await expect(page.locator('[data-game-status]')).not.toHaveText('Galactic Gunners launch sequence.');
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
