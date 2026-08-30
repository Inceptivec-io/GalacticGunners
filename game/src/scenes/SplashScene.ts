import * as Phaser from 'phaser';

import { RUNTIME_ASSETS } from '../config/assets';

/** First-launch-only key-art hold. Scene transitions never restart it. */
export class SplashScene extends Phaser.Scene {
  constructor() { super('SplashScene'); }

  create(): void {
    this.registry.get('runtimeConfig')?.onLaunchStateChange?.('splash');
    const { width, height } = this.scale;
    const startedAt = performance.now();
    this.add.rectangle(width / 2, height / 2, width, height, 0x02050d, 1);
    const art = this.add.image(width / 2, height / 2, RUNTIME_ASSETS.keyArt.launch.key);
    const scale = Math.max(width / art.width, height / art.height);
    art.setDisplaySize(art.width * scale, art.height * scale);
    this.add.rectangle(width / 2, height * 0.89, width, height * 0.22, 0x02050d, 0.48);
    this.add.text(width / 2, height * 0.9, 'Copyright © 2026. Powered by Inceptivec. All rights reserved.\nCollaborators: Aroura Leonardi', {
      color: '#f7d56a', fontFamily: 'GalacticGunnersGoldDisplay, Arial, sans-serif', fontSize: `${Math.max(14, Math.min(24, width * 0.018))}px`, align: 'center',
      stroke: '#02050d', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(2);
    if (this.registry.get('runtimeConfig')?.hostileQa && typeof window !== 'undefined') {
      window.__GALACTIC_GUNNERS_SPLASH_QA__ = { scene: 'SplashScene', startedAt, durationMs: 2000 };
    }
    const timer = window.setTimeout(() => {
      if (typeof window !== 'undefined') delete window.__GALACTIC_GUNNERS_SPLASH_QA__;
      this.scene.start('MainMenuScene');
    }, 2000);
    this.events.once('shutdown', () => window.clearTimeout(timer));
  }
}

declare global {
  interface Window {
    __GALACTIC_GUNNERS_SPLASH_QA__?: { scene: string; startedAt: number; durationMs: number };
  }
}
