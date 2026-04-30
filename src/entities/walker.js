// walker.js — Dome-headed walker enemy. Phase 8.
// Walks, reverses at walls and ledge edges, stomped from above = defeat.

import { resolveEntity }    from '../physics.js?v=44';
import { drawSprite }       from '../sprites.js?v=43';
import { WALKER_1, WALKER_2 } from '../sprites.js?v=43';
import { TILE_SIZE, getTile, isSolid } from '../level.js?v=43';

const WALK_SPEED = 0.6;
const GRAVITY    = 0.45;
const MAX_FALL   = 7.0;

export function createWalker(x, y) {
  return {
    type:      'walker',
    x, y,
    vx: -WALK_SPEED, vy: 0,
    w: 16, h: 16,
    alive:     true,
    dir:       -1,     // -1 = left, +1 = right
    walkFrame: 0,
    walkTimer: 0,

    update(dt, levelData) {
      // Gravity
      this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);

      // Apply intended velocity
      this.vx = this.dir * WALK_SPEED;

      // Tile collision
      resolveEntity(this, levelData);

      // Wall reversal: physics zeroed vx
      if (this.vx === 0) {
        this.dir = -this.dir;
      }

      // Ledge reversal: check ground tile one step ahead
      if (this.onGround) {
        const lookX   = this.dir > 0 ? this.x + this.w : this.x - 1;
        const lookCol = Math.floor(lookX / TILE_SIZE);
        const gndRow  = Math.floor((this.y + this.h) / TILE_SIZE);
        if (!isSolid(getTile(levelData, lookCol, gndRow))) {
          this.dir = -this.dir;
        }
      }

      // Walk animation
      this.walkTimer += WALK_SPEED * dt;
      if (this.walkTimer > 5) { this.walkFrame = 1 - this.walkFrame; this.walkTimer = 0; }

      // Fell off world
      if (this.y > levelData.height * TILE_SIZE + 64) this.alive = false;
    },

    draw(ctx, camera) {
      const sx = Math.round(this.x - camera.x);
      const sy = Math.round(this.y - camera.y);
      if (sx < -16 || sx > 272 || sy < -16 || sy > 240) return;
      const sprite = this.walkFrame === 0 ? WALKER_1 : WALKER_2;
      drawSprite(ctx, sprite, sx, sy, this.dir > 0);
    },
  };
}
