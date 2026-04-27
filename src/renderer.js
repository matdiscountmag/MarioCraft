// renderer.js — Canvas drawing, camera, tile rendering, debug overlay.

import {
  TILE_SIZE, LEVEL_COLS, LEVEL_ROWS,
} from './level.js';
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

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width  = VIEWPORT_W;
    this.canvas.height = VIEWPORT_H;
    this.debug = false;
  }

  draw(levelData, camera, entities = [], player = null, gameState = {}) {
    const { ctx } = this;
    const { particles = [], blockBumps = [], items = [] } = gameState;

    // Sky
    ctx.fillStyle = PALETTE.S;
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

    this._drawClouds(camera.x);
    this._drawTiles(levelData, camera, blockBumps);
    this._drawParticles(particles, camera);

    // Items (mushrooms, coin pops) — behind player
    for (const item of items) {
      if (item.draw) item.draw(ctx, camera);
    }

    for (const e of entities) {
      if (e.draw) e.draw(ctx, camera);
    }

    if (player && player.draw) player.draw(ctx, camera);

    this._drawHUD(gameState);

    if (this.debug) this._drawDebugGrid(levelData, camera);
  }

  _drawTiles(levelData, camera, blockBumps = []) {
    const { ctx } = this;
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const endCol   = Math.min(LEVEL_COLS - 1, Math.ceil((camera.x + VIEWPORT_W) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const endRow   = Math.min(LEVEL_ROWS - 1, Math.ceil((camera.y + VIEWPORT_H) / TILE_SIZE));

    // Build bump-offset lookup for this frame (O(1) per tile)
    const bumpMap = new Map();
    for (const b of blockBumps) {
      const offset = -Math.round(Math.sin((b.timer / b.maxTimer) * Math.PI) * 4);
      bumpMap.set(`${b.col},${b.row}`, offset);
    }

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tileId = levelData.tiles[row][col];
        if (!tileId) continue;

        const px = col * TILE_SIZE - Math.round(camera.x);
        const bumpOffset = bumpMap.get(`${col},${row}`) ?? 0;
        const py = row * TILE_SIZE - Math.round(camera.y) + bumpOffset;

        const sprite = TILE_SPRITES[tileId];
        if (sprite) {
          drawSprite(ctx, sprite, px, py);
        } else if (tileId === 'spawn') {
          ctx.fillStyle = '#00A848';
          ctx.fillRect(px + 6, py + 2, 2, 12);
          ctx.fillRect(px + 8, py + 2, 6, 6);
        }
      }
    }
  }

  _drawParticles(particles, camera) {
    if (!particles.length) return;
    const { ctx } = this;
    for (const p of particles) {
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

  _drawClouds(camX) {
    const { ctx } = this;
    const clouds = [
      { wx: 64,   wy: 20, w: 32, h: 16 },
      { wx: 200,  wy: 16, w: 48, h: 16 },
      { wx: 360,  wy: 24, w: 32, h: 12 },
      { wx: 550,  wy: 18, w: 48, h: 16 },
      { wx: 720,  wy: 22, w: 32, h: 12 },
      { wx: 900,  wy: 16, w: 48, h: 16 },
      { wx: 1100, wy: 20, w: 32, h: 16 },
      { wx: 1300, wy: 18, w: 48, h: 16 },
    ];
    ctx.fillStyle = PALETTE.W;
    for (const c of clouds) {
      const sx = c.wx - camX;
      if (sx + c.w < 0 || sx > VIEWPORT_W) continue;
      this._fillCloud(sx, c.wy, c.w, c.h);
    }
  }

  _fillCloud(x, y, w, h) {
    const { ctx } = this;
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
    const { ctx } = this;
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

export function updateCamera(camera, targetX, levelPixelWidth) {
  const DEAD_ZONE = 32;
  const targetCamX = targetX - VIEWPORT_W / 2;
  const diff = targetCamX - camera.x;
  if (Math.abs(diff) > DEAD_ZONE / 2) {
    camera.x += diff - Math.sign(diff) * DEAD_ZONE / 2;
  }
  camera.x = Math.max(0, Math.min(levelPixelWidth - VIEWPORT_W, camera.x));
  camera.y = 0;
}
