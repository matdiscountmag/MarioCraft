// physics.js — AABB collision resolution against tile grid.
// Phase 2 wires this up. Phase 1 stub only.

import { TILE_SIZE, getTile, isSolid } from './level.js';

/**
 * Resolve AABB entity against the tile grid.
 * Entity must have: x, y, vx, vy, w (width), h (height).
 * Modifies entity in place, sets entity.onGround = true if standing.
 */
export function resolveEntity(entity, levelData) {
  entity.onGround = false;

  // Move X, resolve horizontal collisions
  entity.x += entity.vx;
  resolveAxis(entity, levelData, 'x');

  // Move Y, resolve vertical collisions
  entity.y += entity.vy;
  resolveAxis(entity, levelData, 'y');
}

function resolveAxis(entity, levelData, axis) {
  const { x, y, w, h } = entity;

  // Sample the four corners (plus some interior points for wide entities)
  const left   = Math.floor(x / TILE_SIZE);
  const right  = Math.floor((x + w - 1) / TILE_SIZE);
  const top    = Math.floor(y / TILE_SIZE);
  const bottom = Math.floor((y + h - 1) / TILE_SIZE);

  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      const tile = getTile(levelData, col, row);
      if (!isSolid(tile)) continue;

      const tw = col * TILE_SIZE;
      const th = row * TILE_SIZE;

      if (axis === 'x') {
        if (entity.vx > 0) {
          entity.x = tw - w;
          entity.vx = 0;
        } else if (entity.vx < 0) {
          entity.x = tw + TILE_SIZE;
          entity.vx = 0;
        }
      } else {
        if (entity.vy > 0) {
          entity.y = th - h;
          entity.vy = 0;
          entity.onGround = true;
        } else if (entity.vy < 0) {
          entity.y = th + TILE_SIZE;
          entity.vy = 0;
        }
      }
    }
  }
}
