// main.js — Bootstrap + game loop.
// Phase 2: player movement, physics, camera follow. Keyboard only.

import { createInput }      from './input.js';
import { loadLevel, setTile, TILE_SIZE, LEVEL_COLS } from './level.js';
import { Renderer, createCamera, updateCamera } from './renderer.js';
import { createEditor }     from './editor.js';
import { createAudio }      from './audio.js';
import { createPlayer }     from './entities/player.js';
import { PALETTE }          from './sprites.js';

// ─── Init ────────────────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
const input  = createInput();
const audio  = createAudio();

const renderer = new Renderer(canvas);
const camera   = createCamera();
const level    = loadLevel();
const editor   = createEditor(level, renderer);
const player   = createPlayer(level.spawn.x, level.spawn.y);

const entities = []; // Phase 4+
const LEVEL_PIXEL_WIDTH = LEVEL_COLS * TILE_SIZE;

// ─── Particles & block bumps ─────────────────────────────────────────────────

/** Debris particles from brick breaks: { x, y, vx, vy, life, maxLife, color } */
const particles = [];

/**
 * Active block bump animations: { col, row, timer, maxTimer }
 * The renderer offsets the tile upward by sin(timer/maxTimer * PI) * 4px.
 */
const blockBumps = [];

/**
 * World callbacks passed to player.update() so it can trigger
 * environment effects without needing direct references to main-scope arrays.
 */
const world = {
  breakBrick(col, row) {
    setTile(level, col, row, null);
    // Spawn 4 debris fragments from the four quadrants of the brick
    const ox = col * TILE_SIZE;
    const oy = row * TILE_SIZE;
    const frags = [
      { x: ox + 4,  y: oy + 4,  vx: -1.5, vy: -4.0, color: PALETTE.B },
      { x: ox + 12, y: oy + 4,  vx:  1.5, vy: -4.0, color: PALETTE.b },
      { x: ox + 4,  y: oy + 12, vx: -2.0, vy: -2.2, color: PALETTE.b },
      { x: ox + 12, y: oy + 12, vx:  2.0, vy: -2.2, color: PALETTE.B },
    ];
    for (const f of frags) {
      particles.push({ ...f, life: 30, maxLife: 30 });
    }
  },

  bumpBlock(col, row) {
    // Prevent duplicate bumps on the same block
    if (blockBumps.some(b => b.col === col && b.row === row)) return;
    blockBumps.push({ col, row, timer: 0, maxTimer: 14 });
  },
};

// ─── Orientation overlay ─────────────────────────────────────────────────────

const rotateOverlay = document.getElementById('rotate-overlay');
function checkOrientation() {
  if (!rotateOverlay) return;
  rotateOverlay.style.display =
    window.innerHeight > window.innerWidth ? 'flex' : 'none';
}
window.addEventListener('resize', checkOrientation);
checkOrientation();

// ─── Mode toggle ─────────────────────────────────────────────────────────────

const modeBtn = document.getElementById('btn-mode');
if (modeBtn) {
  modeBtn.addEventListener('click', () => {
    editor.toggle();
    modeBtn.textContent = editor.active ? '▶ Play' : '✎ Edit';
  });
}

// ─── Debug toggle (backtick key) ─────────────────────────────────────────────

window.addEventListener('keydown', e => {
  if (e.code === 'Backquote') renderer.debug = !renderer.debug;
  // DEV: P key toggles small/super — remove once mushroom pickup is wired
  if (e.code === 'KeyP') player.state = player.state === 'super' ? 'small' : 'super';
});

// ─── Game loop ────────────────────────────────────────────────────────────────

let lastTime = null;

function loop(now) {
  if (lastTime === null) lastTime = now;
  const dt = Math.min((now - lastTime) / 16.6667, 2); // normalised to 60fps frames
  lastTime = now;

  input.poll();

  if (editor.active) {
    editor.update(input.state);
  } else {
    // Player
    player.update(dt, input.state, level, world);

    // Camera follows player center with dead-zone
    updateCamera(camera, player.x + player.w / 2, LEVEL_PIXEL_WIDTH);

    // Entities (Phase 4+)
    // entities.forEach(e => e.update(dt, level));

    // Tick debris particles (gravity + lifetime)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 0.35 * dt;  // debris gravity
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Tick block bump animations
    for (let i = blockBumps.length - 1; i >= 0; i--) {
      blockBumps[i].timer += dt;
      if (blockBumps[i].timer >= blockBumps[i].maxTimer) blockBumps.splice(i, 1);
    }
  }

  renderer.draw(level, camera, entities, player, { pMeter: player.pMeter, particles, blockBumps });
  editor.draw(renderer.ctx, camera);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
