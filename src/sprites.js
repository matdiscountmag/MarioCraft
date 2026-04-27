// sprites.js — Pixel art definitions using string arrays.
// Each character maps to a color in PALETTE. '.' = transparent.
// Tiles are 16×16 unless noted.

export const PALETTE = {
  // Sky / bg
  S: '#6B8CFF', // sky blue
  W: '#F8F8F8', // white
  // Ground / terrain
  T: '#D88040', // ground tan
  t: '#A04000', // ground tan dark
  // Brick
  B: '#C84800', // brick orange
  b: '#803800', // brick dark
  // Block yellow (? block)
  Y: '#F8B800', // block yellow
  y: '#B07800', // block yellow dark
  K: '#000000', // black
  // Pipe
  G: '#50A800', // pipe / hill green
  g: '#006800', // pipe dark green
  L: '#B0E848', // pipe highlight
  // Coin
  C: '#F8B800', // coin gold
  c: '#A87000', // coin gold dark
  // Player (green hero)
  P: '#00A848', // player primary
  p: '#006800', // player primary dark
  R: '#F83800', // player accent
  r: '#A02000', // player accent dark
  Z: '#FCB89C', // skin pink
  H: '#883800', // hair brown
  // Enemies
  E: '#B85820', // stomper brown
  e: '#FCB89C', // stomper light
  // Used block
  U: '#808080', // used block gray
  u: '#505050', // used block dark
};

// Ground tile: textured top surface + fill beneath
export const TILE_GROUND = [
  'TTTtTTTtTTTtTTTt',
  'TtTTTtTTTtTTTtTT',
  'tttttttttttttttt',
  'TTTTTTTTTTTTTTTT',
  'TtTTTtTTTtTTTtTT',
  'TTtTTTtTTTtTTTtT',
  'TTTTTTTTTTTTTTTT',
  'tTTtTTtTTtTTtTTt',
  'TTTtTTTtTTTtTTTt',
  'TtTTTtTTTtTTTtTT',
  'tttttttttttttttt',
  'TTTTTTTTTTTTTTTT',
  'TtTTTtTTTtTTTtTT',
  'TTtTTTtTTTtTTTtT',
  'TTTTTTTTTTTTTTTT',
  'tTTtTTtTTtTTtTTt',
];

// Ground top tile: green grassy top + tan fill
export const TILE_GROUND_TOP = [
  'GGGGGGGGGGGGGGGG',
  'GgGGgGGgGGgGGgGG',
  'gGGgGGgGGgGGgGGg',
  'TTTtTTTtTTTtTTTt',
  'TtTTTtTTTtTTTtTT',
  'tttttttttttttttt',
  'TTTTTTTTTTTTTTTT',
  'TtTTTtTTTtTTTtTT',
  'TTtTTTtTTTtTTTtT',
  'TTTTTTTTTTTTTTTT',
  'tTTtTTtTTtTTtTTt',
  'TTTtTTTtTTTtTTTt',
  'TtTTTtTTTtTTTtTT',
  'tttttttttttttttt',
  'TTTTTTTTTTTTTTTT',
  'TtTTTtTTTtTTTtTT',
];

// Hard block (gray indestructible)
export const TILE_HARD = [
  'UUUUUUUUUUUUUUUU',
  'UWWWWWWWWWWWWWuU',
  'UWuuuuuuuuuuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuuuuuuuuuuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuUUUUUUUUuuWuU',
  'UWuuuuuuuuuuuWuU',
  'UuuuuuuuuuuuuuuU',
  'UUUUUUUUUUUUUUUU',
];

// Brick tile
export const TILE_BRICK = [
  'BBBBBBBBBBBBBBBB',
  'BbbbbbbbBbbbbbbb',
  'BbBBBBBBBbBBBBBB',
  'BbBBBBBBBbBBBBBB',
  'BbBBBBBBBbBBBBBB',
  'BbBBBBBBBbBBBBBB',
  'BbBBBBBBBbBBBBBB',
  'bbbbbbbbbbbbbbbb',
  'bBBBBBBBBBBBBBBb',
  'bBbbbbbbBBbbbbBb',
  'bBBBBBBBBBBBBBBb',
  'bBBBBBBBBBBBBBBb',
  'bBBBBBBBBBBBBBBb',
  'bBBBBBBBBBBBBBBb',
  'bBBBBBBBBBBBBBBb',
  'bbbbbbbbbbbbbbbb',
];

// ? Block tile (with bouncing ? design)
export const TILE_QBLOCK = [
  'YYYYYYYYYYYYYYYY',
  'YyyyyyyyyyyyyyyyY',
  'YyYYYYYYYYYYYYyY',
  'YyYKKKKKKKKKKYyY',
  'YyYKYYKKYYYKKYyY',
  'YyYKYYKKYYKKKYyY',
  'YyYKKKKKKYYKKYyY',
  'YyYKKKKKKYYKKYyY',
  'YyYKKKKKKKKKKYyY',
  'YyYKKKKKKYYKKYyY',
  'YyYKKKKKKKKKKYyY',
  'YyYYYYYYYYYYYYyY',
  'YyyyyyyyyyyyyyyyyY',
  'YyyyyyyyyyyyyyyyyY',
  'YyyyyyyyyyyyyyyyY',
  'YYYYYYYYYYYYYYYY',
];

// Used block (gray, after ? block depleted)
export const TILE_USED = [
  'UUUUUUUUUUUUUUUU',
  'UuuuuuuuuuuuuuuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuUUUUUUUUUUUUuU',
  'UuuuuuuuuuuuuuuU',
  'UUUUUUUUUUUUUUUU',
];

// Coin (8px centered in 16×16)
export const TILE_COIN = [
  '................',
  '................',
  '......CCCC......',
  '.....CcccCC.....',
  '....CcCCCcCC....',
  '....CcCCCcCC....',
  '....CcCCCcCC....',
  '....CcCCCcCC....',
  '....CcCCCcCC....',
  '....CcCCCcCC....',
  '....CcCCCcCC....',
  '.....CcccCC.....',
  '......CCCC......',
  '................',
  '................',
  '................',
];

// Pipe top-left 16×16 quadrant (assemble 2 quads = 32×16 pipe top)
export const TILE_PIPE_TL = [
  'LLLLLLLLGGGGGGGG',
  'LgggggggGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgggggggGGGGGGGG',
  'LLLLLLLLGGGGGGGG',
];

export const TILE_PIPE_TR = [
  'GGGGGGGGggggggLL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGggLL',
  'GGGGGGGGggggggLL',
];

// Pipe shaft left/right 16×16 quadrants
export const TILE_PIPE_SL = [
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
  'LgGGGGGgGGGGGGGG',
];

export const TILE_PIPE_SR = [
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
  'GGGGGGGGGGGGGgGL',
];

/**
 * Draw a sprite (string-array) onto a canvas context at (px, py) in game pixels.
 * Pass flipX=true to mirror horizontally.
 */
export function drawSprite(ctx, sprite, px, py, flipX = false) {
  const rows = sprite.length;
  const cols = sprite[0].length;
  for (let r = 0; r < rows; r++) {
    const row = sprite[r];
    for (let c = 0; c < cols; c++) {
      const ch = flipX ? row[cols - 1 - c] : row[c];
      if (ch === '.' || !PALETTE[ch]) continue;
      ctx.fillStyle = PALETTE[ch];
      ctx.fillRect(px + c, py + r, 1, 1);
    }
  }
}
