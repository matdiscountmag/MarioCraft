// player-sprites.js — Nicky sprite frames.
// N=pink, n=dark pink, V=purple, Z=skin, H=dark brown, K=black, .=transparent
// All sprites face RIGHT. Pass flipX=true to drawSprite for left-facing.

// Standing idle
export const PLAYER_SMALL_STAND_R = [
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
  '.....VVnnVV.....',
  '.....VV..VV.....',
  '.....HHH.HHH....',
  '................',
  '................',
  '................',
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
