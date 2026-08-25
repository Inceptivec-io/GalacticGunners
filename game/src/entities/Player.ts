import * as Phaser from 'phaser';

import { FRAME_RECTS, RUNTIME_ASSETS } from '../config/assets';
import { GAME_WIDTH } from '../config/gameConfig';
import { LEVEL_ONE_SLICE } from '../config/levelOneSlice';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Image;
  #lastFireAtMs = Number.NEGATIVE_INFINITY;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.image(x, y, RUNTIME_ASSETS.player.ship.key);
    this.sprite.setName('player');
    this.sprite.setCrop(
      FRAME_RECTS.playerStable.x,
      FRAME_RECTS.playerStable.y,
      FRAME_RECTS.playerStable.width,
      FRAME_RECTS.playerStable.height,
    );
    this.sprite.setDisplaySize(112, 150);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(5);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(54, 92);
    body.setOffset(244, 170);
  }

  move(direction: -1 | 0 | 1): void {
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 58, GAME_WIDTH - 58);
    this.sprite.setVelocityX(direction * LEVEL_ONE_SLICE.playerSpeed);
  }

  clampToPlayfield(): void {
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 58, GAME_WIDTH - 58);
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
