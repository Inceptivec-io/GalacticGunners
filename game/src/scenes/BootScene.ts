import * as Phaser from 'phaser';

import { REQUIRED_RUNTIME_ASSETS, RUNTIME_ASSETS } from '../config/assets';
import type { GameRuntimeConfig } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  constructor(private readonly runtimeConfig: GameRuntimeConfig = {}) {
    super('BootScene');
  }

  preload(): void {
    this.registry.set('runtimeConfig', this.runtimeConfig);
    for (const asset of REQUIRED_RUNTIME_ASSETS) {
      if (asset.key === RUNTIME_ASSETS.fx.explosionSmall.key) {
        continue;
      }
      if (asset.key.startsWith('audio.')) {
        this.load.audio(asset.key, asset.runtimePath);
      } else {
        this.load.image(asset.key, asset.runtimePath);
      }
    }
    this.load.spritesheet(
      RUNTIME_ASSETS.fx.explosionSmall.key,
      RUNTIME_ASSETS.fx.explosionSmall.runtimePath,
      { frameWidth: 493, frameHeight: 797 },
    );
  }

  create(): void {
    const missing = REQUIRED_RUNTIME_ASSETS.filter((asset) => {
      if (asset.key.startsWith('audio.')) {
        return !this.cache.audio.exists(asset.key);
      }
      return !this.textures.exists(asset.key);
    });
    if (missing.length > 0) {
      this.add.text(40, 40, `Missing required assets:\n${missing.map((asset) => asset.key).join('\n')}`, {
        color: '#ff3b30',
        fontFamily: 'monospace',
        fontSize: '24px',
      });
      return;
    }

    this.anims.create({
      key: 'fx.explosionSmall.play',
      frames: this.anims.generateFrameNumbers(RUNTIME_ASSETS.fx.explosionSmall.key, { start: 0, end: 3 }),
      frameRate: 14,
      repeat: 0,
      hideOnComplete: true,
    });

    this.scene.start('MainMenuScene');
  }
}
