// char-editor.js — in-game pixel sprite editor for custom characters
// Manages: character list view, new-char flow, full-screen 6-frame pixel editor.

import { PALETTE } from './sprites.js?v=46';
import { PLAYER_SMALL_STAND_R, PLAYER_SMALL_WALK1_R, PLAYER_SMALL_JUMP_R } from './player-sprites.js?v=46';

const CUSTOM_KEY    = 'mario-tablet:custom-chars';
const CELL = 28;   // px per grid cell (touch-friendly)

// Standard NES palette (54 colors)
const NES_COLORS = [
  '#7C7C7C','#0000FC','#0000BC','#4428BC','#940084','#A80020','#A81000','#881400',
  '#503000','#007800','#006800','#005800','#004058','#000000',
  '#BCBCBC','#0078F8','#0058F8','#6844FC','#D800CC','#E40058','#F83800','#E45C10',
  '#AC7C00','#00B800','#00A800','#00A844','#008888',
  '#F8F8F8','#3CBCFC','#6888FC','#9878F8','#F878F8','#F85898','#F87858','#FCA044',
  '#F8B800','#B8F818','#58D854','#58F898','#00E8D8','#787878',
  '#FCFCFC','#A4E4FC','#B8B8F8','#D8B8F8','#F8B8F8','#F8A4C0','#F0D0B0','#FCE0A8',
  '#F8D878','#D8F878','#B8F8B8','#B8F8D8','#00FCFC',
];

const FRAME_DEFS = [
  { id: 'small_stand', label: 'Stand', w: 16, h: 16, locked: false },
  { id: 'small_walk',  label: 'Walk',  w: 16, h: 16, locked: false },
  { id: 'small_jump',  label: 'Jump',  w: 16, h: 16, locked: false },
  { id: 'super_stand', label: 'S.Stand', w: 16, h: 32, locked: true },
  { id: 'super_walk',  label: 'S.Walk',  w: 16, h: 32, locked: true },
  { id: 'super_jump',  label: 'S.Jump',  w: 16, h: 32, locked: true },
];

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadCustomChars() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch { return []; }
}
function saveCustomChars(chars) {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(chars)); } catch {}
}

// ── Frame helpers ─────────────────────────────────────────────────────────────

function blankFrame(w, h) {
  return Array.from({ length: h }, () => Array(w).fill('.'));
}

