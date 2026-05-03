// main.js - Bootstrap + game loop.

import { createInput }   from './input.js?v=45';
import { loadLevel, setTile, getTile, TILE_SIZE, LEVEL_COLS, LEVEL_ROWS } from './level.js?v=45';
import { Renderer, createCamera, updateCamera } from './renderer.js?v=45';
import { createEditor }  from './editor.js?v=45';
import { createAudio }   from './audio.js?v=45';
import { createPlayer }  from './entities/player.js?v=45';
import { createWalker }  from './entities/walker.js?v=45';
import { PALETTE }       from './sprites.js?v=45';
import { PLAYER_SMALL_STAND_R } from './player-sprites.js?v=45';
import { createCoinPop, createMushroom } from './items.js?v=45';
import { HEROES } from './heroes.js?v=47';
import { createHeroEditor } from './hero-editor.js?v=47';

const canvas = document.getElementById('game-canvas');
const input  = createInput();
const audio  = createAudio();

const renderer = new Renderer(canvas);
const camera   = createCamera();
const level    = loadLevel();
const editor   = createEditor(canvas, level);
const player   = createPlayer(level.spawn.x, level.spawn.y);

// Build live walker entities from level data
const entities = (level.entities || [])
  .filter(e => e.type === 'walker' || e.type === 'stomper')
  .map(e => createWalker(e.x, e.y));

const LEVEL_PIXEL_WIDTH  = LEVEL_COLS * TILE_SIZE;
const LEVEL_PIXEL_HEIGHT = LEVEL_ROWS * TILE_SIZE;

const particles  = [];
const blockBumps = [];
const items      = [];
const coinPops   = [];
let   coins          = 0;
let   levelClear     = false;
let   levelClearTimer = 0;
let   gameStarted    = false;
let   prevLeft       = false;
let   prevRight      = false;

// ── Hero select ──────────────────────────────────────────────────────────────

const HERO_KEY = 'mario-tablet:selected-hero';
let selectedHeroId = localStorage.getItem(HERO_KEY) || HEROES[0].id;

// ── Hero editor ───────────────────────────────────────────────────────────────

const heroEditor = createHeroEditor(HEROES, () => {
  // Rebuild hero cards when editor closes (in case new heroes were added/deleted)
  buildHeroCards();
});

// ── Hero preview helpers ─────────────────────────────────────────────────

function drawHeroPreview(previewCanvas, hero) {
  previewCanvas.width  = 16;
  previewCanvas.height = 16;
  const ctx2 = previewCanvas.getContext('2d');
  ctx2.clearRect(0, 0, 16, 16);
  if (hero.isCustom && hero.frames && hero.frames.small_stand) {
    // Custom hero: hex-per-cell frame
    const frame = hero.frames.small_stand;
    for (let r = 0; r < frame.length; r++) {
      for (let c = 0; c < frame[r].length; c++) {
        const color = frame[r][c];
        if (color && color !== '.') { ctx2.fillStyle = color; ctx2.fillRect(c, r, 1, 1); }
      }
    }
  } else {
    // Built-in hero: palette-key sprite with color overrides
    const colors = hero.colors || {};
    for (let r = 0; r < PLAYER_SMALL_STAND_R.length; r++) {
      const row = PLAYER_SMALL_STAND_R[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '.' || !PALETTE[ch]) continue;
        ctx2.fillStyle = colors[ch] || PALETTE[ch];
        ctx2.fillRect(c, r, 1, 1);
      }
    }
  }
}

function cycleHero(dir) {
  const all  = allHeroes();
  const idx  = all.findIndex(h => h.id === selectedHeroId);
  const next = (idx + dir + all.length) % all.length;
  selectedHeroId = all[next].id;
  buildHeroCards();
}

function allHeroes() {
  return [...HEROES, ...heroEditor.getCustomHeroes()];
}

function buildHeroCards() {
  const container = document.getElementById('hero-cards');
  if (!container) return;
  container.innerHTML = '';
  for (const hero of allHeroes()) {
    const card = document.createElement('div');
    card.className = 'hero-card' + (hero.id === selectedHeroId ? ' selected' : '');
    card.dataset.id = hero.id;

    const preview = document.createElement('canvas');
    preview.className = 'hero-preview';
    drawHeroPreview(preview, hero);

    const name = document.createElement('div');
    name.className = 'hero-name';
    name.textContent = hero.name;

    card.appendChild(preview);
    card.appendChild(name);

    function selectCard() {
      selectedHeroId = hero.id;
      document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    }
    card.addEventListener('click', selectCard);
    card.addEventListener('touchend', e => { e.preventDefault(); selectCard(); });

    container.appendChild(card);
  }
}

