// editor.js — Edit mode toggle, palette, place/delete tiles.
// Full implementation in Phase 6. Stub for Phase 1.

export function createEditor(levelData, renderer) {
  let active = false;

  return {
    get active() { return active; },

    toggle() {
      active = !active;
      // TODO Phase 6: show/hide palette strip, grid overlay
    },

    update(/* input */) {
      if (!active) return;
      // TODO Phase 6: handle tap-to-place, tap-to-delete, long-press ? block
    },

    draw(/* ctx, camera */) {
      if (!active) return;
      // TODO Phase 6: draw palette strip and grid overlay
    },
  };
}
