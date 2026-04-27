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

// World-space positions. Ground is at world y=736. Camera.y during normal play ≈ 544.
// At camera.y=544: clouds appear at screen y ≈ 18–34, hills/bushes near screen y ≈ 150–192.

const CLOUDS = [
  { wx: 40,   wy: 574, large: false },
  { wx: 190,  wy: 563, large: true  },
  { wx: 380,  wy: 578, large: false },
  { wx: 510,  wy: 565, large: true  },
  { wx: 700,  wy: 574, large: false },
  { wx: 870,  wy: 562, large: true  },
  { wx: 1060, wy: 577, large: false },
  { wx: 1230, wy: 564, large: true  },
  { wx: 1400, wy: 576, large: false },
];

// Hills: dome upward from ground level (wy=736). r = dome radius in px.
const HILLS = [
  { wx: -10,  wy: 736, r: 48 },
  { wx: 180,  wy: 736, r: 40 },
  { wx: 390,  wy: 736, r: 56 },
  { wx: 630,  wy: 736, r: 40 },
  { wx: 830,  wy: 736, r: 52 },
  { wx: 1070, wy: 736, r: 40 },
  { wx: 1270, wy: 736, r: 56 },
];

// Bushes: alternate with hills along the ground.
const BUSHES = [
  { wx: 110,  wy: 736, large: false },
  { wx: 300,  wy: 736, large: true  },
  { wx: 530,  wy: 736, large: false },
  { wx: 750,  wy: 736, large: true  },
  { wx: 970,  wy: 736, large: false },
  { wx: 1170, wy: 736, large: true  },
  { wx: 1390, wy: 736, large: false },
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

    // Sky
    ctx.fillStyle = PALETTE.S;
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

    // Background decorations (drawn before tiles so tiles overlap them)
    this._drawHills(camera);
    this._drawBushes(camera);
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

  // ── Tiles ─────────────────────────────────────────────────────────────────

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

  // ── Particles ─────────────────────────────────────────────────────────────

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

  // ── Background: clouds ────────────────────────────────────────────────────

  _drawClouds(camera) {
    for (let i = 0; i < CLOUDS.length; i++) {
      const c  = CLOUDS[i];
      const sx = Math.round(c.wx - camera.x);
      const sy = Math.round(c.wy - camera.y);
      const w  = c.large ? 48 : 32;
      const h  = c.large ? 18 : 13;
      if (sx + w < 0 || sx > VIEWPORT_W) continue;
      if (sy + h < 0 || sy > VIEWPORT_H) continue;
      this._drawNESCloud(sx, sy, c.large);
    }
  }

  // NES-style cloud: 3 bumps (left/center/right) with black outline, white fill.
  _drawNESCloud(sx, sy, large) {
    const ctx = this.ctx;
    const W = large ? 48 : 32;

    // Bump centres and radii (positions relative to sx)
    const bumps = large
      ? [{ cx: sx + 9,  r: 7 }, { cx: sx + 24, r: 10 }, { cx: sx + 39, r: 8 }]
      : [{ cx: sx + 6,  r: 5 }, { cx: sx + 16, r:  7 }, { cx: sx + 27, r: 6 }];

    // baseY = where bumps meet the rectangular base of the cloud
    const baseY = sy + (large ? 10 : 7);
    const baseH = large ? 8 : 6;

    // 1. Black outline: bumps (r+1) then base rect (1px wider/taller)
    ctx.fillStyle = '#000000';
    for (const b of bumps) {
      ctx.beginPath();
      ctx.arc(b.cx, baseY, b.r + 1, Math.PI, 0, true);
      ctx.fill();
    }
    ctx.fillRect(sx - 1, baseY, W + 2, baseH + 1);

    // 2. White fill: bumps then base rect
    ctx.fillStyle = '#F8F8F8';
    for (const b of bumps) {
      ctx.beginPath();
      ctx.arc(b.cx, baseY, b.r, Math.PI, 0, true);
      ctx.fill();
    }
    ctx.fillRect(sx, baseY, W, baseH);
  }

  // ── Background: hills ─────────────────────────────────────────────────────

  _drawHills(camera) {
    for (let i = 0; i < HILLS.length; i++) {
      const h  = HILLS[i];
      const sx = Math.round(h.wx - camera.x);
      const sy = Math.round(h.wy - camera.y);
      if (sx + h.r * 2 < 0 || sx - 1 > VIEWPORT_W) continue;
      if (sy < 0 || sy - h.r > VIEWPORT_H)          continue;
      this._drawNESHill(sx, sy, h.r);
    }
  }

  // Dome shape: dark green 1px outline, bright green fill.
  // sx/sy = top-left of bounding box (hill base at sy, peak at sy-r).
  _drawNESHill(sx, sy, r) {
    const ctx = this.ctx;
    // Outline (1px larger radius)
    ctx.fillStyle = '#006800';
    ctx.beginPath();
    ctx.arc(sx + r, sy, r + 1, Math.PI, 0, true);
    ctx.fill();
    // Main fill
    ctx.fillStyle = '#50A800';
    ctx.beginPath();
    ctx.arc(sx + r, sy, r, Math.PI, 0, true);
    ctx.fill();
  }

  // ── Background: bushes ────────────────────────────────────────────────────

  _drawBushes(camera) {
    for (let i = 0; i < BUSHES.length; i++) {
      const b  = BUSHES[i];
      const sx = Math.round(b.wx - camera.x);
      const sy = Math.round(b.wy - camera.y);
      const w  = b.large ? 36 : 24;
      if (sx + w < 0 || sx > VIEWPORT_W) continue;
      if (sy < -12  || sy > VIEWPORT_H)  continue;
      this._drawNESBush(sx, sy, b.large);
    }
  }

  // Bush: same bump shape as cloud but green, sits on top of the ground.
  _drawNESBush(sx, sy, large) {
    const ctx = this.ctx;
    const W = large ? 36 : 24;
    const bumps = large
      ? [{ cx: sx + 7,  r: 6 }, { cx: sx + 18, r: 8 }, { cx: sx + 29, r: 7 }]
      : [{ cx: sx + 5,  r: 4 }, { cx: sx + 12, r: 6 }, { cx: sx + 20, r: 5 }];
    const baseH = large ? 7 : 5;

    // Dark outline
    ctx.fillStyle = '#006800';
    for (const b of bumps) {
      ctx.beginPath();
      ctx.arc(b.cx, sy, b.r + 1, Math.PI, 0, true);
      ctx.fill();
    }
    ctx.fillRect(sx - 1, sy, W + 2, baseH + 1);

    // Main green fill
    ctx.fillStyle = '#50A800';
    for (const b of bumps) {
      ctx.beginPath();
      ctx.arc(b.cx, sy, b.r, Math.PI, 0, true);
      ctx.fill();
    }
    ctx.fillRect(sx, sy, W, baseH);

    // Lighter highlight arc on each bump
    ctx.fillStyle = '#80D010';
    for (const b of bumps) {
      ctx.beginPath();
      ctx.arc(b.cx - 1, sy - 1, Math.max(1, b.r - 2), Math.PI * 1.1, Math.PI * 1.9, true);
      ctx.fill();
    }
  }

  // ── HUD ───────────────────────────────────────────────────────────────────

  _drawHUD(gameState) {
    // Phase 7 adds coin counter / lives display.
  }

  // ── Debug grid ────────────────────────────────────────────────────────────

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
