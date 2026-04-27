// physics.js — AABB tile collision resolution.
// Checks only the leading edge in each movement direction to avoid false hits.

import { TILE_SIZE, getTile, isSolid } from './level.js';

/**
 * Move entity by vx/vy and resolve tile collisions.
 * Entity needs: x, y, vx, vy, w (width px), h (height px).
 * Sets entity.onGround = true when landing on a tile top.
 */
export function resolveEntity(entity, levelData) {
  entity.onGround = false;

  // ── X axis ───────────────────────────────────────────────────────────────
  entity.x += entity.vx;

  if (entity.vx > 0) {
    // Leading edge: right side
    const col = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    const rowTop    = Math.floor(entity.y / TILE_SIZE);
    const rowBottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);
    for (let row = rowTop; row <= rowBottom; row++) {
      if (isSolid(getTile(levelData, col, row))) {
        entity.x = col * TILE_SIZE - entity.w;
        entity.vx = 0;
        break;
      }
    }
  } else if (entity.vx < 0) {
    // Leading edge: left side
    const col = Math.floor(entity.x / TILE_SIZE);
    const rowTop    = Math.floor(entity.y / TILE_SIZE);
    const rowBottom = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);
    for (let row = rowTop; row <= rowBottom; row++) {
      if (isSolid(getTile(levelData, col, row))) {
        entity.x = (col + 1) * TILE_SIZE;
        entity.vx = 0;
        break;
      }
    }
  }

  // ── Y axis ───────────────────────────────────────────────────────────────
  entity.y += entity.vy;

  if (entity.vy > 0) {
    // Leading edge: bottom (falling)
    const row = Math.floor((entity.y + entity.h - 1) / TILE_SIZE);
    const colLeft  = Math.floor(entity.x / TILE_SIZE);
    const colRight = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    for (let col = colLeft; col <= colRight; col++) {
      if (isSolid(getTile(levelData, col, row))) {
        entity.y = row * TILE_SIZE - entity.h;
        entity.vy = 0;
        entity.onGround = true;
        break;
      }
    }
  } else if (entity.vy < 0) {
    // Leading edge: top (jumping up)
    const row = Math.floor(entity.y / TILE_SIZE);
    const colLeft  = Math.floor(entity.x / TILE_SIZE);
    const colRight = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    for (let col = colLeft; col <= colRight; col++) {
      if (isSolid(getTile(levelData, col, row))) {
        entity.y = (row + 1) * TILE_SIZE;
        entity.vy = 0;
        break;
      }
    }
  }
}
