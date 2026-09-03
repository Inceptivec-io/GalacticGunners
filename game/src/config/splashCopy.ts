export const SPLASH_DURATION_MS = 4_000;

/** The approved splash is a fixed, readable four-second launch hold. */
export function isGovernedSplashDuration(durationMs: number): boolean {
  return Number.isInteger(durationMs) && durationMs === SPLASH_DURATION_MS;
}

export const SPLASH_COPY =
  "Copyright © 2026. Powered by Inceptivec. All rights reserved.\nCollaborators: Aurora Leonardi";

export function isGovernedSplashCopy(copy: string): boolean {
  return copy === SPLASH_COPY;
}