const heroSelectOverlay = document.getElementById('hero-select-overlay');
const btnHeroPlay       = document.getElementById('btn-hero-play');

buildHeroCards();

if (btnHeroPlay) {
  btnHeroPlay.addEventListener('click', startGame);
  btnHeroPlay.addEventListener('touchend', e => { e.preventDefault(); startGame(); });
}

function startGame() {
  const hero = allHeroes().find(h => h.id === selectedHeroId) || HEROES[0];
  if (hero.isCustom) {
    player.customFrames = hero.frames;
    player.colors = null;
  } else {
    player.customFrames = null;
    player.colors = Object.keys(hero.colors || {}).length > 0 ? hero.colors : null;
  }
  try { localStorage.setItem(HERO_KEY, selectedHeroId); } catch (e) {}
  gameStarted = true;
  if (heroSelectOverlay) heroSelectOverlay.style.display = 'none';
}

// ── World callbacks ───────────────────────────────────────────────────────────

function activateQBlock(col, row) {
  setTile(level, col, row, 'used');
  if (Math.random() < 0.7) {
    coinPops.push(createCoinPop(col, row));
    coins++;
  } else {
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

// ── Player ↔ Walker collision ─────────────────────────────────────────────────

function resolvePlayerWalker(walker) {
  if (!walker.alive || player.dead || player.invulnTimer > 0) return;
  if (player.x + player.w <= walker.x || player.x >= walker.x + walker.w) return;
  if (player.y + player.h <= walker.y || player.y >= walker.y + walker.h) return;

  // Stomp: player falling, feet in top 60% of walker
  if (player.vy > 0 && (player.y + player.h) < (walker.y + walker.h * 0.6)) {
    walker.alive = false;
    player.vy = -5.0;
    return;
  }

  // Side hit
  if (player.state === 'super') {
    player.state       = 'small';
    player.invulnTimer = 90;
  } else {
    player.dead = true;
    player.vy   = -3.0;
  }
}

// ── Level Clear overlay ───────────────────────────────────────────────────────

const levelClearOverlay = document.getElementById('level-clear-overlay');
const levelClearCoins   = document.getElementById('level-clear-coins');
const btnPlayAgain      = document.getElementById('btn-play-again');
const btnClearMap       = document.getElementById('btn-clear-map');

if (btnPlayAgain) {
  btnPlayAgain.addEventListener('click', () => window.location.reload());
}

if (btnClearMap) {
  btnClearMap.addEventListener('click', () => {
    localStorage.removeItem('mario-tablet:level:custom');
    window.location.reload();
  });
  btnClearMap.addEventListener('touchend', e => { e.preventDefault(); btnClearMap.click(); });
}

function triggerLevelClear() {
  if (levelClear) return;
  levelClear = true;
  if (levelClearCoins) levelClearCoins.textContent = `Coins: ${coins}`;
  if (levelClearOverlay) levelClearOverlay.style.display = 'flex';
}

// ── Orientation ───────────────────────────────────────────────────────────────

const rotateOverlay = document.getElementById('rotate-overlay');
function checkOrientation() {
  if (!rotateOverlay) return;
  rotateOverlay.style.display = window.innerHeight > window.innerWidth ? 'flex' : 'none';
}
window.addEventListener('resize', checkOrientation);
checkOrientation();

// ── Coin HUD ──────────────────────────────────────────────────────────────────

const hudCoins     = document.getElementById('hud-coins');
const hudCoinCount = document.getElementById('hud-coin-count');
let   shownCoins   = -1;
function updateCoinDisplay() {
  if (!hudCoinCount || coins === shownCoins) return;
  shownCoins = coins;
  hudCoinCount.textContent = String(coins).padStart(2, '0');
}

// ── HUD button wiring ─────────────────────────────────────────────────────────

const modeBtn      = document.getElementById('btn-mode');
const startOverBtn = document.getElementById('btn-start-over');
const heroBtn      = document.getElementById('btn-hero');
const heroEditorBtn = document.getElementById('btn-hero-editor');

if (modeBtn) {
  modeBtn.addEventListener('click', () => {
    editor.toggle();
    modeBtn.textContent = editor.active ? 'Play' : '✎ Edit Map';
    if (hudCoins)       hudCoins.style.display       = editor.active ? 'none' : '';
    if (heroBtn)        heroBtn.style.display        = editor.active ? 'none' : '';
    if (heroEditorBtn)  heroEditorBtn.style.display  = editor.active ? 'none' : '';
    if (startOverBtn)   startOverBtn.style.display   = editor.active ? 'none' : '';
    if (editor.active) {
      input.resetRunToggle();
    } else {
      // Rebuild live entities from level data when returning to play mode
      entities.length = 0;
      for (const e of (level.entities || [])) {
        if (e.type === 'walker' || e.type === 'stomper') entities.push(createWalker(e.x, e.y));
      }
    }
  });
}

if (startOverBtn) {
  startOverBtn.addEventListener('click', () => window.location.reload());
  startOverBtn.addEventListener('touchend', e => { e.preventDefault(); window.location.reload(); });
}

if (heroBtn) {
  heroBtn.addEventListener('click', () => {
    gameStarted = false;
    buildHeroCards();
    if (heroSelectOverlay) heroSelectOverlay.style.display = 'flex';
  });
  heroBtn.addEventListener('touchend', e => { e.preventDefault(); heroBtn.click(); });
}

if (heroEditorBtn) {
  heroEditorBtn.addEventListener('click', () => { heroEditor.open(); });
  heroEditorBtn.addEventListener('touchend', e => { e.preventDefault(); heroEditor.open(); });
}

const resetBtn = document.getElementById('btn-reset');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (!confirm('Clear all map edits and restore the default level? This cannot be undone.')) return;
    localStorage.removeItem('mario-tablet:level:custom');
    window.location.reload();
  });
}


