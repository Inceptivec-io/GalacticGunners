import { levelChecksum } from './LevelChecksum';
import type { LevelDefinition } from './LevelDefinition';
import type { LevelRuntimeConfig } from './LevelRuntimeConfig';
import { validateLevelDefinition } from './LevelValidator';
import { compileLevelDocument } from './LevelCompiler';
import type { LevelAuthoringDocument } from './LevelAuthoringDocument';

export class LevelLoader {
  constructor(private readonly apiBaseUrl?: string) {}

  async load(slug: string, packaged: LevelDefinition): Promise<LevelRuntimeConfig> {
    const cacheKey = `gg-level:${slug}`;
    try {
      if (this.apiBaseUrl) {
        const response = await fetch(`${this.apiBaseUrl}/levels/${slug}/`);
        if (response.ok) {
          const payload = await response.json() as { active_version?: { version: number; config: LevelDefinition | LevelAuthoringDocument; checksum: string } };
          if (payload.active_version) {
            const definition = compileLevelDocument(payload.active_version.config);
            validateLevelDefinition(definition);
            localStorage.setItem(cacheKey, JSON.stringify(payload.active_version));
            return { definition, version: payload.active_version.version, checksum: payload.active_version.checksum, source: 'remote' };
          }
        }
      }
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const value = JSON.parse(cached) as { version?: number; config: LevelDefinition | LevelAuthoringDocument; checksum: string };
        const definition = compileLevelDocument(value.config);
        validateLevelDefinition(definition);
        return { definition, version: value.version ?? definition.version, checksum: value.checksum, source: 'cache' };
      }
    } catch {
      // Offline play remains available through the signed-in-package baseline.
    }
    validateLevelDefinition(packaged);
    return { definition: packaged, version: packaged.version, checksum: await levelChecksum(packaged), source: 'package' };
  }
}
