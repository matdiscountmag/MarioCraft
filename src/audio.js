// audio.js — SFX stub. Implemented in Phase 8.
// Exports a no-op audio manager so other modules can call it safely now.

export function createAudio() {
  const enabled = false; // flip in Phase 8

  return {
    play(/* soundId */) {
      if (!enabled) return;
      // TODO Phase 8: play SFX via Web Audio API
    },
    init() {
      // Call inside a user-gesture handler (first tap) to unlock audio context
    },
  };
}
