// shellback.js — Shell enemy (green + red variants). Phase 4.
export function createShellback(x, y, variant = 'green') {
  return {
    type: 'shellback_' + variant,
    x, y, vx: -0.5, vy: 0,
    w: 16, h: 24,
    variant,
    shelled: false,
    alive: true,
    update(/* dt, levelData */) { /* TODO Phase 4 */ },
    draw(/* ctx, camera */)    { /* TODO Phase 4 */ },
  };
}
