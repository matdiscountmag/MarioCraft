// editor.js — Edit mode: palette strip, tile placement/deletion, drag-to-pan, save/export.

import { TILE_SIZE, LEVEL_COLS, LEVEL_ROWS, setTile, getTile, saveLevel } from './level.js';
import {
  drawSprite,
  TILE_GROUND_TOP, TILE_GROUND, TILE_HARD, TILE_BRICK, TILE_QBLOCK, TILE_COIN,
} from './sprites.js';
import { VIEWPORT_W, VIEWPORT_H } from './renderer.js';

// ── Palette layout ────────────────────────────────────────────────────────────

const PALETTE_W   = 32;
const PALETTE_X   