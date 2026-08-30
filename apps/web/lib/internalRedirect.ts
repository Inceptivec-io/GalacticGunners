/** Resolve an untrusted login redirect to a same-origin application pathname. */
export function safeInternalRedirect(candidate: string | null, fallback = "/account", trustedOrigin = window.location.origin): string {
  if (!candidate || !candidate.startsWith("/") || candidate.includes("\\") || /%(?:2f|3f|5c|3a)/i.test(candidate)) return fallback;
  try {
    const resolved = new URL(candidate, trustedOrigin);
    if (resolved.origin !== trustedOrigin || !resolved.pathname.startsWith("/") || candidate.startsWith("//")) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
