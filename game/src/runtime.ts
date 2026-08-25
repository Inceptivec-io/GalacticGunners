import type * as Phaser from 'phaser';

import { GAME_HEIGHT, GAME_WIDTH, type GameRuntimeConfig } from './config/gameConfig';

export interface GalacticGunnersGameOptions extends GameRuntimeConfig {
  parent: HTMLElement | string;
}

export async function createGalacticGunnersGame(options: GalacticGunnersGameOptions): Promise<Phaser.Game> {
  const [PhaserRuntime, { BootScene }, { MainMenuScene }, { Level1Scene }] = await Promise.all([
    import('phaser'),
    import('./scenes/BootScene'),
    import('./scenes/MainMenuScene'),
    import('./scenes/Level1Scene'),
  ]);

  const config: Phaser.Types.Core.GameConfig = {
    type: PhaserRuntime.AUTO,
    parent: options.parent,
    backgroundColor: '#030714',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: {
      mode: PhaserRuntime.Scale.RESIZE,
      autoCenter: PhaserRuntime.Scale.NO_CENTER,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: options.physicsDebug ?? false,
      },
    },
    input: {
      gamepad: true,
    },
    scene: [new BootScene(options), MainMenuScene, Level1Scene],
    callbacks: {
      postBoot: () => options.onReady?.(),
    },
  };

  return new PhaserRuntime.Game(config);
}

export function destroyGalacticGunnersGame(game: Phaser.Game): void {
  game.destroy(true);
}
