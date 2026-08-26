import type { LevelDefinition } from './LevelDefinition';

export interface LevelRuntimeConfig {
  definition: LevelDefinition;
  checksum: string;
  source: 'remote' | 'cache' | 'package';
}
