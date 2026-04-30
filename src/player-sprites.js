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
// 15-wide × 15-tall CSV → padded to 16 wide (1 dot right) + empty top row for positioning.
export const PLAYER_SMALL_WALK1_R = [
  '................',  // empty top (shoe base lands at row 15)
  '.....KKKKKK.....',  // cap peak
  '....KBBBBBBKK...',  // cap
  '...KBBBBBBBBBK..',  // cap wide
  '...KKKZZKZKKK...',  // face top
  '..KZZKKZKZZZZK..',  // face
  '..KZZKKZZKZZZK..',  // face
  '...KKZZZKKKKK...',  // collar
  '.KKKKKZZZZZKKKK.',  // arms out wide
  'KZZBBBKKBBKBZZK.',  // upper body / arms
  'KZZBBBBKKBKBZZK.',  // upper body / arms
  '.KZBBBKKKKKBZK..',  // lower body
  '..KKKKKKZ.ZKK...',  // overalls
  '.KBBKKKKKKBBK...',  // shoes top
  '.KBBBK..KBBKK...',  // shoes (legs apart)
  '..KKK....KK.....',  // shoe base
];

// Jump — from smallmariojump.csv. Exactly 16×16, no padding needed.
export const PLAYER_SMALL_JUMP_R = [
  '.....KKKKKK..KK.',  // cap peak (arm reaching up-right)
  '....KBBBBBBKKZZK',  // cap
  '...KBBBBBBBBBKZK',  // cap wide
  '...KKKZZKZKKKZZK',  // face
  '..KZZKKZKZZZZBK.',  // face / arm
  '..KZZKKZZKZZZBK.',  // face / arm
  '...KKZZZKKKKKBK.',  // collar / arm
  '.KBBBKZZZZZKKK..',  // torso / arm out
  'KZZBBKBBBKBK....',  // body
  'KZZKBBKBBKKKKK..',  // body
  'KZZKBKKZKZKKBBK.',  // body / legs
  '.KKKKKKKKKKBBBK.',  // overalls
  '..KBKKKKKKKBBK..',  // legs
  '.KBBBKKKKKKBBK..',  // shoes top
  '.KBBKKKK...KK...',  // shoes (tucked)
  '..KK.KK.........',  // shoe base
];
