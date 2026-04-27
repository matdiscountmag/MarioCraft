// level.js — tile grid definition and load/save helpers.
// Tile IDs (strings) used in the grid:
//   'ground_top'  — green-topped ground tile
//   'ground'      — plain ground fill tile
//   'hard'        — indestructible hard block
//   'brick'       — breakable brick
//   'qblock'      — ? block (contents in qblockContents map)
//   'used'        — depleted block
//   'coin'        — collectible coin tile
//   'pipe_tl'     — pipe top-left quadrant
//   'pipe_tr'     — pipe top-right quadrant
//   'pipe_sl'     — pipe shaft left
//   'pipe_sr'     — pipe shaft right
//   'spawn'       — player spawn marker (rendered as flag icon; exactly one per level)

export const TILE_SIZE = 16;
export const LEVEL_COLS = 96;
export const LEVEL_ROWS = 14;

/** Build the default hardcoded level (Phase 1 test layout). */
function buildDefaultLevel() {
  const tiles = Array.from({ length: LEVEL_ROWS }, () => Array(LEVEL_COLS).fill(null));

  // Ground: bottom two rows fully filled
  for (let col = 0; col < LEVEL_COLS; col++) {
    tiles[LEVEL_ROWS - 1][col] = 'ground';
    tiles[LEVEL_ROWS - 2][col] = 'ground_top';
  }

  // A raised platform (hard blocks) around col 10–14, row 9
  for (let col = 10; col <= 14; col++) {
    tiles[9][col] = 'hard';
  }

  // Some bricks at row 8, cols 18–22
  for (let col = 18; col <= 22; col++) {
    tiles[8][col] = 'brick';
  }

  // ? blocks at row 8, cols 12 and 20
  tiles[8][12] = 'qblock';
  tiles[8][20] = 'qblock';

  // A pipe at cols 30–31, rows 10–12 (pipe top at 10, shaft at 11–12)
  tiles[10][30] = 'pipe_tl';
  tiles[10][31] = 'pipe_tr';
  tiles[11][30] = 'pipe_sl';
  tiles[11][31] = 'pipe_sr';
  tiles[12][30] = 'pipe_sl';
  tiles[12][31] = 'pipe_sr';

  // Another platform further right
  for (let col = 38; col <= 44; col++) {
    tiles[9][col] = 'hard';
  }
  tiles[8][41] = 'qblock';

  // Brick staircase going up, cols 55–60
  for (let step = 0; step < 6; step++) {
    for (let r = LEVEL_ROWS - 3; r >= LEVEL_ROWS - 3 - step; r--) {
      tiles[r][55 + step] = 'hard';
    }
  }

  // Coins floating mid-air, row 7, cols 25–28
  for (let col = 25; col <= 28; col++) {
    tiles[7][col] = 'coin';
  }

  // Gap in ground at cols 47–49
  for (let col = 47; col <= 49; col++) {
    tiles[LEVEL_ROWS - 1][col] = null;
    tiles[LEVEL_ROWS - 2][col] = null;
  }

  return tiles;
}

/** Canonical level data structure. */
export function createLevel(overrides = {}) {
  return {
    width: LEVEL_COLS,
    height: LEVEL_ROWS,
    spawn: { x: 2, y: 11 },
    tiles: buildDefaultLevel(),
    entities: [
      { type: 'stomper', x: 240, y: 176 },
    ],
    qblockContents: {
      '12,8': 'mushroom',
      '20,8': 'coin',
      '41,8': 'coin',
    },
    ...overrides,
  };
}

/** Load custom level from localStorage, fallback to default. */
export function loadLevel() {
  try {
    const saved = localStorage.getItem('mario-tablet:level:custom');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (e) {
    // localStorage disabled (Private Browsing) or parse error — degrade gracefully
  }
  return createLevel();
}

/** Save level to localStorage. Returns false if unavailable. */
export function saveLevel(levelData) {
  try {
    localStorage.setItem('mario-tablet:level:custom', JSON.stringify(levelData));
    return true;
  } catch (e) {
    return false;
  }
}

/** Convert tile grid col/row to world pixel coords (top-left of tile). */
export function tileToWorld(col, row) {
  return { x: col * TILE_SIZE, y: row * TILE_SIZE };
}

/** Convert world pixel coords to tile grid col/row (floor). */
export function worldToTile(wx, wy) {
  return {
    col: Math.floor(wx / TILE_SIZE),
    row: Math.floor(wy / TILE_SIZE),
  };
}

/** Returns true if the tile ID is solid (blocks movement). */
export function isSolid(tileId) {
  return tileId === 'ground_top'
    || tileId === 'ground'
    || tileId === 'hard'
    || tileId === 'brick'
    || tileId === 'qblock'
    || tileId === 'used'
    || tileId === 'pipe_tl'
    || tileId === 'pipe_tr'
    || tileId === 'pipe_sl'
    || tileId === 'pipe_sr';
}

/** Get tile at (col, row), returning null if out of bounds. */
export function getTile(levelData, col, row) {
  if (row < 0 || row >= levelData.height || col < 0 || col >= levelData.width) return null;
  return levelData.tiles[row][col];
}
