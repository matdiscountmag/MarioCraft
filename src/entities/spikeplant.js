// spikeplant.js — Pipe plant enemy. Phase 8.
export function createSpikeplant(x, y) {
  return {
    type: 'spikeplant',
    x, y, vx: 0, vy: 0,
    w: 16, h: 24,
    alive: true,
    update(/* dt, levelData */) { /* TODO Phase 8 */ },
    draw(/* ctx, camera */)    { /* TODO Phase 8 */ },
  };
}
