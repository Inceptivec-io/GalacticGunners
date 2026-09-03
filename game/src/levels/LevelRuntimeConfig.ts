import type { LevelDefinition } from './LevelDefinition';

export interface LevelRuntimeConfig {
  definition: LevelDefinition;
  version: number;
  checksum: string;
  source: 'remote' | 'cache' | 'package';
}
