import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';
import { LEVEL_ONE_SLICE } from '../config/levelOneSlice';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  #lastFireAtMs = Number.NEGATIVE_INFINITY;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, RUNTIME_ASSETS.player.ship.key, 'stable-0');
    this.sprite.setName('player');
    this.sprite.setDisplaySize(112, 150);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(5);
    this.sprite.play('player.ship.idle');
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(54 / this.sprite.scaleX, 92 / this.sprite.scaleY, true);
  }

  move(direction: -1 | 0 | 1): void {
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 58, this.scene.scale.width - 58);
    this.sprite.setVelocityX(direction * LEVEL_ONE_SLICE.playerSpeed);
  }

  clampToPlayfield(): void {
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 58, this.scene.scale.width - 58);
  }

  canFire(nowMs: number): boolean {
    return nowMs - this.#lastFireAtMs >= LEVEL_ONE_SLICE.playerFireCooldownMs;
  }

  markFired(nowMs: number): void {
    this.#lastFireAtMs = nowMs;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
