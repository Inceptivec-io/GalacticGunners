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
  playerBodySize: Size;
  scoutBodySize: Size;
  shieldBodySize: Size;
  projectileBodySize: Size;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createPlayfieldLayout(width: number, height: number): PlayfieldLayout {
  const gameplayWidth = Math.min(width * 0.94, 1120);
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

  const scoutWidth = clamp(gameplayRect.width / 35, 10, 34);
  const scoutSize = { width: scoutWidth, height: scoutWidth * 0.92 };
  const playerHeight = clamp(height * 0.15, 86, 132);
  const playerSize = { width: playerHeight * 0.75, height: playerHeight };
  const projectileHeight = clamp(height * 0.105, 60, 96);
  const projectileSize = { width: clamp(projectileHeight * 0.24, 14, 24), height: projectileHeight };
  const shieldTile = clamp(gameplayRect.width / 112, 6, 12);

  const playerSpawn = {
    x: width / 2,
    y: gameplayRect.y + gameplayRect.height - playerSize.height / 2 - 10,
  };

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
      y: gameplayRect.y + gameplayRect.height * 0.66,
      width: gameplayRect.width,
      height: shieldTile * 5,
    },
    playerSize,
    scoutSize,
    shieldTileSize: { width: shieldTile, height: shieldTile },
    projectileSize,
    playerBodySize: { width: playerSize.width * 0.48, height: playerSize.height * 0.62 },
    scoutBodySize: { width: scoutSize.width * 0.74, height: scoutSize.height * 0.62 },
    shieldBodySize: { width: shieldTile * 0.92, height: shieldTile * 0.92 },
    projectileBodySize: { width: projectileSize.width * 0.72, height: projectileSize.height * 0.78 },
  };
}
