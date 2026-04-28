// physics.js — AABB tile collision resolution.
// Checks only the leading edge in each movement direction to avoid false hits.

import { TILE_SIZE, getTile, isSolid } from './level.js';

/**
 * Move entity by vx/vy and resolve tile collisions.
 * Entity needs: x, y, vx, vy, w (width px), h (height px).
 * Sets entity.onGround = true when landing on a tile top.
 * Sets entity.hitCeiling = { col, row, tileId } when head hits a solid from below.
 */
export function resolveEntity(entity, levelData) {
  entity.onGround = false;
  entity.hitCeiling = null;

  entity.x += entity.vx;

  if (entity.vx > 0) {
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

  entity.y += entity.vy;

  if (entity.vy > 0) {
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
    const row = Math.floor(entity.y / TILE_SIZE);
    const colLeft  = Math.floor(entity.x / TILE_SIZE);
    const colRight = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    for (let col = colLeft; col <= colRight; col++) {
      const tileId = getTile(levelData, col, row);
      if (isSolid(tileId)) {
        entity.y = (row + 1) * TILE_SIZE;
        entity.vy = 0;
        entity.hitCeiling = { col, row, tileId };
        break;
      }
    }
  }

  // Ground probe: if not already grounded, check the tile directly below feet.
  // Catches the sub-pixel case where gravity < 1px and no overlap is detected.
  if (!entity.onGround) {
    const probeRow = Math.floor((entity.y + entity.h) / TILE_SIZE);
    const colLeft  = Math.floor(entity.x / TILE_SIZE);
    const colRight = Math.floor((entity.x + entity.w - 1) / TILE_SIZE);
    for (let col = colLeft; col <= colRight; col++) {
      if (isSolid(getTile(levelData, col, probeRow))) {
        entity.y  = probeRow * TILE_SIZE - entity.h;  // snap to exact grid
        entity.vy = 0;
        entity.onGround = true;
        break;
      }
    }
  }
}
