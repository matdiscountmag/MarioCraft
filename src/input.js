// input.js — Keyboard + touch → unified input state.
//
// jumpPressed uses a LATCH set by the keydown event directly,
// not computed by frame comparison. This captures fast taps that
// start and finish between two poll() calls (sub-16ms presses).

export function createInput() {
  const state = {
    left:  false,
    right: false,
    up:    false,
    down:  false,
    jump:  false,
    run:   false,
    jumpPressed: false, // rising edge latch — true for exactly one poll() cycle
    runPressed:  false,
  };

  const _keys = {};
  let _jumpLatch  = false;
  let _runLatch   = false;
  let _runToggle  = false; // touch-only toggle — tap B to lock/unlock run

  window.addEventListener('keydown', e => {
    if (_keys[e.code]) return; // ignore key-repeat
    _keys[e.code] = true;
    if (e.code === 'KeyZ' || e.code === 'Space')                              _jumpLatch = true;
    if (e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') _runLatch = true;
  });

  window.addEventListener('keyup', e => {
    _keys[e.code] = false;
  });

  function poll() {
    state.left  = !!(_keys['ArrowLeft']  || _keys['KeyA']);
    state.right = !!(_keys['ArrowRight'] || _keys['KeyD']);
    state.up    = !!(_keys['ArrowUp']);
    state.down  = !!(_keys['ArrowDown']  || _keys['KeyS']);
    state.jump  = !!(_keys['KeyZ'] || _keys['Space']);
    state.run   = !!(_keys['KeyX'] || _keys['ShiftLeft'] || _keys['ShiftRight']) || _runToggle;

    // Transfer latches — true for one poll cycle, then cleared
    state.jumpPressed = _jumpLatch;
    state.runPressed  = _runLatch;
    _jumpLatch = false;
    _runLatch  = false;
  }

  // Called by touch overlay to inject virtual key events
  function setVirtualKey(code, value) {
    if (value && !_keys[code]) {
      _keys[code] = true;
      if (code === 'KeyZ')  _jumpLatch = true;
      if (code === 'KeyX')  _runLatch  = true;
    } else if (!value) {
      _keys[code] = false;
    }
  }

  // ── Touch controls ────────────────────────────────────────────────────────

  function initTouchControls() {
    const dpad = document.getElementById('dpad');
    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');
    if (!dpad || !btnA || !btnB) return; // not in DOM (e.g. unit test env)

    // Visual helpers
    const elLeft  = document.getElementById('btn-left');
    const elRight = document.getElementById('btn-right');
    const elUp    = document.getElementById('btn-up');
    const elDown  = document.getElementById('btn-down');

    function setPressedClass(el, on) {
      if (!el) return;
      el.classList.toggle('pressed', on);
    }

    // ── D-pad (zone-based on the container) ──────────────────────────────
    // Track which directions are currently active so we only call
    // setVirtualKey on changes (avoids hammering the latch logic).
    const dpadState = { left: false, right: false, up: false, down: false };
    const dpadActiveTouches = new Set();

    // Threshold (px from centre) before a direction registers.
    // 14px is roughly 1/3 of a 44px button — snappy but not accidental.
    const DEAD = 14;

    function applyDpadDir(left, right, up, down) {
      if (left  !== dpadState.left)  { dpadState.left  = left;  setVirtualKey('ArrowLeft',  left);  setPressedClass(elLeft,  left);  }
      if (right !== dpadState.right) { dpadState.right = right; setVirtualKey('ArrowRight', right); setPressedClass(elRight, right); }
      if (up    !== dpadState.up)    { dpadState.up    = up;    setVirtualKey('ArrowUp',    up);    setPressedClass(elUp,    up);    }
      if (down  !== dpadState.down)  { dpadState.down  = down;  setVirtualKey('ArrowDown',  down);  setPressedClass(elDown,  down);  }
    }

    function clearDpad() {
      applyDpadDir(false, false, false, false);
    }

    function updateDpadFromTouch(touch) {
      const rect = dpad.getBoundingClientRect();
      const dx = touch.clientX - (rect.left + rect.width  / 2);
      const dy = touch.clientY - (rect.top  + rect.height / 2);
      applyDpadDir(dx < -DEAD, dx > DEAD, dy < -DEAD, dy > DEAD);
    }

    dpad.addEventListener('touchstart', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        dpadActiveTouches.add(t.identifier);
        updateDpadFromTouch(t);
      }
    }, { passive: false });

    dpad.addEventListener('touchmove', e => {
      e.preventDefault();
      // Only the latest active touch drives the d-pad direction
      for (const t of e.changedTouches) {
        if (dpadActiveTouches.has(t.identifier)) {
          updateDpadFromTouch(t);
          break; // first active touch wins
        }
      }
    }, { passive: false });

    dpad.addEventListener('touchend', e => {
      e.preventDefault();
      for (const t of e.changedTouches) dpadActiveTouches.delete(t.identifier);
      if (dpadActiveTouches.size === 0) clearDpad();
    }, { passive: false });

    dpad.addEventListener('touchcancel', e => {
      for (const t of e.changedTouches) dpadActiveTouches.delete(t.identifier);
      if (dpadActiveTouches.size === 0) clearDpad();
    });

    // ── Action buttons ────────────────────────────────────────────────────
    function wireBtn(el, code) {
      el.addEventListener('touchstart', e => {
        e.preventDefault();
        setVirtualKey(code, true);
        el.classList.add('pressed');
      }, { passive: false });

      el.addEventListener('touchend', e => {
        e.preventDefault();
        setVirtualKey(code, false);
        el.classList.remove('pressed');
      }, { passive: false });

      el.addEventListener('touchcancel', () => {
        setVirtualKey(code, false);
        el.classList.remove('pressed');
      });
    }

    wireBtn(btnA, 'KeyZ'); // A = jump

    // B = toggle run lock (tap to turn on, tap again to turn off)
    btnB.addEventListener('touchstart', e => {
      e.preventDefault();
      _runToggle = !_runToggle;
      btnB.classList.toggle('pressed', _runToggle);
    }, { passive: false });
    btnB.addEventListener('touchend',   e => e.preventDefault(), { passive: false });
    btnB.addEventListener('touchcancel', e => e.preventDefault());
  }

  initTouchControls();

  function resetRunToggle() {
    _runToggle = false;
    const btnB = document.getElementById('btn-b');
    if (btnB) btnB.classList.remove('pressed');
  }

  return { state, poll, setVirtualKey, resetRunToggle };
}
