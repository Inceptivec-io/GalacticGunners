import * as Phaser from 'phaser';

import type { LevelRuntimeConfig } from '../levels/LevelRuntimeConfig';

/** Shared Phaser combat-scene authority. Individual levels provide content, not mechanics. */
export abstract class CombatLevelScene extends Phaser.Scene {
  protected levelRuntime: LevelRuntimeConfig | null = null;

  protected constructor(key: string) {
    super(key);
  }
}
