#!/usr/bin/env node

import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VALID_ENVIRONMENTS = new Set(['feature', 'dev', 'stage', 'prod']);
const DEFAULT_ADMIN_ROUTE = '/inceptivec-gamification-admin';
const DEFAULT_HOME_ROUTE = '/';
const DEFAULT_PLAY_ROUTE = '/play';
const DEFAULT_LEVEL_API_ROUTE = '/api/v1/levels/';
const DEFAULT_ADMIN_LEVEL_API_ROUTE = '/api/v1/admin/levels/';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    if (key === 'rotate') {
      args.rotate = true;
      continue;
    }
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function normalizeOrigin(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${name} must use http or https.`);
  }
  return url.toString().replace(/\/$/, '');
}

function defaultUrls(environment) {
  if (environment === 'feature' || environment === 'dev') {
    return {
      appUrl: 'http://localhost:3002',
      apiUrl: 'http://localhost:8010/api/v1',
    };
  }
  return { appUrl: null, apiUrl: null };
}

function generatedUsername(environment) {
  return `gg_${environment}_admin_${randomBytes(4).toString('hex')}`;
}

function generatedPassword() {
  return randomBytes(36).toString('base64url');
}

function joinUrl(origin, route) {
  return `${origin}${route.startsWith('/') ? route : `/${route}`}`;
}

const args = parseArgs(process.argv.slice(2));
const environment = args.environment;

if (!VALID_ENVIRONMENTS.has(environment)) {
  throw new Error('Use --environment feature|dev|stage|prod');
}

const defaults = defaultUrls(environment);
const appUrl = normalizeOrigin(args['app-url'] ?? defaults.appUrl, '--app-url');
const apiUrl = normalizeOrigin(args['api-url'] ?? defaults.apiUrl, '--api-url');

const adminRoute = args['admin-route'] ?? DEFAULT_ADMIN_ROUTE;
const homeRoute = args['home-route'] ?? DEFAULT_HOME_ROUTE;
const playRoute = args['play-route'] ?? DEFAULT_PLAY_ROUTE;
const levelApiRoute = args['level-api-route'] ?? DEFAULT_LEVEL_API_ROUTE;
const adminLevelApiRoute = args['admin-level-api-route'] ?? DEFAULT_ADMIN_LEVEL_API_ROUTE;

const webHealthUrl = args['web-health-url'] ?? joinUrl(appUrl, '/api/v1/health/');
const apiHealthUrl = args['api-health-url'] ?? `${apiUrl}/health/`.replace('/api/v1/health/', '/api/v1/health/');

const target = resolve(process.cwd(), `env.${environment}`);
if (existsSync(target) && !args.rotate) {
  throw new Error(`${target} already exists. Use --rotate to replace it intentionally.`);
}

const username = generatedUsername(environment);
const password = generatedPassword();
const generatedAt = new Date().toISOString();

const lines = [
  `GG_ENVIRONMENT=${environment}`,
  '',
  `GG_APP_BASE_URL=${appUrl}`,
  `GG_API_BASE_URL=${apiUrl}`,
  '',
  `GG_HOME_ROUTE=${homeRoute}`,
  `GG_PLAY_ROUTE=${playRoute}`,
  `GG_ADMIN_ROUTE=${adminRoute}`,
  `GG_LEVEL_API_ROUTE=${levelApiRoute}`,
  `GG_ADMIN_LEVEL_API_ROUTE=${adminLevelApiRoute}`,
  '',
  `GG_WEB_HEALTH_URL=${webHealthUrl}`,
  `GG_API_HEALTH_URL=${apiHealthUrl}`,
  '',
  `GG_ADMIN_USERNAME=${username}`,
  `GG_ADMIN_PASSWORD=${password}`,
  `GG_ADMIN_CREDENTIAL_GENERATED_AT=${generatedAt}`,
  'GG_ADMIN_CREDENTIAL_VERSION=1',
  '',
];

writeFileSync(target, lines.join('\n'), { encoding: 'utf8', mode: 0o600 });
try {
  chmodSync(target, 0o600);
} catch {
  // Windows does not use POSIX file modes in the same way; Git ignore remains mandatory.
}

console.log(`Created ${target}`);
console.log(`Environment: ${environment}`);
console.log(`App URL: ${appUrl}`);
console.log(`API URL: ${apiUrl}`);
console.log(`Admin route: ${adminRoute}`);
console.log('Admin credentials were generated into the ignored file and are intentionally not printed.');
