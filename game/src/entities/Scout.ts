import * as Phaser from 'phaser';

import { FRAME_RECTS, RUNTIME_ASSETS } from '../config/assets';

export class Scout {
  readonly sprite: Phaser.Physics.Arcade.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.image(x, y, RUNTIME_ASSETS.enemy.scout.key);
    this.sprite.setName('scout');
    this.sprite.setData('enemyType', 'scout');
    this.sprite.setCrop(
      FRAME_RECTS.scoutStable.x,
      FRAME_RECTS.scoutStable.y,
      FRAME_RECTS.scoutStable.width,
      FRAME_RECTS.scoutStable.height,
    );
    this.sprite.setDisplaySize(78, 72);
    this.sprite.setDepth(4);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(58, 44);
    body.setOffset(210, 250);
  }
}
