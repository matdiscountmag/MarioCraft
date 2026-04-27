// level.js — tile grid, save/load, helpers.
// Tile IDs: 'ground_top' | 'ground' | 'hard' | 'brick' | 'qblock' | 'used'
//           'coin' | 'pipe_tl' | 'pipe_tr' | 'pipe_sl' | 'pipe_sr'

export const TILE_SIZE   = 16;
export const LEVEL_COLS  = 96;
export const LEVEL_ROWS  = 48;   // ~3.5 screens tall; ground anchored at rows 46-47

// ── Default level ─────────────────────────────────────────────────────────────
// Ground = rows 46-47. Player stands at row 45 (feet touch ground_top at 46).
// Layout mirrors the original but shifted +34 rows, leaving rows 0-45 as open
// sky/build space. Edit mode sky ceiling is row 2 (rows 0-1 are untouchable sky).
// ? blocks at row 42 = 4 rows above ground (64px rise — bonkable with held jump).
// Hard platforms at row 44 = 2 rows above ground (32px rise — easy jump).

function buildDefaultLevel() {
  const T = Array.from({ length: LEVEL_ROWS }, () => Array(LEVEL_COLS).fill(null));

  // Ground — full width, rows 46-47
  for (let c = 0; c < LEVEL_COLS; c++) {
    T[46][c] = 'ground_top';
    T[47][c] = 'ground';
  }

  // ── Gap 1 (cols 36-38) ──
  for (let c = 36; c <= 38; c++) { T[46][c] = null; T[47][c] = null; }

  // ── Gap 2 (cols 62-64) ──
  for (let c = 62; c <= 64; c++) { T[46][c] = null; T[47][c] = null; }

  // ── Standalone ? blocks — row 42 ──
  T[42][5]  = 'qblock';
  T[42][9]  = 'qblock';
  T[42][14] = 'qblock';

  // ── Coins floating at row 43 — easy to collect with a small jump ──
  for (let c = 7; c <= 11; c++) T[43][c] = 'coin';

  // ── Brick row with embedded ? blocks — row 42, cols 19-26 ──
  for (let c = 19; c <= 26; c++) T[42][c] = 'brick';
  T[42][22] = 'qblock';
  T[42][24] = 'qblock';

  // ── Hard platform — row 44, cols 29-36 ──
  for (let c = 29; c <= 36; c++) T[44][c] = 'hard';

  // ── ? block beside the platform — row 42, col 27 ──
  T[42][27] = 'qblock';

  // ── Pipe emerging from ground — rows 44-45, cols 43-44 ──
  T[44][43] = 'pipe_tl';  T[44][44] = 'pipe_tr';
  T[45][43] = 'pipe_sl';  T[45][44] = 'pipe_sr';

  // ── Staircase — ascending right, cols 50-55 ──
  for (let step = 0; step < 6; step++) {
    for (let r = 45; r >= 45 - step; r--) T[r][50 + step] = 'hard';
  }

  // ── Second stretch — ? blocks and bricks past gap 2 ──
  T[42][67] = 'qblock';
  for (let c = 70; c <= 75; c++) T[42][c] = 'brick';
  T[42][72] = 'qblock';

  // ── Second platform — row 44, cols 79-85 ──
  for (let c = 79; c <= 85; c++) T[44][c] = 'hard';
  T[42][77] = 'qblock';

  return T;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function createLevel(overrides = {}) {
  return {
    width:    LEVEL_COLS,
    height:   LEVEL_ROWS,
    spawn:    { x: 2, y: 45 },
    tiles:    buildDefaultLevel(),
    entities: [
      { type: 'stomper', x: 240, y: 720 },  // y = row 45 * 16
    ],
    ...overrides,
  };
}

export function loadLevel() {
  try {
    const saved = localStorage.getItem('mario-tablet:level:custom');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Guard: if the saved level has the old 14-row height, discard it
      if (parsed.height && parsed.height < LEVEL_ROWS) return createLevel();
      return parsed;
    }
  } catch (e) { /* Private Browsing or parse error — degrade gracefully */ }
  return createLevel();
}

export function saveLevel(levelData) {
  try {
    localStorage.setItem('mario-tablet:level:custom', JSON.stringify(levelData));
    return true;
  } catch (e) { return false; }
}

export function tileToWorld(col, row) { return { x: col * TILE_SIZE, y: row * TILE_SIZE }; }
export function worldToTile(wx, wy)   { return { col: Math.floor(wx / TILE_SIZE), row: Math.floor(wy / TILE_SIZE) }; }

export function isSolid(tileId) {
  return tileId === 'ground_top' || tileId === 'ground'
    || tileId === 'hard'   || tileId === 'brick'
    || tileId === 'qblock' || tileId === 'used'
    || tileId === 'pipe_tl' || tileId === 'pipe_tr'
    || tileId === 'pipe_sl' || tileId === 'pipe_sr';
}

/** True only for tiles a Super player can break from below. */
export function isBreakable(tileId) {
  return tileId === 'brick';
}

export function getTile(levelData, col, row) {
  if (row < 0 || row >= levelData.height || col < 0 || col >= levelData.width) return null;
  return levelData.tiles[row][col];
}

export function setTile(levelData, col, row, tileId) {
  if (row < 0 || row >= levelData.height || col < 0 || col >= levelData.width) return;
  levelData.tiles[row][col] = tileId;
}
