import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';
import type { PlayfieldLayout } from '../systems/PlayfieldLayout';

export class Scout {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, layout: PlayfieldLayout) {
    this.sprite = scene.physics.add.sprite(x, y, RUNTIME_ASSETS.enemy.scout.key, 'stable-0');
    this.sprite.setName('scout');
    this.sprite.setData('enemyType', 'scout');
    this.applyLayout(layout);
    this.sprite.setDepth(4);
    this.sprite.play('enemy.scout.idle');
  }

  applyLayout(layout: PlayfieldLayout): void {
    this.sprite.setAngle(180);
    this.sprite.setDisplaySize(layout.scoutSize.width, layout.scoutSize.height);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(layout.scoutBodySize.width / this.sprite.scaleX, layout.scoutBodySize.height / this.sprite.scaleY, true);
  }
}
