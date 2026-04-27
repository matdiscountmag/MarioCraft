// input.js — Keyboard + touch input → unified input state.
// Provides a simple poll() + state object consumed by player.js.

export function createInput() {
  const state = {
    left:  false,
    right: false,
    up:    false,
    down:  false,
    jump:  false,   // A button / Z key
    run:   false,   // B button / X key
    // Rising-edge flags (true for exactly one frame)
    jumpPressed: false,
    runPressed:  false,
  };

  const _prev = { jump: false, run: false };
  const _keys = {};

  // Key down/up listeners
  window.addEventListener('keydown', e => { _keys[e.code] = true; });
  window.addEventListener('keyup',   e => { _keys[e.code] = false; });

  /** Called once per frame before update logic. Refreshes state from raw inputs. */
  function poll() {
    state.left  = !!(_keys['ArrowLeft']  || _keys['KeyA']);
    state.right = !!(_keys['ArrowRight'] || _keys['KeyD']);
    state.up    = !!(_keys['ArrowUp']);
    state.down  = !!(_keys['ArrowDown']  || _keys['KeyS']);
    state.jump  = !!(_keys['KeyZ'] || _keys['Space']);
    state.run   = !!(_keys['KeyX'] || _keys['ShiftLeft'] || _keys['ShiftRight']);

    // Rising-edge detection
    state.jumpPressed = state.jump && !_prev.jump;
    state.runPressed  = state.run  && !_prev.run;

    _prev.jump = state.jump;
    _prev.run  = state.run;
  }

  /** Called by touch control overlay (Phase 3) to set a virtual key. */
  function setVirtualKey(key, value) {
    _keys[key] = value;
  }

  return { state, poll, setVirtualKey };
}
