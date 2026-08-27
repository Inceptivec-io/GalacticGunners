import * as Phaser from 'phaser';

import { FRAME_RECTS, REQUIRED_RUNTIME_ASSETS, RUNTIME_ASSETS } from '../config/assets';
import type { GameRuntimeConfig } from '../config/gameConfig';
import { levelChecksum } from '../levels/LevelChecksum';
import { LevelLoader } from '../levels/LevelLoader';
import { CAMPAIGN_DEFINITIONS } from '../levels/campaignDefinitions';
import { LEVEL_ONE_DEFINITION } from '../levels/levelOneDefinition';
import { validateLevelDefinition } from '../levels/LevelValidator';
import { GameApiClient } from '../services/GameApiClient';
import { CampaignSession } from '../systems/CampaignSession';

export class BootScene extends Phaser.Scene {
  constructor(private readonly runtimeConfig: GameRuntimeConfig = {}) {
    super('BootScene');
  }

  preload(): void {
    this.registry.set('runtimeConfig', this.runtimeConfig);
    for (const asset of REQUIRED_RUNTIME_ASSETS) {
      if (asset.key === RUNTIME_ASSETS.fx.explosionSmall.key
        || asset.key === RUNTIME_ASSETS.projectile.nuke.key
        || asset.key === RUNTIME_ASSETS.fx.nukeBurst.key) {
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
      { frameWidth: FRAME_RECTS.explosionSmall.frameWidth, frameHeight: FRAME_RECTS.explosionSmall.frameHeight },
    );
    this.load.spritesheet(
      RUNTIME_ASSETS.projectile.nuke.key,
      RUNTIME_ASSETS.projectile.nuke.runtimePath,
      { frameWidth: FRAME_RECTS.nukeProjectile.frameWidth, frameHeight: FRAME_RECTS.nukeProjectile.frameHeight },
    );
    this.load.spritesheet(
      RUNTIME_ASSETS.fx.nukeBurst.key,
      RUNTIME_ASSETS.fx.nukeBurst.runtimePath,
      { frameWidth: FRAME_RECTS.nukeBurst.frameWidth, frameHeight: FRAME_RECTS.nukeBurst.frameHeight },
    );
  }

  async create(): Promise<void> {
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
    validateLevelDefinition(LEVEL_ONE_DEFINITION);
    // Golden Level 1 must start without an API request. Remote resolution is an
    // explicit campaign-loader capability, never an implicit gameplay dependency.
    const loader = new LevelLoader(this.runtimeConfig.apiBaseUrl);
    const campaignRuntime = await Promise.all(CAMPAIGN_DEFINITIONS.map(async (definition) => {
      validateLevelDefinition(definition);
      const fallback = { definition, checksum: await levelChecksum(definition), source: 'package' as const };
      return loader.load(definition.slug, definition).catch(() => fallback);
    }));
    this.registry.set('campaignRuntime', campaignRuntime);
    this.registry.set('levelRuntime', campaignRuntime[0]);
    const campaignSession = new CampaignSession(this.runtimeConfig.apiBaseUrl ? new GameApiClient(this.runtimeConfig.apiBaseUrl) : null, LEVEL_ONE_DEFINITION.seed);
    await campaignSession.start();
    this.registry.set('campaignSession', campaignSession);

    this.anims.create({
      key: 'fx.explosionSmall.play',
      frames: this.anims.generateFrameNumbers(RUNTIME_ASSETS.fx.explosionSmall.key, { start: 0, end: FRAME_RECTS.explosionSmall.endFrame }),
      frameRate: 14,
      repeat: 0,
      hideOnComplete: true,
    });
    this.anims.create({
      key: 'projectile.nuke.fly',
      frames: this.anims.generateFrameNumbers(RUNTIME_ASSETS.projectile.nuke.key, { start: 0, end: FRAME_RECTS.nukeProjectile.endFrame }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'fx.nukeBurst.play',
      frames: this.anims.generateFrameNumbers(RUNTIME_ASSETS.fx.nukeBurst.key, { start: 0, end: FRAME_RECTS.nukeBurst.endFrame }),
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
    const fixedFrames = [
      [RUNTIME_ASSETS.enemy.cruiser.key, FRAME_RECTS.cruiser],
      [RUNTIME_ASSETS.enemy.destroyer.key, FRAME_RECTS.destroyer],
      [RUNTIME_ASSETS.fx.asteroid.key, FRAME_RECTS.asteroid],
      [RUNTIME_ASSETS.fx.comet.key, FRAME_RECTS.comet],
    ] as const;
    for (const [key, frames] of fixedFrames) {
      const texture = this.textures.get(key);
      for (const frame of frames) {
        if (!texture.has(frame.name)) texture.add(frame.name, 0, frame.x, frame.y, frame.width, frame.height);
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
    for (const [key, asset] of [['enemy.cruiser.idle', RUNTIME_ASSETS.enemy.cruiser], ['enemy.destroyer.idle', RUNTIME_ASSETS.enemy.destroyer]] as const) {
      this.anims.create({ key, frames: [{ key: asset.key, frame: 'stable-0' }], frameRate: 1, repeat: -1 });
    }

    this.anims.create({
      key: 'enemy.scout.idle',
      frames: FRAME_RECTS.scout.map((frame) => ({ key: RUNTIME_ASSETS.enemy.scout.key, frame: frame.name })),
      frameRate: 6,
      repeat: -1,
    });
  }
}
