/** Resolve an untrusted login redirect to a same-origin application pathname. */
export function safeInternalRedirect(candidate: string | null, fallback = "/account"): string {
  if (!candidate || !candidate.startsWith("/") || candidate.includes("\\") || /%(?:2f|5c|3a)/i.test(candidate)) return fallback;
  try {
    const origin = window.location.origin;
    const resolved = new URL(candidate, origin);
    if (resolved.origin !== origin || !resolved.pathname.startsWith("/") || candidate.startsWith("//")) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
