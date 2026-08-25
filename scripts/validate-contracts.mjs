import { readFile } from 'node:fs/promises';

import YAML from 'yaml';

const jsonContracts = [
  'packages/contracts/schemas/game-run.schema.json',
  'packages/contracts/schemas/score-submission.schema.json',
  'packages/contracts/schemas/leaderboard-entry.schema.json',
  'packages/contracts/schemas/score-event.schema.json'
];

const requiredPaths = [
  '/health/',
  '/game-runs/',
  '/game-runs/{runId}/complete/',
  '/leaderboard/'
];

const requiredComponents = [
  'HealthResponse',
  'ErrorResponse',
  'StartGameRunRequest',
  'GameRun',
  'CompletedGameRun',
  'ScoreSubmission',
  'LeaderboardEntry',
  'LeaderboardResponse',
  'ClientType',
  'GameRunValidity'
];

const requiredScoreEvents = [
  'laser_target_hit',
  'asteroid_destroyed',
  'scout_destroyed',
  'ship_destroyed',
  'mothership_hit',
  'mothership_destroyed',
  'comet_destroyed',
  'comet_nuke_bonus',
  'shield_tile_hit'
];

function resolvePointer(root, pointer) {
  if (!pointer.startsWith('#/')) {
    throw new Error(`Only local OpenAPI refs are permitted: ${pointer}`);
  }
  return pointer
    .slice(2)
    .split('/')
    .reduce((node, token) => {
      const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
      if (node === undefined || node === null || !(key in node)) {
        throw new Error(`OpenAPI local ref does not resolve: ${pointer}`);
      }
      return node[key];
    }, root);
}

function walkRefs(root, node) {
  if (Array.isArray(node)) {
    for (const item of node) walkRefs(root, item);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (typeof node.$ref === 'string') {
    resolvePointer(root, node.$ref);
  }
  for (const value of Object.values(node)) walkRefs(root, value);
}

const parsedSchemas = [];
for (const path of jsonContracts) {
  const parsed = JSON.parse(await readFile(path, 'utf8'));
  if (parsed.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    throw new Error(`Unexpected JSON Schema draft in ${path}`);
  }
  if (parsed.additionalProperties !== false) {
    throw new Error(`Schema must close additional properties: ${path}`);
  }
  parsedSchemas.push([path, parsed]);
}

const scoreEvent = parsedSchemas.find(([path]) => path.endsWith('score-event.schema.json'))?.[1];
const eventEnum = scoreEvent?.properties?.event_type?.enum ?? [];
for (const event of requiredScoreEvents) {
  if (!eventEnum.includes(event)) {
    throw new Error(`Missing score event enum: ${event}`);
  }
}

const openApi = YAML.parse(await readFile('packages/contracts/openapi/galactic-gunners-api-v1.yaml', 'utf8'));
if (openApi.openapi !== '3.1.0') {
  throw new Error('OpenAPI contract must use openapi: 3.1.0');
}
if (openApi.servers?.[0]?.url !== '/api/v1') {
  throw new Error('OpenAPI server must remain /api/v1');
}
for (const path of requiredPaths) {
  if (!openApi.paths?.[path]) {
    throw new Error(`Missing OpenAPI path: ${path}`);
  }
}
for (const component of requiredComponents) {
  if (!openApi.components?.schemas?.[component]) {
    throw new Error(`Missing OpenAPI component schema: ${component}`);
  }
}
walkRefs(openApi, openApi);

const openApiClientTypes = openApi.components.schemas.ClientType.enum;
const gameRunSchema = parsedSchemas.find(([path]) => path.endsWith('game-run.schema.json'))?.[1];
const jsonClientTypes = gameRunSchema?.properties?.client_type?.enum ?? [];
if (JSON.stringify(openApiClientTypes) !== JSON.stringify(jsonClientTypes)) {
  throw new Error('Client type enums differ between OpenAPI and JSON Schema.');
}

console.log('Contract validation passed.');
