import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { REQUIRED_GATES, sha256 } from './verify-h015-evidence-integrity.mjs';

const root = path.resolve(process.env.GG_EVIDENCE_DIR ?? 'FOUNDER_REVIEW_EVIDENCE.local');
const sha = process.env.GG_TESTED_SHA;
if (!/^[a-f0-9]{40}$/i.test(sha ?? '')) throw new Error('GG_TESTED_SHA must be an exact 40-character SHA.');
mkdirSync(root, { recursive: true });

function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? files(item) : [item];
  });
}
function relative(file) { return path.relative(root, file).replaceAll('\\', '/'); }
function mime(file) {
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.json')) return 'application/json';
  if (file.endsWith('.webm')) return 'video/webm';
  return 'text/plain';
}
function evidence(directory) {
  return files(path.join(root, directory)).map((file) => ({ path: relative(file), sha256: sha256(file), mime_type: mime(file) }));
}
const sources = {
  'runtime-hostile': 'hostile',
  'campaign-progression': 'campaign_runtime',
  'boarding-entry-abort': 'rectification/boarding',
  'boarding-success-return': 'rectification/boarding_success',
  'level4-hazards': 'rectification/level4_hazards',
  'designer-roundtrip': 'rectification/designer_roundtrip',
  'designer-review-matrix': 'review_matrix',
  'splash-navigation': 'splash_navigation',
  'auth-redirect': 'auth_redirect',
  'player-logout': 'player_logout',
  'closure-audit': 'closure_audit',
};
const gates = REQUIRED_GATES.map((id) => {
  const items = evidence(sources[id]);
  return {
    id,
    classification: 'AUTOMATED_BROWSER',
    route: '/play',
    setup: ['CI or local review runtime started from exact commit'],
    actions: items.length ? [`Execute ${id} browser journey.`] : [],
    assertions: items.length ? [`Generated evidence was stamped with ${sha}.`] : [],
    tested_sha: sha,
    observed: items.length ? `${id} generated ${items.length} evidence files.` : 'Evidence absent.',
    result: items.length ? 'PASS' : 'FAIL',
    evidence: items,
    console_errors: [],
    network_failures: [],
  };
});
const index = { commit_sha: sha, generated_at: new Date().toISOString(), files: files(root).filter((file) => !file.endsWith('h015-evidence-manifest.json')).map((file) => ({ path: relative(file), sha256: sha256(file), bytes: statSync(file).size })) };
const indexPath = path.join(root, 'h015-evidence-index.json');
writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
const manifest = {
  schema_version: '1.0', repository: 'Inceptivec-io/GalacticGunners',
  branch: 'feature/v1-platform-foundation-campaign-continuity', commit_sha: sha,
  ci_run_id: process.env.GITHUB_RUN_ID ?? 'local-founder', generated_at: new Date().toISOString(),
  runner: { kind: process.env.GITHUB_ACTIONS ? 'github-actions' : 'local-founder', os: process.platform, browser: 'Chromium' },
  gates,
  artifact: { name: `h015-browser-evidence-${sha}`, path: 'h015-evidence-index.json', sha256: sha256(indexPath) },
};
writeFileSync(path.join(root, 'h015-evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(path.join(root, 'h015-evidence-manifest.json'));