// Convert a built-in sprite (array of palette-key strings) to a hex-per-cell frame.
function spriteToFrame(sprite, colorOverrides) {
  return sprite.map(row =>
    Array.from(row).map(ch => {
      if (ch === '.') return '.';
      return (colorOverrides && colorOverrides[ch]) || PALETTE[ch] || '.';
    })
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function createCharEditor(builtinChars, onClose) {
  let customChars = loadCustomChars();
  const overlay = document.getElementById('char-editor-overlay');

  let view = 'list';       // 'list' | 'new' | 'editor'
  let editingIdx = -1;
  let editingChar = null;
  let activeFrame = 'small_stand';
  let pickedColor = '#000000';
  let painting = false;
  let gridCanvas = null;

  // One global mouseup so painting stops even if cursor leaves grid
  window.addEventListener('mouseup', () => { painting = false; });

  function open() { view = 'list'; render(); overlay.style.display = 'flex'; }
  function close() { overlay.style.display = 'none'; if (onClose) onClose(customChars); }

  // ── Shared button helper ──────────────────────────────────────────────────

  function mkBtn(label, onClick, cls) {
    const b = document.createElement('button');
    b.textContent = label;
    if (cls) b.className = cls;
    b.addEventListener('click', onClick);
    b.addEventListener('touchend', e => { e.preventDefault(); onClick(); });
    return b;
  }

  // ── Render dispatcher ─────────────────────────────────────────────────────

  function render() {
    overlay.innerHTML = '';
    const box = document.createElement('div');
    box.id = 'ced-box';
    if (view === 'editor') box.classList.add('ced-fs');
    if (view === 'list')     renderList(box);
    else if (view === 'new') renderNew(box);
    else                     renderEditor(box);
    overlay.appendChild(box);
  }

  // ── List view ─────────────────────────────────────────────────────────────

  function renderList(box) {
    const title = el('div', 'ced-title', 'CHARACTER EDITOR');
    box.appendChild(title);

    const list = el('div', 'ced-list');

    // Built-ins (read-only)
    list.appendChild(el('div', 'ced-section-hdr', 'Built-in Characters'));
    for (const ch of builtinChars) {
      const row = el('div', 'ced-list-row');
      row.appendChild(el('span', 'ced-char-name', ch.name));
      row.appendChild(el('span', 'ced-readonly', 'built-in'));
      list.appendChild(row);
    }

    // Custom chars
    list.appendChild(el('div', 'ced-section-hdr', 'Custom Characters'));
    if (customChars.length === 0) {
      list.appendChild(el('div', 'ced-empty', 'No custom characters yet.'));
    }
    customChars.forEach((ch, i) => {
      const row = el('div', 'ced-list-row');
      row.appendChild(el('span', 'ced-char-name', ch.name));
      row.appendChild(mkBtn('Edit', () => {
        editingIdx = i; editingChar = JSON.parse(JSON.stringify(customChars[i]));
        activeFrame = 'small_stand'; view = 'editor'; render();
      }));
      row.appendChild(mkBtn('Rename', () => {
        const n = prompt('New name:', ch.name);
        if (n && n.trim()) { customChars[i].name = n.trim(); saveCustomChars(customChars); render(); }
      }));
      row.appendChild(mkBtn('Delete', () => {
        if (confirm(`Delete "${ch.name}"?`)) { customChars.splice(i, 1); saveCustomChars(customChars); render(); }
      }));
      list.appendChild(row);
    });

    box.appendChild(list);

    const footer = el('div', 'ced-footer');
    footer.appendChild(mkBtn('+ New Character', () => { view = 'new'; render(); }, 'ced-new-btn'));
    footer.appendChild(mkBtn('← Back', close));
    box.appendChild(footer);
  }

  // ── New character flow ────────────────────────────────────────────────────

  function renderNew(box) {
    box.appendChild(el('div', 'ced-title', 'NEW CHARACTER'));

    const form = el('div', 'ced-new-form');
    const nameInput = Object.assign(document.createElement('input'), {
      type: 'text', maxLength: 20, placeholder: 'Hero name…', id: 'ced-name-input',
    });
    const nameWrap = el('label', null, 'Name: ');
    nameWrap.appendChild(nameInput);
    form.appendChild(nameWrap);

    const tmplSel = document.createElement('select');
    tmplSel.id = 'ced-tmpl-select';
    addOpt(tmplSel, '', 'Blank canvas');
    for (const ch of builtinChars)  addOpt(tmplSel, ch.id, ch.name);
    for (const ch of customChars)   addOpt(tmplSel, ch.id, ch.name + ' (custom)');
    const tmplWrap = el('label', null, 'Start from: ');
    tmplWrap.appendChild(tmplSel);
    form.appendChild(tmplWrap);
    box.appendChild(form);

    const footer = el('div', 'ced-footer');
    footer.appendChild(mkBtn('Create →', () => {
      const name = nameInput.value.trim() || 'Unnamed';
      editingChar = buildNewChar(name, tmplSel.value);
      editingIdx = -1; view = 'editor'; activeFrame = 'small_stand'; render();
    }, 'ced-new-btn'));
    footer.appendChild(mkBtn('← Back', () => { view = 'list'; render(); }));
    box.appendChild(footer);
  }

  function buildNewChar(name, tmplId) {
    const ch = {
      id: 'custom_' + Date.now(), name, isCustom: true,
      frames: {
        small_stand: blankFrame(16, 16), small_walk: blankFrame(16, 16), small_jump: blankFrame(16, 16),
        super_stand: null, super_walk: null, super_jump: null,
      },
    };
    if (!tmplId) return ch;
    const bi = builtinChars.find(c => c.id === tmplId);
    if (bi) {
      const ov = bi.colors || {};
      ch.frames.small_stand = spriteToFrame(PLAYER_SMALL_STAND_R, ov);
      ch.frames.small_walk  = spriteToFrame(PLAYER_SMALL_WALK1_R,  ov);
      ch.frames.small_jump  = spriteToFrame(PLAYER_SMALL_JUMP_R,   ov);
    } else {
      const cu = customChars.find(c => c.id === tmplId);
      if (cu) ch.frames = JSON.parse(JSON.stringify(cu.frames));
    }
    return ch;
  }

  // ── Full-screen pixel editor ──────────────────────────────────────────────

  function renderEditor(box) {
    // ── Header bar ──────────────────────────────────────────────────────────
    const header = el('div', 'ced-editor-header');
    const nameInput = Object.assign(document.createElement('input'), {
      type: 'text', value: editingChar.name, id: 'ced-name-input',
    });
    nameInput.addEventListener('input', () => { editingChar.name = nameInput.value; });
    const saveBtn = mkBtn('💾 Save', () => {
      editingChar.name = nameInput.value.trim() || 'Unnamed';
      if (editingIdx >= 0) customChars[editingIdx] = editingChar;
      else customChars.push(editingChar);
      saveCustomChars(customChars);
      view = 'list'; render();
    }, 'ced-save-btn');
    header.appendChild(nameInput);
    header.appendChild(saveBtn);
    header.appendChild(mkBtn('✕ Cancel', () => { view = 'list'; render(); }));
    box.appendChild(header);

    // ── Frame tabs ───────────────────────────────────────────────────────────
    const tabs = el('div', 'ced-tabs');
    for (const fd of FRAME_DEFS) {
      const t = mkBtn(fd.locked ? fd.label + '*' : fd.label, () => {
        if (fd.locked) return;
        activeFrame = fd.id;
        renderEditorBody(main);
      }, 'ced-tab' + (fd.id === activeFrame ? ' active' : '') + (fd.locked ? ' locked' : ''));
      if (fd.locked) t.title = 'Coming soon (Phase 13)';
      tabs.appendChild(t);
    }
    box.appendChild(tabs);

    // ── Main area (grid + right panel) ───────────────────────────────────────
    const main = el('div', 'ced-editor-main');
    box.appendChild(main);
    renderEditorBody(main);
  }

  // ── Editor body (grid + right panel) — rebuilt on tab switch ─────────────

  function renderEditorBody(main) {
    main.innerHTML = '';
    const fd    = FRAME_DEFS.find(f => f.id === activeFrame);
    const frame = editingChar.frames[activeFrame];

    // ── Grid canvas (left) ───────────────────────────────────────────────────
    gridCanvas = document.createElement('canvas');
    gridCanvas.id     = 'ced-grid';
    gridCanvas.width  = fd.w * CELL;
    gridCanvas.height = fd.h * CELL;
    if (fd.locked) gridCanvas.style.opacity = '0.35';
    main.appendChild(gridCanvas);

    // ── Right panel ──────────────────────────────────────────────────────────
    const rightPanel = el('div', 'ced-right-panel');
    main.appendChild(rightPanel);

    // Copy-to row
    const unlockedFrames = FRAME_DEFS.filter(f => !f.locked && f.id !== activeFrame);
    if (unlockedFrames.length > 0) {
      const copyRow = el('div', 'ced-copy-row');
      copyRow.appendChild(el('span', 'ced-copy-label', 'Copy to:'));
      for (const target of unlockedFrames) {
        const btn = mkBtn(target.label, () => {
          editingChar.frames[target.id] = JSON.parse(JSON.stringify(frame));
          // Visual confirmation flash
          btn.textContent = '✓ ' + target.label;
          btn.style.borderColor = '#4a9a4a';
          btn.style.color = '#58D854';
          setTimeout(() => {
            btn.textContent = target.label;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 800);
        }, 'ced-copy-btn');
        copyRow.appendChild(btn);
      }
      rightPanel.appendChild(copyRow);
    }

    // Palette
    const palDiv = el('div', 'ced-palette');
    const eraser = el('div', 'ced-swatch ced-eraser' + (pickedColor === '.' ? ' picked' : ''), '✕');
    eraser.title = 'Transparent (erase)';
    eraser.addEventListener('click', () => { pickedColor = '.'; refreshPicked(palDiv); });
    palDiv.appendChild(eraser);
    for (const col of NES_COLORS) {
      const sw = el('div', 'ced-swatch' + (col === pickedColor ? ' picked' : ''));
      sw.style.background = col; sw.title = col;
      sw.addEventListener('click', () => { pickedColor = col; refreshPicked(palDiv); });
      palDiv.appendChild(sw);
    }
    rightPanel.appendChild(palDiv);

    // ── Update tab active states ─────────────────────────────────────────────
    document.querySelectorAll('.ced-tab').forEach((t, i) => {
      t.classList.toggle('active', FRAME_DEFS[i].id === activeFrame);
    });

    // ── Draw initial state ───────────────────────────────────────────────────
    redrawGrid(fd, frame);
    if (fd.locked) return;

    // ── Paint interaction ────────────────────────────────────────────────────
    function cellAt(clientX, clientY) {
      const rect = gridCanvas.getBoundingClientRect();
      return {
        col: Math.floor((clientX - rect.left) / rect.width  * fd.w),
        row: Math.floor((clientY - rect.top)  / rect.height * fd.h),
      };
    }
    function paint(clientX, clientY) {
      const { col, row } = cellAt(clientX, clientY);
      if (col < 0 || col >= fd.w || row < 0 || row >= fd.h || !frame) return;
      frame[row][col] = pickedColor === '.' ? '.' : pickedColor;
      redrawGrid(fd, frame);
    }
    gridCanvas.addEventListener('mousedown', e => { painting = true; paint(e.clientX, e.clientY); });
    gridCanvas.addEventListener('mousemove', e => { if (painting) paint(e.clientX, e.clientY); });
    gridCanvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; paint(t.clientX, t.clientY); }, { passive: false });
    gridCanvas.addEventListener('touchmove',  e => { e.preventDefault(); const t = e.touches[0]; paint(t.clientX, t.clientY); }, { passive: false });
  }

  // ── Canvas draw helpers ───────────────────────────────────────────────────

  function redrawGrid(fd, frame) {
    if (!gridCanvas || !frame) return;
    const ctx = gridCanvas.getContext('2d');
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    for (let r = 0; r < fd.h; r++) {
      for (let c = 0; c < fd.w; c++) {
        const color = frame[r][c];
        if (color && color !== '.') { ctx.fillStyle = color; ctx.fillRect(c * CELL, r * CELL, CELL, CELL); }
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= fd.w; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, fd.h * CELL); ctx.stroke(); }
    for (let r = 0; r <= fd.h; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(fd.w * CELL, r * CELL); ctx.stroke(); }
  }

  function refreshPicked(palDiv) {
    palDiv.querySelectorAll('.ced-swatch').forEach(sw => {
      const isEraser = sw.classList.contains('ced-eraser');
      sw.classList.toggle('picked', isEraser ? pickedColor === '.' : sw.title === pickedColor);
    });
  }

  // ── DOM micro-helpers ─────────────────────────────────────────────────────

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function addOpt(sel, value, text) {
    const o = document.createElement('option');
    o.value = value; o.textContent = text; sel.appendChild(o);
  }

  return {
    open,
    close,
    getCustomChars: () => customChars,
  };
}
