// stomper.js — Walker enemy. Implemented in Phase 4.
export function createStomper(x, y) {
  return {
    type: 'stomper',
    x, y, vx: -0.5, vy: 0,
    w: 16, h: 16,
    alive: true,
    update(/* dt, levelData */) { /* TODO Phase 4 */ },
    draw(/* ctx, camera */)    { /* TODO Phase 4 */ },
  };
}
