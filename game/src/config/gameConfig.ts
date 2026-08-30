export const GAME_ID = 'galactic-gunners';
export const GAME_API_VERSION = 'v1';
export const GAME_VERSION = 'v1.0-s001-l1-slice';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export interface GameRuntimeConfig {
  apiBaseUrl?: string;
  physicsDebug?: boolean;
  hostileQa?: boolean;
  /** Explicit hostile-only offline exercise; never enabled for normal play. */
  allowOfflinePackage?: boolean;
  /** An authenticated Designer preview. It is never a ranked campaign run. */
  previewRuntime?: LevelRuntimeConfig;
  onReady?: () => void;
  /** Announces the customer-visible launch state to the browser host. */
  onLaunchStateChange?: (state: 'splash' | 'main-menu' | 'gameplay' | 'paused') => void;
  /** Surfaces an unrecoverable boot failure through the browser error boundary. */
  onRuntimeError?: (error: Error) => void;
  onExit?: () => void;
}
import type { LevelRuntimeConfig } from '../levels/LevelRuntimeConfig';
