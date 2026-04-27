// sprites.js — Palette, tile art, and sprite renderer.
// Player sprites live in player-sprites.js to keep file sizes manageable.

export const PALETTE = {
  S: '#6B8CFF',             // sky blue
  T: '#D88040', t: '#A04000', // ground tan
  B: '#C84800', b: '#803800', // brick orange
  Y: '#F8B800', y: '#B07800', // block yellow
  G: '#50A800', g: '#006800', L: '#B0E848', // pipe green
  C: '#F8B800', c: '#A87000', // coin gold
  N: '#F878B8', n: '#A02060', // Nicky pink
  V: '#7840C8', v: '#3C1880', // Nicky purple
  Z: '#FCB89C',              // skin
  H: '#883800',              // hair / shoes
  E: '#B85820', e: '#FCB89C', // enemy brown
  U: '#808080', u: '#505050', // used/hard block
  K: '#000000',              // black
  W: '#F8F8F8',              // white
};

// ── Ground ───────────────────────────────────────────────────────────────────

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

// ── Blocks ───────────────────────────────────────────────────────────────────

export const TILE_HARD = [
  'UUUUUUUUUUUUUUUU',
  'UWWWWWWWWWWWWWuU',
  'UWuuuuuuuuuuuWuU',
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
  'UWWWWWWWWWWWWWuU',
  'UuuuuuuuuuuuuuuU',
  'UUUUUUUUUUUUUUUU',
];

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

// ? Block: black border → yellow inner → corner dots → orange body → yellow ?
export const TILE_QBLOCK = [
  'KKKKKKKKKKKKKKKK',
  'KYYYYYYYYYYYYYYK',
  'KYKBBBBBBBBBBKYK',
  'KYBBBBYYYYBBBBYK',
  'KYBBYBBBBBYBBBYK',
  'KYBBBBBBBYBBBBYK',
  'KYBBBBBBYBBBBBYK',
  'KYBBBBBYBBBBBBYK',
  'KYBBBBBBBBBBBBYK',
  'KYBBBBBYBBBBBBYK',
  'KYBBBBBYBBBBBBYK',
  'KYBBBBBBBBBBBBYK',
  'KYBBBBBBBBBBBBYK',
  'KYKBBBBBBBBBBKYK',
  'KYYYYYYYYYYYYYYK',
  'KKKKKKKKKKKKKKKK',
];

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

// ── Pipes ────────────────────────────────────────────────────────────────────

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

// ── Sprite renderer ───────────────────────────────────────────────────────────

/**
 * Draw a sprite (string-array) at game-pixel coords (px, py).
 * flipX=true mirrors horizontally for left-facing characters.
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
