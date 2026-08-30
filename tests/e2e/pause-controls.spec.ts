import { expect, test } from './fixtures/strictRuntime';

async function startGameplay(page: import('@playwright/test').Page) {
  await page.goto('/play');
  await expect(page.locator('[data-game-status]')).toHaveText('Galactic Gunners main menu ready.', { timeout: 25_000 });
  await page.locator('.game-canvas-host canvas').press('Space');
  await expect(page.locator('[data-game-status]')).toHaveText('Galactic Gunners gameplay started.');
}

test('H015-PAUSE-001__e2e_ordinary_user__keyboard_pause_and_resume_preserve_playable_runtime', async ({ page, strictRuntime }) => {
  await startGameplay(page);
  await page.locator('.game-canvas-host canvas').press('P');
  await expect(page.locator('[data-game-status]')).toHaveText(/Galactic Gunners paused/);
  await page.locator('.game-canvas-host canvas').press('Escape');
  await expect(page.locator('[data-game-status]')).toHaveText('Galactic Gunners gameplay started.');
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});

test('H015-PAUSE-002__e2e_ordinary_user_negative__repeated_pause_resume_does_not_leave_a_black_or_lost_runtime', async ({ page, strictRuntime }) => {
  await startGameplay(page);
  const canvas = page.locator('.game-canvas-host canvas');
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await canvas.press('P');
    await expect(page.locator('[data-game-status]')).toHaveText(/Galactic Gunners paused/);
    await canvas.press('Escape');
    await expect(page.locator('[data-game-status]')).toHaveText('Galactic Gunners gameplay started.');
  }
  await expect(canvas).toBeVisible();
  expect(strictRuntime.unexpectedFailures).toEqual([]);
});
