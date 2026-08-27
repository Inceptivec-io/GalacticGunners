import { levelChecksum } from './LevelChecksum';
import type { LevelDefinition } from './LevelDefinition';
import type { LevelRuntimeConfig } from './LevelRuntimeConfig';
import { validateLevelDefinition } from './LevelValidator';

export class LevelLoader {
  constructor(private readonly apiBaseUrl?: string) {}

  async load(slug: string, packaged: LevelDefinition): Promise<LevelRuntimeConfig> {
    const cacheKey = `gg-level:${slug}`;
    try {
      if (this.apiBaseUrl) {
        const response = await fetch(`${this.apiBaseUrl}/levels/${slug}/`);
        if (response.ok) {
          const payload = await response.json() as { active_version?: { version: number; config: LevelDefinition; checksum: string } };
          if (payload.active_version) {
            validateLevelDefinition(payload.active_version.config);
            localStorage.setItem(cacheKey, JSON.stringify(payload.active_version));
            return { definition: payload.active_version.config, version: payload.active_version.version, checksum: payload.active_version.checksum, source: 'remote' };
          }
        }
      }
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const value = JSON.parse(cached) as { version?: number; config: LevelDefinition; checksum: string };
        validateLevelDefinition(value.config);
        return { definition: value.config, version: value.version ?? value.config.version, checksum: value.checksum, source: 'cache' };
      }
    } catch {
      // Offline play remains available through the signed-in-package baseline.
    }
    validateLevelDefinition(packaged);
    return { definition: packaged, version: packaged.version, checksum: await levelChecksum(packaged), source: 'package' };
  }
}
