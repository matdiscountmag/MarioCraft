// player-sprites.js — Nicky sprite frames.
// K=black, B=brick-red (#C84800), Z=peach-skin (#FCB89C), .=transparent
// All sprites face RIGHT. Pass flipX=true to drawSprite for left-facing.

// Standing idle — from SmallMario.csv
// CSV color key: b→K (black), r→B (brick-red), p→Z (peach), empty→.
export const PLAYER_SMALL_STAND_R = [
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
  '....KKKKKK......',  // shoe base
  '................',  // empty row
];

// Walk frame 1 — left leg back, right foot forward
export const PLAYER_SMALL_WALK1_R = [
  '................',
  '.....NNNNN......',
  '....NNNNNNNn....',
  '....ZZZZZZZ.....',
  '....ZKZZZZn.....',
  '....ZZZZZZZ.....',
  '.....VVVVVV.....',
  '....VVVVVVVV....',
  '....VVnnnnVV....',
  '....VVnnnnVV....',
  '.....nnn.VVV....',
  '.....nnn.VVV....',
  '.....HHH.HHH....',
  '................',
  '................',
  '................',
];

// Walk frame 2 — right leg back, left foot forward
export const PLAYER_SMALL_WALK2_R = [
  '................',
  '.....NNNNN......',
  '....NNNNNNNn....',
  '....ZZZZZZZ.....',
  '....ZKZZZZn.....',
  '....ZZZZZZZ.....',
  '.....VVVVVV.....',
  '....VVVVVVVV....',
  '....VVnnnnVV....',
  '....VVnnnnVV....',
  '.....VVV.nnn....',
  '.....VVV.nnn....',
  '.....HHH.HHH....',
  '................',
  '................',
  '................',
];

// Jumping — arms spread, legs tucked
export const PLAYER_SMALL_JUMP_R = [
  '................',
  '.....NNNNN......',
  '....NNNNNNNn....',
  '....ZZZZZZZ.....',
  '....ZKZZZZn.....',
  '....ZZZZZZZ.....',
  '...VVVVVVVVVV...',
  '....VVVVVVVV....',
  '....VVnnnnVV....',
  '.....VVnnVV.....',
  '....VVnnnnVV....',
  '....HHnnnnHH....',
  '................',
  '................',
  '................',
  '................',
];
