export const GAME_ID = 'galactic-gunners';
export const GAME_API_VERSION = 'v1';
export const GAME_VERSION = 'v1.0-s001-l1-slice';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export interface GameRuntimeConfig {
  apiBaseUrl?: string;
  physicsDebug?: boolean;
  onReady?: () => void;
  onExit?: () => void;
}
