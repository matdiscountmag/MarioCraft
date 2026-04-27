// main.js — Bootstrap + game loop.
// Phase 1: renders level skeleton. No player yet.

import { createInput }     from './input.js';
import { loadLevel, TILE_SIZE, LEVEL_COLS } from './level.js';
import { Renderer, createCamera } from './renderer.js';
import { createEditor }   from './editor.js';
import { createAudio }    from './audio.js';
import { createPlayer }   from './entities/player.js';

// ─── Init ────────────────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
const input  = createInput();
const audio  = createAudio();

const renderer = new Renderer(canvas);
const camera   = createCamera();
const level    = loadLevel();
const editor   = createEditor(level, renderer);

// Player stub (not drawn in Phase 1, but object exists)
const player = createPlayer(level.spawn.x, level.spawn.y);

// Instantiate entities from level data
// (entity factories added per phase — stubs do nothing)
const entities = [];

const LEVEL_PIXEL_WIDTH = LEVEL_COLS * TILE_SIZE;

// ─── "Rotate to landscape" overlay ───────────────────────────────────────────

const rotateOverlay = document.getElementById('rotate-overlay');
function checkOrientation() {
  if (!rotateOverlay) return;
  rotateOverlay.style.display =
    window.innerHeight > window.innerWidth ? 'flex' : 'none';
}
window.addEventListener('resize', checkOrientation);
checkOrientation();

// ─── Mode toggle button ───────────────────────────────────────────────────────

const modeBtn = document.getElementById('btn-mode');
if (modeBtn) {
  modeBtn.addEventListener('click', () => {
    editor.toggle();
    modeBtn.textContent = editor.active ? '▶ Play' : '✎ Edit';
  });
}

// ─── Debug toggle (press ` key) ───────────────────────────────────────────────

window.addEventListener('keydown', e => {
  if (e.code === 'Backquote') renderer.debug = !renderer.debug;
});

// ─── Game loop ────────────────────────────────────────────────────────────────

let lastTime = null;

function loop(now) {
  if (lastTime === null) lastTime = now;
  const rawDt = (now - lastTime) / 16.6667; // normalise to 60fps frames
  const dt = Math.min(rawDt, 2);            // cap at 2× for tab-blur recovery
  lastTime = now;

  input.poll();

  if (editor.active) {
    editor.update(input.state);
  } else {
    // Phase 2: player.update(dt, input.state, level);
    // Phase 4: entities.forEach(e => e.update(dt, level));
    // Camera follows spawn for now (no player movement)
  }

  renderer.draw(level, camera, entities, null, {});
  editor.draw(renderer.ctx, camera);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
