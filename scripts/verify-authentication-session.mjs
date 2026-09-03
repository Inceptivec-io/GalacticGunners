import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.GG_RUNTIME_URL ?? 'http://localhost:3002';
const testedSha = process.env.GG_TESTED_SHA ?? 'UNSPECIFIED';
const evidenceDir = path.resolve(process.env.GG_EVIDENCE_DIR
  ?? 'docs/evidence/authentication-session');
mkdirSync(evidenceDir, { recursive: true });
const playerLine = readFileSync('FOUNDER_REVIEW_ACCESS.local.txt', 'utf8')
  .split(/\r?\n/)
  .map((line) => line.match(/^Player: ([^/]+) \/ (.+)$/))
  .find(Boolean);
if (!playerLine) throw new Error('Founder review player credential is unavailable.');
const [, username, password] = playerLine;
const assert = (value, message) => { if (!value) throw new Error(message); };
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.setDefaultTimeout(10_000);
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

async function login(next) {
  await page.goto(`${baseUrl}/account/login?next=${encodeURIComponent(next)}`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').fill(username.trim());
  await page.locator('input[name="password"]').fill(password.trim());
  await page.getByRole('button', { name: 'Sign in' }).click();
}

async function logout() {
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Sign in' }).waitFor();
  const session = await page.evaluate(async () => (await fetch('/api/v1/auth/me/', { credentials: 'same-origin' })).json());
  assert(session.authenticated === false, 'Logout did not clear the same-origin browser session.');
}

try {
  await login('/play?qa=hostile');
  await page.waitForURL(/\/play\?qa=hostile$/);
  await page.locator('canvas').waitFor();
  await page.screenshot({ path: path.join(evidenceDir, '01-valid-player-redirect.png'), fullPage: true });
  await page.goto(`${baseUrl}/account`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Logout' }).waitFor();
  await logout();
  await page.screenshot({ path: path.join(evidenceDir, '02-player-logout.png'), fullPage: true });

  const rejected = ['//example.invalid', 'https://example.invalid/path', 'javascript:alert(1)', '/%2f%2fexample.invalid', '/%5cexample.invalid', 'relative-path'];
  for (const candidate of rejected) {
    await login(candidate);
    await page.waitForURL(`${baseUrl}/account`);
    assert(new URL(page.url()).origin === new URL(baseUrl).origin, `External redirect escaped same origin: ${candidate}`);
    await logout();
  }
  assert(errors.length === 0, `Console errors: ${errors.join(' | ')}`);
  const result = { tested_sha: testedSha, result: 'PASS', valid_redirect: '/play?qa=hostile', rejected_redirects: rejected, logout: 'PASS', console_errors: errors };
  writeFileSync(path.join(evidenceDir, 'auth-session-hostile.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
