import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';
import type { PlayfieldLayout } from '../systems/PlayfieldLayout';

export type HostileType = 'scout' | 'cruiser' | 'destroyer' | 'mothership';

const HOSTILE_PROFILES: Record<HostileType, { width: number; height: number; health: number }> = {
  scout: { width: 44, height: 58, health: 1 },
  cruiser: { width: 72, height: 64, health: 2 },
  destroyer: { width: 92, height: 74, health: 3 },
  mothership: { width: 260, height: 120, health: 30 },
};

export function hostileDisplaySize(layout: PlayfieldLayout, type: HostileType, authoredSize?: { width?: number; height?: number }): { width: number; height: number } {
  const profile = HOSTILE_PROFILES[type];
  const scale = layout.scoutSize.width / HOSTILE_PROFILES.scout.width;
  return {
    // Authoring dimensions are canonical 1280x720 canvas units. Apply the
    // same playfield scale used by the established Scout baseline.
    width: (authoredSize?.width ?? profile.width) * scale,
    height: (authoredSize?.height ?? profile.height) * scale,
  };
}

export class Scout {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, layout: PlayfieldLayout, type: HostileType = 'scout', authoredSize?: { width?: number; height?: number }) {
    const asset = type === 'scout'
      ? RUNTIME_ASSETS.enemy.scout
      : type === 'cruiser'
        ? RUNTIME_ASSETS.enemy.cruiser
        : type === 'destroyer'
          ? RUNTIME_ASSETS.enemy.destroyer
          : RUNTIME_ASSETS.enemy.mothership;
    this.sprite = scene.physics.add.sprite(x, y, asset.key, 0);
    this.sprite.setName(`hostile:${type}`);
    this.sprite.setData('enemyType', type);
    this.sprite.setData('health', HOSTILE_PROFILES[type].health);
    this.applyLayout(layout, type, authoredSize);
    this.sprite.setDepth(4);
    this.sprite.play(type === 'scout' ? 'enemy.scout.idle' : type === 'cruiser' ? 'enemy.cruiser.idle' : type === 'destroyer' ? 'enemy.destroyer.idle' : 'enemy.mothership.idle');
  }

  applyLayout(layout: PlayfieldLayout, type: HostileType = 'scout', authoredSize?: { width?: number; height?: number }): void {
    const { width, height } = hostileDisplaySize(layout, type, authoredSize);
    this.sprite.setAngle(180);
    this.sprite.setDisplaySize(width, height);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(width * 0.72 / this.sprite.scaleX, height * 0.7 / this.sprite.scaleY, true);
  }
}
