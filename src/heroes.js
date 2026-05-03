// heroes.js — Playable hero roster.
// Each entry defines a palette override applied at draw time — same sprites, different colors.
// Nicky's sprite uses: K=black(outline), B=brick-red(cap/shirt/shoes), Z=peach(skin).
// Add new heroes by appending an entry with a unique id, name, and colors override.

export const HEROES = [
  {
    id:     'nicky',
    name:   'Nicky',
    colors: {},               // default palette — no overrides
  },
  {
    id:     'dex',
    name:   'Dex',
    colors: { B: '#3060D0' }, // deep blue cap, shirt, and shoes
  },
];
