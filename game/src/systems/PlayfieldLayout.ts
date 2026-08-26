export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlayfieldLayout {
  viewport: Size;
  gameplayRect: Rect;
  hudSafeRect: Rect;
  playerSpawn: Point;
  movementBounds: { left: number; right: number; top: number; bottom: number };
  formationBounds: Rect;
  shieldZone: Rect;
  playerSize: Size;
  scoutSize: Size;
  shieldTileSize: Size;
  projectileSize: Size;
  nukeProjectileSize: Size;
  nukeBurstSize: Size;
  playerBodySize: Size;
  scoutBodySize: Size;
  shieldBodySize: Size;
  projectileBodySize: Size;
  nukeProjectileBodySize: Size;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createPlayfieldLayout(width: number, height: number): PlayfieldLayout {
  const gameplayWidth = width * 0.94;
  const gameplayHeight = height * 0.86;
  const gameplayRect = {
    x: (width - gameplayWidth) / 2,
    y: Math.max(72, height * 0.1),
    width: gameplayWidth,
    height: gameplayHeight,
  };
  const hudSafeRect = {
    x: gameplayRect.x + 16,
    y: 14,
    width: gameplayRect.width - 32,
    height: Math.max(48, height * 0.08),
  };

  const scoutWidth = clamp((gameplayRect.width / 35) * 1.075, 10.75, 74);
  const scoutSize = { width: scoutWidth, height: scoutWidth * 0.92 };
  const playerHeight = clamp(height * 0.15, 86, 132) * 0.6;
  const playerSize = { width: playerHeight * 0.75, height: playerHeight };
  const projectileLength = clamp(height * 0.045, 28, 40);
  const projectileThickness = clamp(projectileLength * 0.2, 5, 8);
  const projectileSize = { width: projectileLength, height: projectileThickness };
  const shieldTile = clamp(gameplayRect.width / 112, 4, 14);

  const playerSpawn = {
    x: width / 2,
    y: gameplayRect.y + gameplayRect.height - playerSize.height / 2 - 10,
  };
  const shieldY = playerSpawn.y - playerSize.height * 1.18 - shieldTile * 5;

  return {
    viewport: { width, height },
    gameplayRect,
    hudSafeRect,
    playerSpawn,
    movementBounds: {
      left: gameplayRect.x + playerSize.width / 2,
      right: gameplayRect.x + gameplayRect.width - playerSize.width / 2,
      top: gameplayRect.y + gameplayRect.height * 0.5,
      bottom: playerSpawn.y,
    },
    formationBounds: {
      x: gameplayRect.x,
      y: gameplayRect.y + gameplayRect.height * 0.06,
      width: gameplayRect.width,
      height: gameplayRect.height * 0.24,
    },
    shieldZone: {
      x: gameplayRect.x,
      y: shieldY,
      width: gameplayRect.width,
      height: shieldTile * 5,
    },
    playerSize,
    scoutSize,
    shieldTileSize: { width: shieldTile, height: shieldTile },
    projectileSize,
    nukeProjectileSize: { width: clamp(playerSize.height * 0.8, 48, 68), height: clamp(playerSize.height * 0.26, 16, 24) },
    nukeBurstSize: { width: clamp(playerSize.height * 2.6, 150, 220), height: clamp(playerSize.height * 2.6, 150, 220) },
    playerBodySize: { width: playerSize.width * 0.64, height: playerSize.height * 0.72 },
    scoutBodySize: { width: scoutSize.width * 0.86, height: scoutSize.height * 0.74 },
    shieldBodySize: { width: shieldTile * 0.92, height: shieldTile * 0.92 },
    projectileBodySize: { width: projectileSize.height * 1.08, height: projectileSize.width * 0.96 },
    nukeProjectileBodySize: { width: clamp(playerSize.height * 0.32, 18, 28), height: clamp(playerSize.height * 0.86, 52, 72) },
  };
}