window.addEventListener('keydown', e => {
  if (e.code === 'Backquote') renderer.debug = !renderer.debug;
  if (e.code === 'KeyP') player.state = player.state === 'super' ? 'small' : 'super';
  // Hero select: Enter/Space/Z = start (left/right handled in loop)
  if (!gameStarted && (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ')) {
    startGame();
  }
  // Level clear: Enter/Space/Z = play again
  if (levelClear && levelClearTimer > 30 &&
      (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ')) {
    window.location.reload();
  }
});

// ── Game loop ─────────────────────────────────────────────────────────────────

let lastTime = null;

function loop(now) {
  if (lastTime === null) lastTime = now;
  const dt = Math.min((now - lastTime) / 16.6667, 2);
  lastTime = now;

  input.poll();

  // ── Overlay input handling ────────────────────────────────────────────────
  if (!gameStarted) {
    // D-pad left/right cycles hero (edge detection — fires once per press)
    if (input.state.left  && !prevLeft)  cycleHero(-1);
    if (input.state.right && !prevRight) cycleHero(1);
    // Jump button (A) = PLAY!
    if (input.state.jumpPressed) startGame();
  }
  prevLeft  = input.state.left;
  prevRight = input.state.right;

  if (levelClear) {
    levelClearTimer += dt;
    // Jump button (A) = Play Again, with brief lockout to avoid accidental trigger
    if (levelClearTimer > 30 && input.state.jumpPressed) window.location.reload();
  }

  if (editor.active) {
    editor.update(camera);
  } else if (gameStarted && !levelClear) {
    player.update(dt, input.state, level, world);
    updateCamera(
      camera,
      player.x + player.w / 2,
      player.y + player.h / 2,
      LEVEL_PIXEL_WIDTH,
      LEVEL_PIXEL_HEIGHT,
    );

    if (!player.dead) {
      const c0 = Math.floor(player.x / TILE_SIZE);
      const c1 = Math.floor((player.x + player.w - 1) / TILE_SIZE);
      const r0 = Math.floor(player.y / TILE_SIZE);
      const r1 = Math.floor((player.y + player.h - 1) / TILE_SIZE);
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const t = getTile(level, c, r);
          if (t === 'coin') { setTile(level, c, r, null); coins++; }
          if (t === 'goal') { triggerLevelClear(); }
        }
      }

      for (let i = entities.length - 1; i >= 0; i--) {
        entities[i].update(dt, level);
        resolvePlayerWalker(entities[i]);
        if (!entities[i].alive) entities.splice(i, 1);
      }

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

      for (let i = coinPops.length - 1; i >= 0; i--) {
        coinPops[i].update(dt);
        if (!coinPops[i].alive) coinPops.splice(i, 1);
      }
    } else {
      // Jump to skip the rest of the death animation; hard cutoff at 65 frames (~1s)
      if (player.deathTimer > 65 ||
          (player.deathTimer > 30 && input.state.jumpPressed)) {
        window.location.reload();
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 0.35 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

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
  updateCoinDisplay();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
