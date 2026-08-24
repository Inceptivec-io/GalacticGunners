import { readFile } from 'node:fs/promises';

const jsonContracts = [
  'packages/contracts/schemas/game-run.schema.json',
  'packages/contracts/schemas/score-submission.schema.json',
  'packages/contracts/schemas/leaderboard-entry.schema.json',
  'packages/contracts/schemas/score-event.schema.json'
];

for (const path of jsonContracts) {
  JSON.parse(await readFile(path, 'utf8'));
}

const openApi = await readFile('packages/contracts/openapi/galactic-gunners-api-v1.yaml', 'utf8');
if (!openApi.includes('openapi: 3.1.0') || !openApi.includes('/game-runs/')) {
  throw new Error('OpenAPI contract baseline is incomplete.');
}

console.log('Contract baseline validation passed.');
