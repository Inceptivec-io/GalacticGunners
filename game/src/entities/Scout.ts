import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';
import type { PlayfieldLayout } from '../systems/PlayfieldLayout';

export class Scout {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, layout: PlayfieldLayout, type: 'scout' | 'cruiser' | 'destroyer' = 'scout') {
    const asset = type === 'scout' ? RUNTIME_ASSETS.enemy.scout : type === 'cruiser' ? RUNTIME_ASSETS.enemy.cruiser : RUNTIME_ASSETS.enemy.destroyer;
    this.sprite = scene.physics.add.sprite(x, y, asset.key, 'stable-0');
    this.sprite.setName('scout');
    this.sprite.setData('enemyType', type);
    this.applyLayout(layout);
    this.sprite.setDepth(4);
    this.sprite.play(type === 'scout' ? 'enemy.scout.idle' : type === 'cruiser' ? 'enemy.cruiser.idle' : 'enemy.destroyer.idle');
  }

  applyLayout(layout: PlayfieldLayout): void {
    this.sprite.setAngle(180);
    this.sprite.setDisplaySize(layout.scoutSize.width, layout.scoutSize.height);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(layout.scoutBodySize.width / this.sprite.scaleX, layout.scoutBodySize.height / this.sprite.scaleY, true);
  }
}
