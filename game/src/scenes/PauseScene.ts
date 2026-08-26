import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const backdrop = this.add.image(width / 2, height / 2, RUNTIME_ASSETS.pause.screen.key)
      .setDisplaySize(width, height)
      .setDepth(30);
    this.add.rectangle(width / 2, height / 2, width, height, 0x020712, 0.24).setDepth(31);
    this.add.image(width / 2, height / 2 - 56, RUNTIME_ASSETS.ui.pauseIcon.key)
      .setDisplaySize(96, 64)
      .setDepth(32);
    this.add.text(width / 2, height / 2 + 30, 'PAUSED', {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif',
      fontSize: '48px',
      align: 'center',
    }).setOrigin(0.5).setDepth(33);
    const resume = this.add.text(width / 2, height / 2 + 108, 'RESUME', {
      color: '#d7e9ff',
      backgroundColor: '#123763',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '26px',
      padding: { x: 22, y: 12 },
    }).setOrigin(0.5).setDepth(34).setInteractive({ useHandCursor: true });
    resume.on('pointerdown', () => this.resumeLevel());

    this.input.keyboard?.on('keydown-P', this.resumeLevel, this);
    this.input.gamepad?.on('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 9) {
        this.resumeLevel();
      }
    });

    if (typeof window !== 'undefined') {
      window.__GALACTIC_GUNNERS_PAUSE_QA__ = {
        scene: 'PauseScene',
        visibleTexts: ['PAUSED', 'RESUME'],
        backdrop: { texture: backdrop.texture.key, alpha: backdrop.alpha, visible: backdrop.visible },
      };
    }

    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown-P', this.resumeLevel, this);
      if (typeof window !== 'undefined') {
        delete window.__GALACTIC_GUNNERS_PAUSE_QA__;
      }
    });
  }

  private resumeLevel(): void {
    this.input.keyboard?.resetKeys();
    this.scene.stop();
    this.scene.resume('Level1Scene');
  }
}

declare global {
  interface Window {
    __GALACTIC_GUNNERS_PAUSE_QA__?: Record<string, unknown>;
  }
}
