import { readFile } from 'node:fs/promises';

import YAML from 'yaml';

const jsonContracts = [
  'packages/contracts/schemas/game-run.schema.json',
  'packages/contracts/schemas/score-submission.schema.json',
  'packages/contracts/schemas/leaderboard-entry.schema.json',
  'packages/contracts/schemas/score-event.schema.json',
  'packages/contracts/schemas/level-authoring-document-v1.1.schema.json'
];

const requiredPaths = [
  '/health/',
  '/game-runs/',
  '/game-runs/{runId}/complete/',
  '/leaderboard/',
  '/admin/levels/{levelId}/drafts/',
  '/admin/levels/{levelId}/preview/{checksum}',
  '/portal/organizations/{organizationSlug}/maps/{levelId}/drafts/',
  '/portal/organizations/{organizationSlug}/maps/{levelId}/preview/{checksum}'
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
  'GameRunValidity',
  'LevelAuthoringDocument',
  'LevelDraftSaveRequest',
  'LevelVersion'
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

const levelAuthoring = parsedSchemas.find(([path]) => path.endsWith('level-authoring-document-v1.1.schema.json'))?.[1];
for (const field of ['player_spawns', 'entities', 'formations', 'hazard_emitters', 'shield_structures', 'drop_rules', 'objectives', 'boarding_anchors', 'gameplay', 'performance_budget']) {
  if (!levelAuthoring?.required?.includes(field)) throw new Error(`Level Authoring schema missing ${field}.`);
}
if (levelAuthoring?.properties?.schema_version?.const !== '1.1') throw new Error('Level Authoring schema must remain 1.1.');

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

const errorResponse = openApi.components.schemas.ErrorResponse;
const expectedErrorRequired = ['code', 'detail', 'errors'];
if (errorResponse.additionalProperties !== false) {
  throw new Error('ErrorResponse must close additional properties.');
}
if (JSON.stringify(errorResponse.required) !== JSON.stringify(expectedErrorRequired)) {
  throw new Error('ErrorResponse must require code, detail and errors.');
}
if (errorResponse.properties?.code?.type !== 'string') {
  throw new Error('ErrorResponse.code must be a string.');
}
for (const code of ['invalid_request', 'not_found', 'conflict']) {
  if (!errorResponse.properties.code.enum?.includes(code)) {
    throw new Error(`ErrorResponse.code enum missing ${code}.`);
  }
}
if (errorResponse.properties?.detail?.type !== 'string') {
  throw new Error('ErrorResponse.detail must be a string.');
}
if (errorResponse.properties?.errors?.type !== 'object') {
  throw new Error('ErrorResponse.errors must be an object.');
}

for (const [name, response] of Object.entries(openApi.components.responses)) {
  const schemaRef = response?.content?.['application/json']?.schema?.$ref;
  if (['BadRequest', 'NotFound', 'Conflict'].includes(name) && schemaRef !== '#/components/schemas/ErrorResponse') {
    throw new Error(`${name} must reference ErrorResponse.`);
  }
}

const errorStatusRefs = [
  openApi.paths['/game-runs/']?.post?.responses?.['400']?.$ref,
  openApi.paths['/game-runs/']?.post?.responses?.['404']?.$ref,
  openApi.paths['/game-runs/{runId}/complete/']?.post?.responses?.['400']?.$ref,
  openApi.paths['/game-runs/{runId}/complete/']?.post?.responses?.['404']?.$ref,
  openApi.paths['/game-runs/{runId}/complete/']?.post?.responses?.['409']?.$ref,
  openApi.paths['/leaderboard/']?.get?.responses?.['400']?.$ref
];
for (const ref of errorStatusRefs) {
  if (!ref?.startsWith('#/components/responses/')) {
    throw new Error('API error responses must use shared component response refs.');
  }
}

const leaderboardResponse = openApi.components.schemas.LeaderboardResponse;
if (leaderboardResponse.additionalProperties !== false) {
  throw new Error('LeaderboardResponse must close additional properties.');
}
if (JSON.stringify(leaderboardResponse.required) !== JSON.stringify(['total', 'results'])) {
  throw new Error('LeaderboardResponse must require total and results.');
}
if (leaderboardResponse.properties?.results?.items?.$ref !== '#/components/schemas/LeaderboardEntry') {
  throw new Error('LeaderboardResponse.results must contain LeaderboardEntry items.');
}

console.log('Contract validation passed.');
