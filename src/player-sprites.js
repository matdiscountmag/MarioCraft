// player-sprites.js — Nicky sprite frames.
// K=black, B=brick-red (#C84800), Z=peach-skin (#FCB89C), .=transparent
// All sprites face RIGHT. Pass flipX=true to drawSprite for left-facing.

// Standing idle — from SmallMario.csv
// CSV color key: b→K (black), r→B (brick-red), p→Z (peach), empty→.
// Empty row at top so shoe base lands at row 15, flush with physics bottom.
export const PLAYER_SMALL_STAND_R = [
  '................',  // empty top
  '.....KKKKKK.....',  // cap peak
  '....KBBBBBBKK...',  // cap
  '...KBBBBBBBBBK..',  // cap wide
  '...KKKZZKZKKK...',  // face top
  '..KZZKKZKZZZZK..',  // face (eyes/nose)
  '..KZZKKZZKZZZK..',  // face
  '...KKZZZKKKKK...',  // chin/collar
  '....KKZZZZZK....',  // collar
  '...KBBKKBBK.....',  // shirt top
  '..KBBBBKKBBK....',  // shirt
  '..KBBBBKKKKK....',  // shirt bottom
  '...KZZZKKZKK....',  // overalls/legs
  '...KZZBBKKKK....',  // shoes top
  '....KBBBBK......',  // shoes
  '....KKKKKK......',  // shoe base — row 15, flush with ground
];

// Walk frame 1 — from SmallMarioWalk.csv (arms-out running pose)
// 15-wide CSV padded to 16 with one dot on the right.
export const PLAYER_SMALL_WALK1_R = [
  '.....KKKKK......',  // cap peak
  '....KBBBBBKK....',  // cap
  '...KBBBBBBBBK...',  // cap wide
  '...KKKZZKZKK....',  // face top
  '..KZZKKZKZZZK...',  // face
  '..KZZKKZZKZZK...',  // face
  '...KKZZZKKKK....',  // collar
  '.KKKKKZZZZZKKKK.',  // arms out wide
  'KZZBBBKKBBKBZZK.',  // upper body / arms
  'KZZBBBBKKBKBZZK.',  // upper body / arms
  '.KZBBBKKKKKBZK..',  // lower body
  '..KKKKKKZ.ZKK...',  // overalls
  '..KKKKKKKKKBK...',  // overalls lower
  '.KBBKKKKKKBBK...',  // shoes top
  '.KBBBK..KBBK....',  // shoes (legs apart)
  '..KKK....KK.....',  // shoe base
];

// Walk frame 2 — same pose for now; bob gives the motion feel
export const PLAYER_SMALL_WALK2_R = [
  '.....KKKKK......',
  '....KBBBBBKK....',
  '...KBBBBBBBBK...',
  '...KKKZZKZKK....',
  '..KZZKKZKZZZK...',
  '..KZZKKZZKZZK...',
  '...KKZZZKKKK....',
  '.KKKKKZZZZZKKKK.',
  'KZZBBBKKBBKBZZK.',
  'KZZBBBBKKBKBZZK.',
  '.KZBBBKKKKKBZK..',
  '..KKKKKKZ.ZKK...',
  '..KKKKKKKKKBK...',
  '.KBBKKKKKKBBK...',
  '.KBBBK..KBBK....',
  '..KKK....KK.....',
];

// Jump — placeholder until jump CSV is provided
export const PLAYER_SMALL_JUMP_R = [
  '................',
  '.....KKKKKK.....',
  '....KBBBBBBKK...',
  '...KBBBBBBBBBK..',
  '...KKKZZKZKKK...',
  '..KZZKKZKZZZZK..',
  '..KZZKKZZKZZZK..',
  '...KKZZZKKKKK...',
  '....KKZZZZZK....',
  '...KBBKKBBK.....',
  '..KBBBBKKBBK....',
  '..KBBBBKKKKK....',
  '...KZZZKKZKK....',
  '...KZZBBKKKK....',
  '....KBBBBK......',
  '....KKKKKK......',
];
