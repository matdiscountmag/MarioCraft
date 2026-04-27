// level.js — tile grid, save/load, helpers.
// Tile IDs: 'ground_top' | 'ground' | 'hard' | 'brick' | 'qblock' | 'used'
//           'coin' | 'pipe_tl' | 'pipe_tr' | 'pipe_sl' | 'pipe_sr' | 'spawn'

export const TILE_SIZE   = 16;
export const LEVEL_COLS  = 96;
export const LEVEL_ROWS  = 14;

// ── Default level ─────────────────────────────────────────────────────────────
// Ground = rows 12-13. Player head (when standing) = row 11, y=176.
// ? blocks at row 8 = player must rise 32px to bonk them (reachable with hold jump).
// Hard platforms at row 10 = player must rise 32px to land on them (small jump).
// Rule: never place a solid tile at the same column directly between the player
//       and a ? block they're meant to hit — that walls off the jump path.

function buildDefaultLevel() {
  const T = Array.from({ length: LEVEL_ROWS }, () => Array(LEVEL_COLS).fill(null));

  // Ground — full width, rows 12-13
  for (let c = 0; c < LEVEL_COLS; c++) {
    T[12][c] = 'ground_top';
    T[13][c] = 'ground';
  }

  // ── Gap 1 (cols 36-38) ──
  for (let c = 36; c <= 38; c++) { T[12][c] = null; T[13][c] = null; }

  // ── Gap 2 (cols 62-64) ──
  for (let c = 62; c <= 64; c++) { T[12][c] = null; T[13][c] = null; }

  // ── Standalone ? blocks — row 8, open air above ground (no platform below) ──
  // Player rises 32px to bonk them from below.
  T[8][5]  = 'qblock';
  T[8][9]  = 'qblock';
  T[8][14] = 'qblock';

  // ── Coins floating at row 9 — easy to collect with a small jump ──
  for (let c = 7; c <= 11; c++) T[9][c] = 'coin';

  // ── Brick row with embedded ? blocks — row 8, cols 19-26 ──
  for (let c = 19; c <= 26; c++) T[8][c] = 'brick';
  T[8][22] = 'qblock';   // ? in middle of bricks
  T[8][24] = 'qblock';

  // ── Hard platform — row 10, cols 29-36 (player jumps up to it, 32px) ──
  // Note: cols 29-36 have NO ? blocks at row 8-9 above them → no blocked paths.
  for (let c = 29; c <= 36; c++) T[10][c] = 'hard';

  // ── ? block beside the platform — row 8, col 27 (open air, left of platform) ──
  // Reachable from ground (32px rise) and from platform edge.
  T[8][27] = 'qblock';

  // ── Pipe emerging from ground — rows 10-11, cols 43-44 ──
  T[10][43] = 'pipe_tl';  T[10][44] = 'pipe_tr';
  T[11][43] = 'pipe_sl';  T[11][44] = 'pipe_sr';

  // ── Staircase — ascending right, cols 50-55 ──
  for (let step = 0; step < 6; step++) {
    for (let r = 11; r >= 11 - step; r--) T[r][50 + step] = 'hard';
  }

  // ── Second stretch — ? blocks and bricks past gap 2 ──
  T[8][67] = 'qblock';
  for (let c = 70; c <= 75; c++) T[8][c] = 'brick';
  T[8][72] = 'qblock';

  // ── Second platform — row 10, cols 79-85 ──
  for (let c = 79; c <= 85; c++) T[10][c] = 'hard';
  T[8][77] = 'qblock';  // open air, left of second platform — reachable from ground

  return T;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function createLevel(overrides = {}) {
  return {
    width:  LEVEL_COLS,
    height: LEVEL_ROWS,
    spawn:  { x: 2, y: 11 },
    tiles:  buildDefaultLevel(),
    entities: [
      { type: 'stomper', x: 240, y: 176 },
    ],
    qblockContents: {
      '5,8':  'mushroom',
      '9,8':  'coin',
      '14,8': 'coin',
      '22,8': 'coin',
      '24,8': 'mushroom',
      '27,8': 'coin',
      '67,8': 'coin',
      '72,8': 'mushroom',
      '77,8': 'coin',
    },
    ...overrides,
  };
}

export function loadLevel() {
  try {
    const saved = localStorage.getItem('mario-tablet:level:custom');
    if (saved) return JSON.parse(saved);
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

export function getTile(levelData, col, row) {
  if (row < 0 || row >= levelData.height || col < 0 || col >= levelData.width) return null;
  return levelData.tiles[row][col];
}
