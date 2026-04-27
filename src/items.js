// items.js — Spawnable items: coin pops (visual) and mushrooms (physical).

import { resolveEntity } from './physics.js';
import { drawSprite, TILE_COIN, ITEM_MUSHROOM } from './sprites.js';
import { TILE_SIZE } from './level.js';

/**
 * A coin that pops up from a ? block and fades away.
 * Purely visual — the coin is collected instantly when the block is bumped.
 */
export function createCoinPop(col, row) {
  return {
    type: 'coinpop',
    x: col * TILE_SIZE,
    y: (row - 1) * TILE_SIZE,  // start one tile above the block
    vy: -2.2,
    timer: 0,
    maxTimer: 26,
    w: 0, h: 0,  // not collidable

    update(dt) {
      this.y    += this.vy * dt;
      this.vy   += 0.14 * dt;   // light deceleration, then falls back
      this.timer += dt;
    },

    get alive() { return this.timer < this.maxTimer; },

    draw(ctx, camera) {
      if (!this.alive) return;
      const sx = Math.round(this.x - camera.x);
      const sy = Math.round(this.y - camera.y);
      const fade = 1 - this.timer / this.maxTimer;
      ctx.globalAlpha = fade < 0.3 ? fade / 0.3 : 1;
      drawSprite(ctx, TILE_COIN, sx, sy);
      ctx.globalAlpha = 1;
    },
  };
}

/**
 * Mushroom powerup: emerges from a ? block over ~22 frames, then slides along
 * the ground. Colliding with the player powers up Small → Super.
 */
export function createMushroom(col, row) {
  const blockTopY = row * TILE_SIZE;
  return {
    type: 'mushroom',
    x: col * TILE_SIZE,
    y: blockTopY,          // starts at block top, rises during emergence
    vx: 0,
    vy: 0,
    w: TILE_SIZE,
    h: TILE_SIZE,
    alive: true,

    emerging: true,
    emergeTimer: 0,
    emergeMaxTimer: 22,

    update(dt, levelData) {
      if (this.emerging) {
        this.emergeTimer += dt;
        const t = Math.min(this.emergeTimer / this.emergeMaxTimer, 1);
        this.y = blockTopY - t * TILE_SIZE;   // rise one full tile
        if (t >= 1) {
          this.y  = blockTopY - TILE_SIZE;
          this.vx = 1.0;    // start sliding right
          this.emerging = false;
        }
        return;
      }

      this.vy += 0.35 * dt;                   // gravity
      const prevVx = this.vx;
      resolveEntity(this, levelData);
      if (prevVx !== 0 && this.vx === 0) this.vx = -prevVx;  // reverse on wall
      if (this.y > levelData.height * TILE_SIZE + 32) this.alive = false;
    },

    draw(ctx, camera) {
      if (!this.alive) return;
      const sx = Math.round(this.x - camera.x);
      const sy = Math.round(this.y - camera.y);
      drawSprite(ctx, ITEM_MUSHROOM, sx, sy);
    },
  };
}
