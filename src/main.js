// main.js — Bootstrap + game loop.

import { createInput }   from './input.js';
import { loadLevel, setTile, getTile, TILE_SIZE, LEVEL_COLS } from './level.js';
import { Renderer, createCamera, updateCamera } from './renderer.js';
import { createEditor }  from './editor.js';
import { createAudio }   from './audio.js';
import { createPlayer }  from './entities/player.js';
import { PALETTE }       from './sprites.js';
import { createCoinPop, createMushroom } from './items.js';

// ─── Init ─────────────────────────────────────────────────────────────────────

const canvas = document.getElementById('game-canvas');
const input  = createInput();
const audio  = createAudio();

const renderer = new Renderer(canvas);
const camera   = createCamera();
const level    = loadLevel();
const editor   = createEditor(level, renderer);
const player   = createPlayer(level.spawn.x, level.spawn.y);

const entities       = [];   // Phase 8: enemies
const LEVEL_PIXEL_WIDTH = LEVEL_COLS * TILE_SIZE;

// ─── Particles, items & state ─────────────────────────────────────────────────

const particles  = [];   // brick debris: { x,y,vx,vy,life,maxLife,color }
const blockBumps = [];   // bump animations: { col,row,timer,maxTimer }
const items      = [];   // physical items: mushrooms
const coinPops   = [];   // visual coin-pop animations
let   coins      = 0;    // total coins collected

// ─── World callbacks ──────────────────────────────────────────────────────────

function activateQBlock(col, row) {
  setTile(level, col, row, 'used');
  const key = `${col},${row}`;
  const contents = level.qblockContents?.[key] ?? 'coin';
  if (contents === 'coin') {
    coinPops.push(createCoinPop(col, row));
    coins++;
  } else if (contents === 'mushroom') {
    items.push(createMushroom(col, row));
  }
}

const world = {
  breakBrick(col, row) {
    setTile(level, col, row, null);
    const ox = col * TILE_SIZE, oy = row * TILE_SIZE;
    const frags = [
      { x: ox+4,  y: oy+4,  vx: -1.5, vy: -4.0, color: PALETTE.B },
      { x: ox+12, y: oy+4,  vx:  1.5, vy: -4.0, color: PALETTE.b },
      { x: ox+4,  y: oy+12, vx: -2.0, vy: -2.2, color: PALETTE.b },
      { x: ox+12, y: oy+12, vx:  2.0, vy: -2.2, color: PALETTE.B },
    ];
    for (const f of frags) particles.push({ ...f, life: 30, maxLife: 30 });
  },

  bumpBlock(col, row) {
    if (blockBumps.some(b => b.col === col && b.row === row)) return;
    blockBumps.push({ col, row, timer: 0, maxTimer: 14 });
    if (level.tiles[row]?.[col] === 'qblock') activateQBlock(col, row);
  },
};

// ─── Orientation overlay ──────────────────────────────────────────────────────

const rotateOverlay = document.getElementById('rotate-overlay');
function checkOrientation() {
  if (!rotateOverlay) return;
  rotateOverlay.style.display = window.innerHeight > window.innerWidth ? 'flex' : 'none';
}
window.addEventListener('resize', checkOrientation);
checkOrientation();

// ─── Mode toggle ──────────────────────────────────────────────────────────────

const modeBtn = document.getElementById('btn-mode');
if (modeBtn) {
  modeBtn.addEventListener('click', () => {
    editor.toggle();
    modeBtn.textContent = editor.active ? '▶ Play' : '✎ Edit';
  });
}

// ─── Debug + dev keys ────────────────────────────────────────────────────────

window.addEventListener('keydown', e => {
  if (e.code === 'Backquote') renderer.debug = !renderer.debug;
  // DEV: P toggles small/super — remove once mushroom pickup is wired
  if (e.code === 'KeyP') player.state = player.state === 'super' ? 'small' : 'super';
});

// ─── Game loop ────────────────────────────────────────────────────────────────

let lastTime = null;

function loop(now) {
  if (lastTime === null) lastTime = now;
  const dt = Math.min((now - lastTime) / 16.6667, 2);
  lastTime = now;

  input.poll();

  if (editor.active) {
    editor.update(input.state);
  } else {
    player.update(dt, input.state, level, world);
    updateCamera(camera, player.x + player.w / 2, LEVEL_PIXEL_WIDTH);

    // Collect floating coin tiles on contact
    const c0 = Math.floor(player.x / TILE_SIZE);
    const c1 = Math.floor((player.x + player.w - 1) / TILE_SIZE);
    const r0 = Math.floor(player.y / TILE_SIZE);
    const r1 = Math.floor((player.y + player.h - 1) / TILE_SIZE);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (getTile(level, c, r) === 'coin') { setTile(level, c, r, null); coins++; }
      }
    }

    // Update items (mushrooms) + player collision
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.update(dt, level);
      if (!item.alive) { items.splice(i, 1); continue; }
      if (!item.emerging && item.type === 'mushroom') {
        if (player.x < item.x + item.w && player.x + player.w > item.x &&
            player.y < item.y + item.h && player.y + player.h > item.y) {
          if (player.state === 'small') player.state = 'super';
          items.splice(i, 1);
        }
      }
    }

    // Update coin pop animations
    for (let i = coinPops.length - 1; i >= 0; i--) {
      coinPops[i].update(dt);
      if (!coinPops[i].alive) coinPops.splice(i, 1);
    }

    // Tick debris particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 0.35 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Tick block bumps
    for (let i = blockBumps.length - 1; i >= 0; i--) {
      blockBumps[i].timer += dt;
      if (blockBumps[i].timer >= blockBumps[i].maxTimer) blockBumps.splice(i, 1);
    }
  }

  renderer.draw(level, camera, entities, player, {
    pMeter: player.pMeter, particles, blockBumps, coins,
    items: [...items, ...coinPops],
  });
  editor.draw(renderer.ctx, camera);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
