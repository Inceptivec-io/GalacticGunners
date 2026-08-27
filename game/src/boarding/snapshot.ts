import type { BoardingSnapshot } from './types';

export async function digestBoardingSnapshot(snapshot: BoardingSnapshot): Promise<string> {
  const canonical = JSON.stringify(snapshot, Object.keys(snapshot).sort());
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
