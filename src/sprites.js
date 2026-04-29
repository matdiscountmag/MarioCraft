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
  R: '#D03010', r: '#881800', // mushroom red / dark red
  U: '#808080', u: '#505050', // used/hard block
  K: '#000000',              // black
  W: '#F8F8F8',              // white
};

// ── Ground ───────────────────────────────────────────────────────────────────

export const TILE_GROUND_TOP = [
  'gggggggggggggggg',  // dark green top edge (sky/grass border)
  'GGGGGGGGGGGGGGGG',  // bright grass
  'GgGGgGGgGGgGGgGG',  // mixed grass
  'gGGgGGgGGgGGgGGg',  // mixed dark grass
  'gggggggggggggggg',  // dark green shadow at base of grass
  'tttttttttttttttt',  // dark tan separator line
  'TTTtTTTtTTTtTTTt',  // dirt
  'TtTTTtTTTtTTTtTT',
  'TTTTTTTTTTTTTTTT',
  'TtTTTtTTTtTTTtTT',
  'TTtTTTtTTTtTTTtT',
  'TTTTTTTTTTTTTTTT',
  'tTTtTTtTTtTTtTTt',
  'TTTtTTTtTTTtTTTt',
  'TtTTTtTTTtTTTtTT',
  'tttttttttttttttt',
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
  'KKKKKKKKKKKKKKKK',  // top mortar
  'KBBBBBBBKBBBBBBb',  // upper bricks: mortar at col 0 and 8
  'KBBBBBBBKBBBBBBb',
  'KBBBBBBBKBBBBBBb',
  'KBBBBBBBKBBBBBBb',
  'KbbbbbbbKbbbbbbb',  // lower shadow of upper bricks
  'KbbbbbbbKbbbbbbb',
  'KKKKKKKKKKKKKKKK',  // middle mortar
  'BBBBKBBBBBBBKBBb',  // lower bricks: mortar at col 4 and 12 (offset)
  'BBBBKBBBBBBBKBBb',
  'BBBBKBBBBBBBKBBb',
  'BBBBKBBBBBBBKBBb',
  'bbbbKbbbbbbbKbbb',  // lower shadow of lower bricks
  'bbbbKbbbbbbbKbbb',
  'bbbbKbbbbbbbKbbb',
  'KKKKKKKKKKKKKKKK',  // bottom mortar
];

// ? Block: from QuestionBlock.csv design
export const TILE_QBLOCK = [
  'KKKKKKKKKKKKKKKK',
  'KYYYYYYYYYYYYYYK',
  'KYKBBBBBBBBBBKBK',
  'KYBBYYYYYYBBBBBK',
  'KYBYYYYYYYYYBBBK',
  'KYBYYYKKKYYYKBBK',
  'KYBKKKKBBYYYKBBK',
  'KYBBBBYYYYYKKBBK',
  'KYBBBBYYYKKKBBBK',
  'KYBBBBBKKKBBBBBK',
  'KYBBBBYYYBBBBBBK',
  'KYBBBBYYYKBBBBBK',
  'KYBBBBBKKKBBBBBK',
  'KYKBBBBBBBBBBKBK',
  'KYBBBBBBBBBBBBBK',
  'KKKKKKKKKKKKKKKK',
];

export const TILE_USED = [
  'KKKKKKKKKKKKKKKK',  // black border — same family as ? block
  'KUUUUUUUUUUUUUuK',  // gray highlight ring (top-left)
  'KUuuuuuuuuuuuuuK',  // dark gray interior
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUuuuuuuuuuuuuuK',
  'KUUUUUUUUUUUUUuK',  // gray highlight ring (bottom)
  'KuuuuuuuuuuuuuuK',
  'KKKKKKKKKKKKKKKK',
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

// ── Goal tile (finish line — checkerboard yellow/white) ───────────────────────

export const TILE_GOAL = [
  'KKKKKKKKKKKKKKKK',
  'KYYWWYYWWYYWWYYK',
  'KYYWWYYWWYYWWYYK',
  'KWWYYWWYYWWYYWWK',
  'KWWYYWWYYWWYYWWK',
  'KYYWWYYWWYYWWYYK',
  'KYYWWYYWWYYWWYYK',
  'KWWYYWWYYWWYYWWK',
  'KWWYYWWYYWWYYWWK',
  'KYYWWYYWWYYWWYYK',
  'KYYWWYYWWYYWWYYK',
  'KWWYYWWYYWWYYWWK',
  'KWWYYWWYYWWYYWWK',
  'KYYWWYYWWYYWWYYK',
  'KYYWWYYWWYYWWYYK',
  'KKKKKKKKKKKKKKKK',
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

// ── Walker enemy (dome-headed shuffler) ──────────────────────────────────────
// Two walk frames. Color key: K=black outline, e=tan light, E=brown dark, W=white eyes.
// Flip horizontally (drawSprite flipX) when facing right.

export const WALKER_1 = [
  '................',
  '....KKKKKKKK....',
  '...KeeeeeeeeK...',
  '..KeeeeeeeeeeK..',
  '..KeeeeeeeeeeK..',
  '..KeeWWeeWWeeK..',  // eyes: W=white sclera
  '..KeeKKeeKKeeK..',  // pupils: K=black
  '..KeeeeeeeeeeK..',
  '..KEEEEEEEEEEK..',  // belly: E=darker brown
  '..KEEEEEEEEEEK..',
  '..KKKKEEEEKKKK..',  // foot junction
  '...KEEK..KEEK...',  // feet together
  '...KEEK..KEEK...',
  '...KKKK..KKKK...',
  '................',
  '................',
];

export const WALKER_2 = [
  '................',
  '....KKKKKKKK....',
  '...KeeeeeeeeK...',
  '..KeeeeeeeeeeK..',
  '..KeeeeeeeeeeK..',
  '..KeeWWeeWWeeK..',
  '..KeeKKeeKKeeK..',
  '..KeeeeeeeeeeK..',
  '..KEEEEEEEEEEK..',
  '..KEEEEEEEEEEK..',
  '..KKKKEEEEKKKK..',
  '..KEEK....KEEK..',  // feet spread wider (walk step)
  '..KEEK....KEEK..',
  '..KKKK....KKKK..',
  '................',
  '................',
];

// -- Items --

// Mushroom powerup: red domed cap with white spots, white stem, two feet.
// R=#D03010 red, r=#881800 dark red, W=white, u=dark gray (stem)
export const ITEM_MUSHROOM = [
  '................',
  '......RRRR......',  // cap peak
  '....RRRRrRRRR...',  // cap widening, dark right edge
  '...RRRWRRRrRRR..',  // white spot left, shading right
  '..RRRWWRRRrrRRR.',  // wide spot, deeper shadow
  '..RRRWWRRRrrRRR.',
  '..RRRRRRRRRrRRR.',  // cap base
  '...rrrrrrrrrrrR.',  // under-cap shadow
  '....WWWWWWWW....',  // stem top
  '....WuuuuuuW....',  // stem
  '....WuuuuuuW....',
  '....WuuuuuuW....',  // stem bottom
  '...WWuuuuuuWW...',  // feet spreading
  '...WuuuuuuuuW...',  // feet base
  '................',
  '................',
];
