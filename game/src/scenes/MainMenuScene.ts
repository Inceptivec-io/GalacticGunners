import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, RUNTIME_ASSETS.background.starfield.key)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setDepth(0);
    this.add.image(GAME_WIDTH / 2, 152, RUNTIME_ASSETS.branding.primaryLogo.key)
      .setDisplaySize(640, 214)
      .setDepth(1);

    const subtitle = this.add.text(GAME_WIDTH / 2, 300, 'LEVEL 1 VERTICAL SLICE', {
      color: '#d7e9ff',
      fontFamily: 'GalacticGunnersSilverDisplay, Arial, sans-serif',
      fontSize: '30px',
      align: 'center',
    }).setOrigin(0.5);
    subtitle.setData('qa', 'main-menu-subtitle');

    const start = this.add.text(GAME_WIDTH / 2, 414, 'START', {
      color: '#f7d56a',
      fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif',
      fontSize: '64px',
      align: 'center',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    start.setData('qa', 'start-button');

    const footer = this.add.text(GAME_WIDTH / 2, 604, 'ENTER / SPACE / TOUCH / GAMEPAD A', {
      color: '#7ee8ff',
      fontFamily: 'GalacticGunnersHUD, monospace',
      fontSize: '22px',
      align: 'center',
    }).setOrigin(0.5);
    footer.setData('qa', 'input-hint');

    const go = () => {
      this.sound.play(RUNTIME_ASSETS.audio.uiConfirm.key);
      this.scene.start('Level1Scene');
    };

    start.on('pointerover', () => this.sound.play(RUNTIME_ASSETS.audio.uiSelect.key));
    start.on('pointerdown', go);
    this.input.keyboard?.once('keydown-ENTER', go);
    this.input.keyboard?.once('keydown-SPACE', go);
    this.input.on('gamepadbuttondown', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 0 || button.index === 9) {
        go();
      }
    });
  }
}
