// main.js — Bootstrap + game loop.
// Phase 2: player movement, physics, camera follow. Keyboard only.

import { createInput }      from './input.js';
import { loadLevel, TILE_SIZE, LEVEL_COLS } from './level.js';
import { Renderer, createCamera, updateCamera } from './renderer.js';
import { createEditor }     from './editor.js';
import { createAudio }      from './audio.js';
import { createPlayer }     from './entities/player.js';

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
    player.update(dt, input.state, level);

    // Camera follows player center with dead-zone
    updateCamera(camera, player.x + player.w / 2, LEVEL_PIXEL_WIDTH);

    // Entities (Phase 4+)
    // entities.forEach(e => e.update(dt, level));
  }

  renderer.draw(level, camera, entities, player, { pMeter: player.pMeter });
  editor.draw(renderer.ctx, camera);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
