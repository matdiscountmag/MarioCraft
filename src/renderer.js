// renderer.js - Canvas drawing, camera, tile rendering, debug overlay.

import { TILE_SIZE, LEVEL_COLS, LEVEL_ROWS } from './level.js';
import {
  drawSprite,
  TILE_GROUND, TILE_GROUND_TOP, TILE_HARD, TILE_BRICK,
  TILE_QBLOCK, TILE_USED, TILE_COIN,
  TILE_PIPE_TL, TILE_PIPE_TR, TILE_PIPE_SL, TILE_PIPE_SR,
  PALETTE,
} from './sprites.js';

export const VIEWPORT_W = 256;
export const VIEWPORT_H = 224;

const TILE_SPRITES = {
  ground:     TILE_GROUND,
  ground_top: TILE_GROUND_TOP,
  hard:       TILE_HARD,
  brick:      TILE_BRICK,
  qblock:     TILE_QBLOCK,
  used:       TILE_USED,
  coin:       TILE_COIN,
  pipe_tl:    TILE_PIPE_TL,
  pipe_tr:    TILE_PIPE_TR,
  pipe_sl:    TILE_PIPE_SL,
  pipe_sr:    TILE_PIPE_SR,
};

const CLOUDS = [
  { wx: 64,   wy: 24, w: 32, h: 16 },
  { wx: 200,  wy: 16, w: 48, h: 16 },
  { wx: 360,  wy: 28, w: 32, h: 12 },
  { wx: 550,  wy: 20, w: 48, h: 16 },
  { wx: 720,  wy: 26, w: 32, h: 12 },
  { wx: 900,  wy: 18, w: 48, h: 16 },
  { wx: 1100, wy: 24, w: 32, h: 16 },
  { wx: 1300, wy: 20, w: 48, h: 16 },
];

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width  = VIEWPORT_W;
    this.canvas.height = VIEWPORT_H;
    this.debug = false;
  }

  draw(levelData, camera, entities, player, gameState) {
    entities  = entities  || [];
    player    = player    || null;
    gameState = gameState || {};
    const ctx = this.ctx;
    const particles  = gameState.particles  || [];
    const blockBumps = gameState.blockBumps || [];
    const items      = gameState.items      || [];

    ctx.fillStyle = PALETTE.S;
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

    this._drawClouds(camera);
    this._drawTiles(levelData, camera, blockBumps);
    this._drawParticles(particles, camera);

    for (let i = 0; i < items.length; i++) {
      if (items[i].draw) items[i].draw(ctx, camera);
    }
    for (let j = 0; j < entities.length; j++) {
      if (entities[j].draw) entities[j].draw(ctx, camera);
    }
    if (player && player.draw) player.draw(ctx, camera);

    this._drawHUD(gameState);
    if (this.debug) this._drawDebugGrid(levelData, camera);
  }

  _drawTiles(levelData, camera, blockBumps) {
    blockBumps = blockBumps || [];
    const ctx = this.ctx;
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol   = Math.min(LEVEL_COLS - 1, Math.ceil((camera.x + VIEWPORT_W) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow   = Math.min(LEVEL_ROWS - 1, Math.ceil((camera.y + VIEWPORT_H) / TILE_SIZE));

    const bumpMap = new Map();
    for (let b = 0; b < blockBumps.length; b++) {
      const bump = blockBumps[b];
      const offset = -Math.round(Math.sin((bump.timer / bump.maxTimer) * Math.PI) * 4);
      bumpMap.set(bump.col + ',' + bump.row, offset);
    }

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tileId = levelData.tiles[row][col];
        if (!tileId) continue;
        const px = col * TILE_SIZE - Math.round(camera.x);
        const bumpOffset = bumpMap.get(col + ',' + row) || 0;
        const py = row * TILE_SIZE - Math.round(camera.y) + bumpOffset;
        const sprite = TILE_SPRITES[tileId];
        if (sprite) drawSprite(ctx, sprite, px, py);
      }
    }
  }

  _drawParticles(particles, camera) {
    if (!particles.length) return;
    const ctx = this.ctx;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const sx = Math.round(p.x - camera.x);
      const sy = Math.round(p.y - camera.y);
      if (sx < -4 || sx > VIEWPORT_W + 4 || sy < -4 || sy > VIEWPORT_H + 4) continue;
      const fade = p.life / p.maxLife;
      ctx.globalAlpha = fade < 0.33 ? fade * 3 : 1;
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - 1, sy - 1, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  _drawClouds(camera) {
    const ctx = this.ctx;
    ctx.fillStyle = PALETTE.W;
    for (let i = 0; i < CLOUDS.length; i++) {
      const c  = CLOUDS[i];
      const sx = c.wx - camera.x;
      const sy = c.wy - camera.y;
      if (sx + c.w < 0 || sx > VIEWPORT_W) continue;
      if (sy + c.h < 0 || sy > VIEWPORT_H) continue;
      this._fillCloud(sx, sy, c.w, c.h);
    }
  }

  _fillCloud(x, y, w, h) {
    const ctx = this.ctx;
    const bh = Math.floor(h * 0.5);
    ctx.fillRect(x + Math.floor(w * 0.1), y + bh, Math.floor(w * 0.8), bh);
    ctx.fillRect(x + Math.floor(w * 0.2), y,       Math.floor(w * 0.6), h);
    ctx.fillRect(x,                        y + bh,  Math.floor(w * 0.3), bh);
    ctx.fillRect(x + Math.floor(w * 0.7),  y + bh,  Math.floor(w * 0.3), bh);
  }

  _drawHUD(gameState) {
    // Phase 7 adds coin counter / lives display.
  }

  _drawDebugGrid(levelData, camera) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.5;
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol   = Math.min(LEVEL_COLS, Math.ceil((camera.x + VIEWPORT_W) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow   = Math.min(LEVEL_ROWS, Math.ceil((camera.y + VIEWPORT_H) / TILE_SIZE));
    for (let col = startCol; col <= endCol; col++) {
      const sx = col * TILE_SIZE - camera.x;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, VIEWPORT_H); ctx.stroke();
    }
    for (let row = startRow; row <= endRow; row++) {
      const sy = row * TILE_SIZE - camera.y;
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(VIEWPORT_W, sy); ctx.stroke();
    }
  }
}

export function createCamera() {
  return { x: 0, y: 0 };
}

export function updateCamera(camera, targetX, targetY, levelPixelWidth, levelPixelHeight) {
  const DEAD_X = 32;
  const targetCamX = targetX - VIEWPORT_W / 2;
  const diffX = targetCamX - camera.x;
  if (Math.abs(diffX) > DEAD_X / 2) {
    camera.x += diffX - Math.sign(diffX) * DEAD_X / 2;
  }
  camera.x = Math.max(0, Math.min(levelPixelWidth - VIEWPORT_W, camera.x));

  const DEAD_Y = 32;
  const targetCamY = targetY - VIEWPORT_H / 2;
  const diffY = targetCamY - camera.y;
  if (Math.abs(diffY) > DEAD_Y / 2) {
    camera.y += diffY - Math.sign(diffY) * DEAD_Y / 2;
  }
  camera.y = Math.max(0, Math.min(levelPixelHeight - VIEWPORT_H, camera.y));
}
