import type { BoardingSnapshot } from './types';

/**
 * The boarding protocol hashes data, not JavaScript insertion order.  Keep the
 * canonicalizer deliberately small and reject values that JSON cannot represent
 * instead of silently turning them into a different authority record.
 */
export function canonicalBoardingJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Boarding snapshot contains a non-finite number.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalBoardingJson).join(',')}]`;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalBoardingJson(record[key])}`).join(',')}}`;
  }
  throw new TypeError(`Boarding snapshot contains unsupported ${typeof value} value.`);
}

export async function digestBoardingSnapshot(snapshot: BoardingSnapshot): Promise<string> {
  const canonical = canonicalBoardingJson(snapshot);
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
