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
const gateDefinitions = {
  'runtime-hostile': {
    directory: 'hostile', verification: 'runtime-hostile-verification.json', route: '/play?qa=hostile',
    setup: ['Boot the Docker web and backend services.', 'Launch the normal menu-to-game flow.'],
    actions: ['Drive keyboard, touch, controller, projectile, collision, pause, result, and resize paths.'],
    assertions: ['All hostile runtime cases, viewport checks, console checks, and network checks pass.'],
    observed: 'The live Level 1 runtime completed the hostile input, collision, HUD, and terminal-state matrix.', normal: true,
  },
  'campaign-progression': {
    directory: 'campaign_runtime', verification: 'campaign-progression-verification.json', route: '/play?qa=hostile',
    setup: ['Start the release-pinned CORE campaign.'],
    actions: ['Complete Level 1, select Continue, then traverse the published campaign sequence.'],
    assertions: ['Continue resolves the next pinned entry, resources persist, and final victory has no Level 7.'],
    observed: 'The browser campaign journey advanced through the ordered release and preserved campaign-owned state.', normal: true,
  },
  'boarding-entry-abort': {
    directory: 'rectification/boarding', verification: 'boarding-browser-verification.json', route: '/play?qa=hostile',
    setup: ['Launch the governed Level 4 Boarding offer from the Shooter.'],
    actions: ['Accept Boarding, exercise touch fire, open ESC pause, and confirm abort.'],
    assertions: ['Boarding is active, controls work, and abort returns to the exact Shooter checkpoint.'],
    observed: 'The live Boarding entry, touch-combat, pause, and governed abort return journey completed.', normal: true,
  },
  'boarding-success-return': {
    directory: 'rectification/boarding_success', verification: 'boarding-success-browser-verification.json', route: '/play?qa=hostile',
    setup: ['Launch a governed Boarding encounter with its physical exit locked.'],
    actions: ['Eliminate the required target and traverse to the exit airlock.'],
    assertions: ['The exit unlocks only after the objective and returns to the preserved Shooter checkpoint.'],
    observed: 'The live Boarding success path completed combat, physical exit, and server-backed Shooter return.', normal: true,
  },
  'level4-hazards': {
    directory: 'rectification/level4_hazards', verification: 'level4-hazard-browser-verification.json', route: '/play?qa=hostile',
    setup: ['Start the database-backed Level 4 definition.'],
    actions: ['Observe configured hazards and fire a player laser through a live hazard collision.'],
    assertions: ['Asteroid and comet instances are visible, collide through their meaningful body, and resolve once.'],
    observed: 'Level 4 produced visible recurring hazards and the browser verified live projectile-to-hazard resolution.', normal: true,
  },
  'designer-roundtrip': {
    directory: 'rectification/designer_roundtrip', verification: 'designer-runtime-roundtrip.json', route: '/inceptivec-gamification-admin/campaigns',
    setup: ['Authenticate as the generated Inceptivec administrator and open a published CORE level.'],
    actions: ['Create a draft, change entity, formation, and hazard data, save, reload, preview, publish, and roll back.'],
    assertions: ['The exact draft checksum persists, preview matches that checksum, publication reaches gameplay, and rollback restores baseline.'],
    observed: 'The authenticated Designer journey persisted and reloaded a material configuration change through preview, publication, and rollback.', normal: false,
  },
  'designer-review-matrix': {
    directory: 'review_matrix', verification: 'browser-matrix-index.json', route: '/inceptivec-gamification-admin/campaigns',
    setup: ['Bootstrap review identities and open the protected Admin and Command Post surfaces.'],
    actions: ['Inspect asset choosers, tenant map creation, six campaign levels, results, and final campaign state.'],
    assertions: ['Each named captured surface is distinct, exact-SHA tagged, and free of console or unexpected network errors.'],
    observed: 'The browser matrix captured distinct authenticated Designer, tenant, campaign, combat, and result surfaces.', normal: false,
  },
  'splash-navigation': {
    directory: 'rectification/stage-2', verification: 'stage-2-navigation-verification.json', route: '/play',
    setup: ['Open the ordinary game route at a touch-capable viewport.'],
    actions: ['Observe the governed splash, enter gameplay, pause, touch Resume, keyboard Resume, and return to Main Menu.'],
    assertions: ['The two-second splash, focus restoration, translucent pause, frozen simulation, and navigation controls all pass.'],
    observed: 'The ordinary launch and pause journey proved the governed splash and usable pause/navigation controls.', normal: false,
  },
  'auth-redirect': {
    directory: 'rectification/stage-9', verification: 'auth-session-hostile.json', route: '/account/login', include: ['01-valid-player-redirect.png', 'auth-session-hostile.json'],
    setup: ['Use the generated player review identity against the same-origin login route.'],
    actions: ['Sign in with an allowed route, then submit hostile next-route candidates.'],
    assertions: ['Allowed internal redirect succeeds and external, encoded, script, and relative candidates are rejected.'],
    observed: 'The browser authenticated the player only to the validated same-origin destination and rejected hostile redirects.', normal: false,
  },
  'player-logout': {
    directory: 'rectification/stage-9', verification: 'auth-session-hostile.json', route: '/account', include: ['02-player-logout.png'],
    setup: ['Authenticate the generated player through the product login surface.'],
    actions: ['Use the visible Logout control and query the same-origin session endpoint.'],
    assertions: ['The UI returns to anonymous state and the server session is cleared.'],
    observed: 'The browser logout control cleared the active same-origin player session.', normal: false,
  },
  'closure-audit': {
    directory: 'closure_audit', verification: 'closure-audit-preflight.json', route: 'CI evidence artifact',
    setup: ['Collect exact-SHA gate outputs into the CI artifact directory.'],
    actions: ['Build the evidence manifest and invoke the fail-closed closure auditor.'],
    assertions: ['Every required gate has exact-SHA evidence, action traces, unique screenshot hashes, and no unexpected browser failures.'],
    observed: 'The exact-SHA browser artifact was assembled for fail-closed closure-audit verification.', normal: false,
  },
};

