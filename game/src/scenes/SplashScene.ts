import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';

/** First-launch-only key-art hold. Scene transitions never restart it. */
export class SplashScene extends Phaser.Scene {
  constructor() { super('SplashScene'); }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x02050d, 1);
    const art = this.add.image(width / 2, height / 2, RUNTIME_ASSETS.keyArt.launch.key);
    const scale = Math.max(width / art.width, height / art.height);
    art.setDisplaySize(art.width * scale, art.height * scale);
    this.add.rectangle(width / 2, height * 0.89, width, height * 0.22, 0x02050d, 0.48);
    this.add.text(width / 2, height * 0.9, 'Copyright © 2026. Powered by Inceptivec. All rights reserved.\nCollaborators: Aroura Leonardi', {
      color: '#f7d56a', fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif', fontSize: `${Math.max(14, Math.min(24, width * 0.018))}px`, align: 'center',
      stroke: '#02050d', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2);
    this.time.delayedCall(4000, () => this.scene.start('MainMenuScene'));
  }
}
