// editor.js - Edit mode: palette strip, tile placement/deletion, drag-to-pan, arrow-key scroll.

import { TILE_SIZE, LEVEL_COLS, LEVEL_ROWS, setTile, getTile, saveLevel } from './level.js?v=43';
import {
  drawSprite,
  TILE_GROUND_TOP, TILE_GROUND, TILE_HARD, TILE_BRICK,
  TILE_QBLOCK, TILE_COIN, TILE_GOAL, WALKER_1,
} from './sprites.js?v=43';
import { VIEWPORT_W, VIEWPORT_H } from './renderer.js?v=43';

const SCROLL_SPEED = 4; // px per frame when arrow key held

const PALETTE_W  = 32;
const PALETTE_X  = VIEWPORT_W - PALETTE_W;
const SLOT_COUNT = 10;
const SLOT_H     = Math.floor(VIEWPORT_H / SLOT_COUNT);
const SKY_LIMIT_ROW = 2;

// isEntity=true items place/remove entries in levelData.entities instead of tiles.
const PALETTE_ITEMS = [
  { id: 'erase',      label: 'X',  bg: '#551111' },
  { id: 'ground_top', sprite: TILE_GROUND_TOP },
  { id: 'ground',     sprite: TILE_GROUND },
  { id: 'hard',       sprite: TILE_HARD },
  { id: 'brick',      sprite: TILE_BRICK },
  { id: 'qblock',     sprite: TILE_QBLOCK },
  { id: 'coin',       sprite: TILE_COIN },
  { id: 'pipe',       label: 'P',  bg: '#004400' },
  { id: 'goal',       sprite: TILE_GOAL },
  { id: 'walker',     sprite: WALKER_1, isEntity: true },
];

