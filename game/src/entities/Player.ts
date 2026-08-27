import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';
import { LEVEL_ONE_SLICE } from '../config/levelOneSlice';
import type { PlayfieldLayout } from '../systems/PlayfieldLayout';

export interface MovementVector {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  #lastFireAtMs = Number.NEGATIVE_INFINITY;
  #spawn: { x: number; y: number };

  constructor(scene: Phaser.Scene, layout: PlayfieldLayout, spawn = layout.playerSpawn) {
    this.#spawn = spawn;
    this.sprite = scene.physics.add.sprite(spawn.x, spawn.y, RUNTIME_ASSETS.player.ship.key, 'stable-0');
    this.sprite.setName('player');
    this.applyLayout(layout);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setDepth(5);
    this.sprite.play('player.ship.idle');
  }

  applyLayout(layout: PlayfieldLayout): void {
    this.sprite.setDisplaySize(layout.playerSize.width, layout.playerSize.height);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(layout.playerBodySize.width / this.sprite.scaleX, layout.playerBodySize.height / this.sprite.scaleY, true);
    this.clampToPlayfield(layout);
  }

  setSpawn(spawn: { x: number; y: number }): void {
    this.#spawn = spawn;
  }

  get spawn(): { x: number; y: number } {
    return { ...this.#spawn };
  }

  move(vector: MovementVector, layout: PlayfieldLayout): void {
    this.clampToPlayfield(layout);
    const length = Math.hypot(vector.x, vector.y) || 1;
    let velocityX = (vector.x / length) * LEVEL_ONE_SLICE.playerSpeed;
    let velocityY = (vector.y / length) * LEVEL_ONE_SLICE.playerSpeed;
    if ((this.sprite.x <= layout.movementBounds.left && velocityX < 0)
      || (this.sprite.x >= layout.movementBounds.right && velocityX > 0)) {
      velocityX = 0;
    }
    if ((this.sprite.y <= layout.movementBounds.top && velocityY < 0)
      || (this.sprite.y >= layout.movementBounds.bottom && velocityY > 0)) {
      velocityY = 0;
    }
    this.sprite.setVelocity(velocityX, velocityY);
    this.clampToPlayfield(layout);
  }

  stop(): void {
    this.sprite.setVelocity(0, 0);
  }

  respawn(layout: PlayfieldLayout): void {
    this.sprite.enableBody(true, this.#spawn.x, this.#spawn.y, true, true);
    this.sprite.setAlpha(1);
    this.stop();
    this.applyLayout(layout);
  }

  clampToPlayfield(layout: PlayfieldLayout): void {
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, layout.movementBounds.left, layout.movementBounds.right);
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, layout.movementBounds.top, layout.movementBounds.bottom);
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
