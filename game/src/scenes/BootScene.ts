import * as Phaser from 'phaser';

import { FRAME_RECTS, REQUIRED_RUNTIME_ASSETS, RUNTIME_ASSETS } from '../config/assets';
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

    this.registerTextureFrames();
    this.createShipAnimations();

    this.anims.create({
      key: 'fx.explosionSmall.play',
      frames: this.anims.generateFrameNumbers(RUNTIME_ASSETS.fx.explosionSmall.key, { start: 0, end: 3 }),
      frameRate: 14,
      repeat: 0,
      hideOnComplete: true,
    });

    this.scene.start('MainMenuScene');
  }

  private registerTextureFrames(): void {
    const playerTexture = this.textures.get(RUNTIME_ASSETS.player.ship.key);
    for (const frame of FRAME_RECTS.player) {
      if (!playerTexture.has(frame.name)) {
        playerTexture.add(frame.name, 0, frame.x, frame.y, frame.width, frame.height);
      }
    }

    const scoutTexture = this.textures.get(RUNTIME_ASSETS.enemy.scout.key);
    for (const frame of FRAME_RECTS.scout) {
      if (!scoutTexture.has(frame.name)) {
        scoutTexture.add(frame.name, 0, frame.x, frame.y, frame.width, frame.height);
      }
    }
  }

  private createShipAnimations(): void {
    this.anims.create({
      key: 'player.ship.idle',
      frames: FRAME_RECTS.player.map((frame) => ({ key: RUNTIME_ASSETS.player.ship.key, frame: frame.name })),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'enemy.scout.idle',
      frames: FRAME_RECTS.scout.map((frame) => ({ key: RUNTIME_ASSETS.enemy.scout.key, frame: frame.name })),
      frameRate: 6,
      repeat: -1,
    });
  }
}
