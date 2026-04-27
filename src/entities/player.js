// player.js — Player entity. Full physics in Phase 2.
// Phase 1 stub: exports a no-op player so main.js compiles clean.

export function createPlayer(spawnX, spawnY) {
  return {
    x: spawnX * 16,
    y: spawnY * 16,
    vx: 0,
    vy: 0,
    w: 16,
    h: 16,
    state: 'small', // 'small' | 'super' | 'caped'
    onGround: false,
    facingRight: true,

    update(/* dt, input, levelData */) {
      // TODO Phase 2: walk/run/jump physics
    },

    draw(/* ctx, camera */) {
      // TODO Phase 2: draw player sprite
    },
  };
}