export function createEditor(canvas, levelData) {
  // Ensure entities array exists (defensive guard for old saved levels)
  if (!Array.isArray(levelData.entities)) levelData.entities = [];

  let active       = false;
  let selectedSlot = 0;
  const _cam = { x: 0, y: 0 };

  // Arrow key scroll tracking (editor-internal, independent of input.js)
  const _editorKeys = new Set();
  window.addEventListener('keydown', e => { if (active) _editorKeys.add(e.code); });
  window.addEventListener('keyup',   e => { _editorKeys.delete(e.code); });

  let dragStart    = null;
  let dragCamStart = null;
  let isDragging   = false;
  const DRAG_THRESHOLD = 5;

  function clientToCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      cx: (clientX - rect.left) * (VIEWPORT_W / rect.width),
      cy: (clientY - rect.top)  * (VIEWPORT_H / rect.height),
    };
  }

  // Find entity index at a given tile cell (-1 if none).
  function entityAt(col, row) {
    return levelData.entities.findIndex(e =>
      Math.floor(e.x / TILE_SIZE) === col && Math.floor(e.y / TILE_SIZE) === row
    );
  }

  function handleTap(clientX, clientY) {
    const { cx, cy } = clientToCanvas(clientX, clientY);
    if (cx >= PALETTE_X) {
      const slot = Math.floor(cy / SLOT_H);
      if (slot >= 0 && slot < PALETTE_ITEMS.length) selectedSlot = slot;
      return;
    }
    const col = Math.floor((cx + _cam.x) / TILE_SIZE);
    const row = Math.floor((cy + _cam.y) / TILE_SIZE);
    if (row < SKY_LIMIT_ROW || row >= LEVEL_ROWS) return;
    if (col < 0 || col >= LEVEL_COLS) return;

    // Block placement on the spawn tile — objects here cause an instant level-clear loop
    if (col === levelData.spawn.x && row === levelData.spawn.y) return;

    const item = PALETTE_ITEMS[selectedSlot];

    if (item.id === 'erase') {
      eraseTile(col, row);
    } else if (item.id === 'pipe') {
      placePipe(col, row);
    } else if (item.isEntity) {
      // Toggle entity at this cell
      const idx = entityAt(col, row);
      if (idx >= 0) {
        levelData.entities.splice(idx, 1);
      } else {
        levelData.entities.push({ type: item.id, x: col * TILE_SIZE, y: row * TILE_SIZE });
      }
      saveLevel(levelData);
    } else {
      setTile(levelData, col, row, item.id);
      saveLevel(levelData);
    }
  }

  function eraseTile(col, row) {
    // Remove compound pipe tiles
    const t = getTile(levelData, col, row);
    if      (t === 'pipe_tl') { setTile(levelData, col+1, row, null); setTile(levelData, col, row+1, null); setTile(levelData, col+1, row+1, null); }
    else if (t === 'pipe_tr') { setTile(levelData, col-1, row, null); setTile(levelData, col, row+1, null); setTile(levelData, col-1, row+1, null); }
    else if (t === 'pipe_sl') { setTile(levelData, col+1, row, null); }
    else if (t === 'pipe_sr') { setTile(levelData, col-1, row, null); }
    setTile(levelData, col, row, null);
    // Also remove any entity at this cell
    const idx = entityAt(col, row);
    if (idx >= 0) levelData.entities.splice(idx, 1);
    saveLevel(levelData);
  }

  function placePipe(col, row) {
    if (col + 1 >= LEVEL_COLS || row + 1 >= LEVEL_ROWS) return;
    setTile(levelData, col,   row,   'pipe_tl');
    setTile(levelData, col+1, row,   'pipe_tr');
    setTile(levelData, col,   row+1, 'pipe_sl');
    setTile(levelData, col+1, row+1, 'pipe_sr');
    saveLevel(levelData);
  }

  canvas.addEventListener('touchstart', function(e) {
    if (!active) return;
    e.preventDefault();
    const t = e.touches[0];
    const coords = clientToCanvas(t.clientX, t.clientY);
    if (coords.cx >= PALETTE_X) { handleTap(t.clientX, t.clientY); return; }
    dragStart    = { x: t.clientX, y: t.clientY };
    dragCamStart = { x: _cam.x, y: _cam.y };
    isDragging   = false;
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    if (!active || !dragStart) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - dragStart.x;
    const dy = t.clientY - dragStart.y;
    if (!isDragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      isDragging = true;
    }
    if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = VIEWPORT_W / rect.width;
      const scaleY = VIEWPORT_H / rect.height;
      _cam.x = Math.max(0, Math.min(LEVEL_COLS * TILE_SIZE - VIEWPORT_W, dragCamStart.x - dx * scaleX));
      _cam.y = Math.max(0, Math.min(LEVEL_ROWS * TILE_SIZE - VIEWPORT_H, dragCamStart.y - dy * scaleY));
    }
  }, { passive: false });

  canvas.addEventListener('touchend', function(e) {
    if (!active) return;
    e.preventDefault();
    if (!isDragging && dragStart) {
      const t = e.changedTouches[0];
      handleTap(t.clientX, t.clientY);
    }
    dragStart = null; dragCamStart = null; isDragging = false;
  }, { passive: false });

  canvas.addEventListener('touchcancel', function(e) {
    if (!active) return;
    dragStart = null; dragCamStart = null; isDragging = false;
  }, { passive: false });

  canvas.addEventListener('mousedown', function(e) {
    if (!active) return;
    handleTap(e.clientX, e.clientY);
  });

  return {
    get active() { return active; },

    toggle() {
      active = !active;
      _editorKeys.clear(); // prevent stuck keys when toggling
      const controls = document.getElementById('controls');
      if (controls) controls.style.visibility = active ? 'hidden' : 'visible';
      const editTools = document.getElementById('edit-tools');
      if (editTools) editTools.style.display = active ? 'flex' : 'none';
    },

    update(camera) {
      if (!active) return;

      // Sync _cam from camera when not drag-controlling it
      if (!isDragging) {
        _cam.x = camera.x;
        _cam.y = camera.y;
      }

      // Arrow key scroll
      const MAX_X = LEVEL_COLS * TILE_SIZE - VIEWPORT_W;
      const MAX_Y = LEVEL_ROWS * TILE_SIZE - VIEWPORT_H;
      const scrolling =
        _editorKeys.has('ArrowLeft') || _editorKeys.has('ArrowRight') ||
        _editorKeys.has('ArrowUp')   || _editorKeys.has('ArrowDown');
      if (_editorKeys.has('ArrowLeft'))  _cam.x = Math.max(0,     _cam.x - SCROLL_SPEED);
      if (_editorKeys.has('ArrowRight')) _cam.x = Math.min(MAX_X, _cam.x + SCROLL_SPEED);
      if (_editorKeys.has('ArrowUp'))    _cam.y = Math.max(0,     _cam.y - SCROLL_SPEED);
      if (_editorKeys.has('ArrowDown'))  _cam.y = Math.min(MAX_Y, _cam.y + SCROLL_SPEED);

      // Push _cam → camera when dragging or scrolling with keys
      if (isDragging || scrolling) {
        camera.x = _cam.x;
        camera.y = _cam.y;
      }
    },

    draw(ctx, camera) {
      if (!active) return;

      // Spawn tile marker — tinted red zone, no placement allowed here
      const spawnSx = Math.round(levelData.spawn.x * TILE_SIZE - camera.x);
      const spawnSy = Math.round(levelData.spawn.y * TILE_SIZE - camera.y);
      if (spawnSx >= 0 && spawnSx < PALETTE_X && spawnSy >= 0 && spawnSy <= VIEWPORT_H) {
        ctx.fillStyle = 'rgba(255,80,80,0.35)';
        ctx.fillRect(spawnSx, spawnSy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'rgba(255,80,80,0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(spawnSx + 0.5, spawnSy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', spawnSx + TILE_SIZE / 2, spawnSy + TILE_SIZE / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }

      // Entity sprites (walkers) in the play area
      for (const ent of levelData.entities) {
        if (ent.type !== 'walker') continue;
        const sx = Math.round(ent.x - camera.x);
        const sy = Math.round(ent.y - camera.y);
        if (sx < -16 || sx >= PALETTE_X || sy < -16 || sy > VIEWPORT_H) continue;
        drawSprite(ctx, WALKER_1, sx, sy);
        // Teal highlight border so walkers are obvious in edit mode
        ctx.strokeStyle = 'rgba(0,220,220,0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, 15, 15);
      }

      // Palette background
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fillRect(PALETTE_X, 0, PALETTE_W, VIEWPORT_H);

      for (let i = 0; i < PALETTE_ITEMS.length; i++) {
        const item = PALETTE_ITEMS[i];
        const sy   = i * SLOT_H;
        const sel  = (i === selectedSlot);
        if (sel) {
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(PALETTE_X, sy, PALETTE_W, SLOT_H);
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 1;
          ctx.strokeRect(PALETTE_X + 0.5, sy + 0.5, PALETTE_W - 1, SLOT_H - 1);
        }
        const iconX = Math.round(PALETTE_X + (PALETTE_W - 16) / 2);
        const iconY = Math.round(sy + (SLOT_H - 16) / 2);
        if (item.sprite) {
          drawSprite(ctx, item.sprite, iconX, iconY);
        } else {
          ctx.fillStyle = item.bg;
          ctx.fillRect(iconX, iconY, 16, 16);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.label, PALETTE_X + PALETTE_W / 2, sy + SLOT_H / 2);
        }
      }
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';

      // Grid overlay (play area only)
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth = 0.5;
      const startCol = Math.floor(camera.x / TILE_SIZE);
      const endCol   = Math.ceil((camera.x + PALETTE_X) / TILE_SIZE);
      const startRow = Math.floor(camera.y / TILE_SIZE);
      const endRow   = Math.ceil((camera.y + VIEWPORT_H) / TILE_SIZE);
      for (let col = startCol; col <= endCol; col++) {
        const sx = col * TILE_SIZE - camera.x;
        if (sx >= PALETTE_X) break;
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, VIEWPORT_H); ctx.stroke();
      }
      for (let row = startRow; row <= endRow; row++) {
        const sy2 = row * TILE_SIZE - camera.y;
        ctx.beginPath(); ctx.moveTo(0, sy2); ctx.lineTo(PALETTE_X, sy2); ctx.stroke();
      }

      // Sky limit dashed line
      const skyY = SKY_LIMIT_ROW * TILE_SIZE - camera.y;
      if (skyY >= 0 && skyY <= VIEWPORT_H) {
        ctx.strokeStyle = 'rgba(120,160,255,0.55)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(0, skyY); ctx.lineTo(PALETTE_X, skyY); ctx.stroke();
        ctx.setLineDash([]);
      }
    },
  };
}
