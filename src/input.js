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
  let _jumpLatch = false;
  let _runLatch  = false;

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
    state.run   = !!(_keys['KeyX'] || _keys['ShiftLeft'] || _keys['ShiftRight']);

    // Transfer latches — true for one poll cycle, then cleared
    state.jumpPressed = _jumpLatch;
    state.runPressed  = _runLatch;
    _jumpLatch = false;
    _runLatch  = false;
  }

  // Called by touch overlay (Phase 3) to inject virtual key events
  function setVirtualKey(code, value) {
    if (value && !_keys[code]) {
      _keys[code] = true;
      if (code === 'KeyZ')  _jumpLatch = true;
      if (code === 'KeyX')  _runLatch  = true;
    } else if (!value) {
      _keys[code] = false;
    }
  }

  return { state, poll, setVirtualKey };
}
