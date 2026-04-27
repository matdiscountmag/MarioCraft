// cannonball.js — Cannonball projectile. Phase 8.
export function createCannonball(x, y, dirX = 1) {
  return {
    type: 'cannonball',
    x, y, vx: dirX * 2.5, vy: 0,
    w: 16, h: 16,
    alive: true,
    update(/* dt, levelData */) { /* TODO Phase 8 */ },
    draw(/* ctx, camera */)    { /* TODO Phase 8 */ },
  };
}
