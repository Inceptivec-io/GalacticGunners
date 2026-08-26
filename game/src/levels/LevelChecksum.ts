export async function levelChecksum(value: unknown): Promise<string> {
  const canonical = JSON.stringify(value, Object.keys(value as object).sort());
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
