import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';

export class Scout {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, RUNTIME_ASSETS.enemy.scout.key, 'stable-0');
    this.sprite.setName('scout');
    this.sprite.setData('enemyType', 'scout');
    this.sprite.setDisplaySize(78, 72);
    this.sprite.setDepth(4);
    this.sprite.play('enemy.scout.idle');
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(58 / this.sprite.scaleX, 44 / this.sprite.scaleY, true);
  }
}