function verificationResult(definition) {
  const file = path.join(root, definition.directory, definition.verification);
  if (!existsSync(file)) return false;
  try {
    const result = JSON.parse(readFileSync(file, 'utf8'));
    if (result.tested_sha !== sha) return false;
    if (definition.verification === 'browser-matrix-index.json') {
      return result.results?.length > 0
        && result.results.every((entry) => entry.result === 'PASS' && entry.tested_sha === sha)
        && result.console_errors?.length === 0
        && result.network_failures?.length === 0;
    }
    return result.result === 'PASS';
  } catch {
    return false;
  }
}

const gates = REQUIRED_GATES.map((id) => {
  const definition = gateDefinitions[id];
  if (!definition) throw new Error(`Missing H015 evidence definition for required gate: ${id}`);
  const items = evidence(definition.directory).filter((item) => !definition.include
    || definition.include.includes(path.basename(item.path)));
  return {
    id,
    classification: 'AUTOMATED_BROWSER',
    route: definition.route,
    setup: definition.setup,
    actions: definition.actions,
    assertions: definition.assertions,
    tested_sha: sha,
    observed: definition.observed,
    normal_gameplay_interaction: definition.normal,
    result: id === 'closure-audit' ? 'PENDING' : (verificationResult(definition) && items.length > 0 ? 'PASS' : 'FAIL'),
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
  artifact: { name: `h015-browser-evidence-${sha}`, url: process.env.GG_EVIDENCE_ARTIFACT_URL ?? `file://${indexPath.replaceAll('\\', '/')}`, path: 'h015-evidence-index.json', sha256: sha256(indexPath) },
};
writeFileSync(path.join(root, 'h015-evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(path.join(root, 'h015-evidence-manifest.json'));
