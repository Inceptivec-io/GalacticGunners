import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';

export class PauseScene extends Phaser.Scene {
  #sequence = 1;
  #targetScene = 'Level1Scene';
  constructor() {
    super('PauseScene');
  }

  init(data: { sequence?: number; targetScene?: 'Level1Scene' | 'BoardingScene' } = {}): void {
    this.#sequence = data.sequence ?? 1;
    this.#targetScene = data.targetScene ?? 'Level1Scene';
  }

  create(): void {
    const { width, height } = this.scale;
    const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x020712, 0.44).setDepth(30);
    this.add.image(width / 2, height / 2, RUNTIME_ASSETS.pause.screen.key)
      .setDisplaySize(Math.min(width * 0.66, 760), Math.min(height * 0.56, 470))
      .setAlpha(0.58)
      .setDepth(31);
    this.add.image(width / 2, height / 2 - 56, RUNTIME_ASSETS.ui.pauseIcon.key)
      .setDisplaySize(96, 64)
      .setDepth(32);
    this.add.text(width / 2, height / 2 + 30, 'PAUSED', {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif',
      fontSize: '48px',
      align: 'center',
    }).setOrigin(0.5).setDepth(33);
    const resume = this.createAction(width / 2, height / 2 + 94, 'RESUME', () => this.resumeLevel());
    const restart = this.createAction(width / 2, height / 2 + 156, 'RESTART', () => this.restartLevel());
    const menu = this.createAction(width / 2, height / 2 + 218, 'MAIN MENU', () => this.returnToMenu());
    [resume, restart, menu].forEach((control) => control.setData('qa', 'pause-action'));
    this.input.keyboard?.on('keydown-ESC', this.resumeLevel, this);
    this.input.keyboard?.on('keydown-R', this.restartLevel, this);
    this.input.keyboard?.on('keydown-M', this.returnToMenu, this);

    this.input.keyboard?.on('keydown-P', this.resumeLevel, this);
    this.input.gamepad?.on('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 9) this.resumeLevel();
    });

    if (typeof window !== 'undefined') {
      window.__GALACTIC_GUNNERS_PAUSE_QA__ = {
        scene: 'PauseScene',
        viewport: { width, height },
        visibleTexts: ['PAUSED', 'RESUME', 'RESTART', 'MAIN MENU'],
        backdrop: { texture: 'translucent-overlay', alpha: backdrop.fillAlpha, visible: backdrop.visible },
        actions: [
          { action: 'resume', x: resume.x, y: resume.y, width: resume.displayWidth, height: resume.displayHeight },
          { action: 'restart', x: restart.x, y: restart.y, width: restart.displayWidth, height: restart.displayHeight },
          { action: 'menu', x: menu.x, y: menu.y, width: menu.displayWidth, height: menu.displayHeight },
        ],
      };
    }

    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown-P', this.resumeLevel, this);
      this.input.keyboard?.off('keydown-ESC', this.resumeLevel, this);
      this.input.keyboard?.off('keydown-R', this.restartLevel, this);
      this.input.keyboard?.off('keydown-M', this.returnToMenu, this);
      if (typeof window !== 'undefined') delete window.__GALACTIC_GUNNERS_PAUSE_QA__;
    });
  }

  private createAction(x: number, y: number, label: string, handler: () => void): Phaser.GameObjects.Text {
    const action = this.add.text(x, y, label, {
      color: '#d7e9ff',
      backgroundColor: '#123763',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '26px',
      padding: { x: 22, y: 12 },
    }).setOrigin(0.5).setDepth(34).setInteractive({ useHandCursor: true });
    action.on('pointerdown', handler);
    return action;
  }

  private resumeLevel(): void {
    this.input.keyboard?.resetKeys();
    this.scene.stop();
    this.scene.resume(this.#targetScene);
  }

  private restartLevel(): void {
    this.input.keyboard?.resetKeys();
    if (this.#targetScene === 'BoardingScene') {
      this.scene.stop('BoardingScene');
      this.scene.resume('Level1Scene', { boardingOutcome: 'ABORTED', boardingValidated: false });
      return;
    }
    this.scene.stop('Level1Scene');
    this.scene.start('Level1Scene', { sequence: this.#sequence });
  }

  private returnToMenu(): void {
    this.input.keyboard?.resetKeys();
    this.scene.stop(this.#targetScene);
    if (this.#targetScene === 'BoardingScene') this.scene.stop('Level1Scene');
    this.scene.start('MainMenuScene');
  }
}

declare global {
  interface Window {
    __GALACTIC_GUNNERS_PAUSE_QA__?: Record<string, unknown>;
  }
}
