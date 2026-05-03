# NES-Style Tablet Platformer — Project Instructions

This file is the source of truth for the project. **Read it at the start of every session before making changes.** Update §16 (Decisions log) whenever a decision changes.

This project is built in **Claude Cowork** with files persisted locally and deployed to GitHub Pages. Sessions are short and self-contained — this file is what carries context between them.

---

## 1. What we're building

A single-level NES-era platformer optimized for **iPad in landscape orientation** (and playable on desktop/laptop with keyboard). Inspired by Super Mario Bros 3 mechanics. The hook is an in-game **level editor**: the player can flip into Edit mode, place/remove tiles and entities to remix the level, then flip back to Play mode and try their custom version.

Personal project. Hosted on **GitHub Pages**.

### Core scope (locked)

- **Stack**: HTML5 + vanilla JavaScript (ES modules) + Canvas. **No build step.** No bundler, no TypeScript, no npm install for runtime deps. Open `index.html` and it runs.
- **One level**, ~6 screens wide.
- **Tablet-first controls**: on-screen D-pad (4-direction) + 2 buttons (A = jump, B = run/fire/grab). Keyboard mirrors as fallback (arrows + Z/X).
- **Visual style**: NES pixel art, 16×16 base tile, authentic NES palette, `image-rendering: pixelated`.
- **Edit mode**: tap to place selected tile/entity, tap again to delete. Palette in a bottom strip. Persist via `localStorage`, with JSON import/export for backup.

### Out of scope

World map, multiple levels, login, backend, native iOS app, online multiplayer.

---

## 2. Visual design policy (non-negotiable)

The user wants the game to feel like Super Mario Bros 3. The agent **must not reproduce Nintendo's specific character designs, sprites, names, or trademarks**, even when asked. This includes Mario, Luigi, Goomba, Koopa, Bowser, the M-cap logo, and the specific pixel layouts of Nintendo's sprites.

What we **do** instead:

- **Match the era and palette.** NES NTSC palette, 16×16 base sprites, pixelated rendering, parallax-free flat backgrounds — same visual grammar as 1988-era platformers.
- **Use silhouette archetypes** — these are platformer-genre conventions, not Nintendo property:
  - Player: a humanoid hero figure with a cap and one-piece outfit. Original face, original cap design, original color combination distinct from Mario's red+blue.
  - Walker enemy: a dome-headed shuffling creature.
  - Shell enemy: a turtle-like creature whose shell becomes a kickable projectile.
  - Plant enemy: a toothed plant emerging from a pipe.
- **Use generic object designs**: bricks, ?-blocks, coins, pipes, ground tiles. These are universal platformer vocabulary.
- **Names in code and UI**: use the project's own names (`player`, `walker`) — never `mario`, `goomba`, `koopa`, etc.

If the user asks for something that crosses the line, push back politely and offer the original-design alternative. Don't just comply quietly.

---

## 3. Player hero

**Name: Nicky.** A humanoid hero with a pink cap and purple overalls. Two active power states (Tailed removed from scope).

| State | Sprite size | Abilities |
|---|---|---|
| Small | 16×16 | Walk, run, jump. 1 hit = die. |
| Super | 16×32 | Above + break bricks from below + 1 extra hit before reverting to Small. |

### Physics constants (tuned — these are the live values, do not revert)

Game-pixels per frame at 60fps.

```
gravity:               0.45
maxFall:               7.0
walkAccel:             0.18
runAccel:              0.30
walkMaxSpeed:          1.9
runMaxSpeed:           3.2
groundFriction:        0.16
airFriction:           0.04
jumpImpulse:           -5.5     # tuned for 4-tile standing jump
jumpHoldExtra:         -0.28    # per frame while A held, max 12 frames
jumpReleaseCutoff:     1.5      # if A released and vy < -this, clamp vy to -this
runJumpBonus:          -1.5     # added to jumpImpulse when running fast
spinDuration:          18       # frames
invulnAfterHit:        90       # frames
```

Feel benchmarks: ~4-tile standing jump (confirmed), ~6 tiles running hold (confirmed). Heavy gravity on the way down.

### Mobile run control

On touch, B is a **tap-to-toggle** for run — tap once to lock run on (button stays highlighted), tap again to unlock. Keyboard hold-to-run is unchanged. `input.resetRunToggle()` is exposed on the input object and called when switching to edit mode. This avoids the two-thumb problem of holding B while pressing A to jump.

### Variable jump

A-press fires the base impulse. While A is held (up to ~12 frames), apply small upward force. On A-release while still rising, cut velocity. Short tap = small hop, hold = full jump.

---

## 4. Enemies

| Project name | Size | Behavior |
|---|---|---|
| Walker | 16×16 | Walks, reverses at walls. Stomp = defeat. Side touch = damage. |

Other enemy types (Shellback, Spikeplant, Cannonball) removed from scope — see §12 for possible future additions.

---

## 5. World tiles & objects

Editor palette items. All snap to the 16×16 grid.

- **Ground** (textured top + filler row beneath)
- **Hard block** (gray, indestructible — for stairs)
- **Brick** (orange brick, breakable when Super hits from below)
- **? Block** (yellow with bouncing ?, contents: coin or mushroom — random at runtime)
- **Used block** (gray flat, what brick/? becomes after empty)
- **Coin** (collectible)
- **Pipe top** (32×16) and **pipe shaft** (32×16) — decorative
- **Goal post** (end-of-level, triggers Level Clear)
- **Powerup: Mushroom** (Small → Super)
- **Spawn marker** (where player starts; exactly one per level)
- Placeable enemies: Walker

---

## 6. NES color palette

Use these. Don't drift toward web-default colors — that's what kills the NES feel.

```
Sky blue:          #6B8CFF
Cloud white:       #F8F8F8
Hill green:        #50A800
Grass green:       #80D010
Ground tan:        #D88040
Ground tan dk:     #A04000
Brick orange:      #C84800
Brick orange dk:   #803800
Block yellow:      #F8B800
Block yellow dk:   #B07800
Pipe green:        #50A800
Pipe green dk:     #006800
Pipe green hl:     #B0E848
Coin gold:         #F8B800
Coin gold dk:      #A87000
Nicky pink:        #F878B8    # N in sprite palettes
Nicky pink dk:     #A02060    # n in sprite palettes
Nicky outfit:      #7840C8    # V — purple overalls
Skin:              #FCB89C    # Z
Shoes brown:       #883800    # H
Black:             #000000
White:             #F8F8F8
Stomper brown:     #B85820
Stomper light:     #FCB89C
Mushroom red:      #D03010    # R in sprite palettes
Mushroom red dk:   #881800    # r in sprite palettes
```

Nicky's sprite colors: brick-red cap/shoes (B=#C84800), peach skin (Z=#FCB89C), black outline (K). These placeholder colors are now final — no color pass planned. The N/n/V entries remain in the palette for potential use by other heroes added in Phase 9.

---

## 7. Project file structure

The repo root (`MarioCraft/`) has three folders. Only `prod/` is uploaded to GitHub Pages.

```
MarioCraft/                 # repo root (local only)
├── prod/                   # ← what gets uploaded to GitHub Pages
│   ├── instructions.md     # this file
│   ├── README.md           # quick-start + status
│   ├── index.html          # entry point
│   ├── styles.css          # page chrome + control overlay
│   ├── src/
│   │   ├── main.js         # bootstrap + game loop
│   │   ├── input.js        # touch + keyboard → input state
│   │   ├── physics.js      # AABB collision against tiles
│   │   ├── renderer.js     # canvas draw, camera, debug overlay
│   │   ├── sprites.js      # bitmap sprite definitions
│   │   ├── player-sprites.js
│   │   ├── level.js        # tile grid, save/load
│   │   ├── editor.js       # edit mode, palette
│   │   ├── items.js        # powerups, coins
│   │   ├── audio.js        # SFX (later)
│   │   └── entities/
│   │       ├── player.js
│   │       └── walker.js          # Phase 8 — the one enemy type
│   │       # stomper.js, shellback.js, spikeplant.js, cannonball.js exist as stubs — not built out
│   └── levels/
│       └── default.json    # built-in level
├── backup/                 # snapshot before a major phase — do not upload
└── assets/                 # working files (CSVs, reference art, etc.) — do not upload
```

`index.html` loads `src/main.js` as `<script type="module">`. All asset paths are **relative** (`src/main.js` not `/src/main.js`) — Pages serves under a subdirectory.

### Backup policy

Before starting any new phase, copy the current `prod/` folder into `backup/` (overwrite). This gives a clean rollback point if the phase goes sideways. The agent should remind the user to do this at the start of each phase session.

---

## 8. Sprite authoring convention

Each sprite is an array of equal-length strings. Each character maps to a color in `PALETTE`. `.` = transparent.

```js
// Key palette entries (see sprites.js for full map)
// N=#F878B8  n=#A02060  V=#7840C8   // Nicky pink / dark pink / purple outfit
// Z=#FCB89C  H=#883800               // skin / shoes
// Y=#F8B800  B=#C84800  b=#803800    // block yellow / brick orange / brick dark
// G=#50A800  g=#006800  L=#B0E848    // pipe / pipe dark / pipe highlight
// O=#D88040  o=#A04000               // ground tan / ground dark
// C=#F8B800  c=#A87000               // coin / coin dark
// K=#000000  W=#F8F8F8  .=transparent
```

Sprites are arrays of equal-length strings, 1 char = 1 game pixel. `drawSprite(ctx, sprite, px, py, flipX)` renders them. Nicky sprites live in `player-sprites.js` (split from `sprites.js` to stay under 300 lines).

Render: iterate rows × cols, fill 1×1 rect at game-pixel coords, scale via canvas size + `imageRendering: pixelated`. Flip horizontally by reversing column order at draw time (don't store mirrored copies).

**Animation**: 2-frame walk cycle alternates between `PLAYER_SMALL_WALK1_R` (arms out) and `PLAYER_SMALL_STAND_R` (arms at sides). Cycle based on horizontal speed (`walkTimer += |vx| * dt`; flip frame when timer exceeds **3** — tuned for feel, do not revert). Speed-dependent: naturally faster when running.

### CSV → sprite array workflow

The user draws sprites in a spreadsheet saved as CSV (from `assets/`). Agent converts to JS string array:

- CSV color key: `b` → `K` (black), `r` → `B` (brick-red), `p` → `Z` (peach), empty cell → `.`
- Target size: 16×16. If CSV is narrower, pad with dots to center (stand) or pad right (walk with arms out).
- **Positioning rule**: the shoe-base row must land at sprite row 15 so feet are flush with the physics box bottom. For stand poses (CSV shorter than 16 rows), add an empty row at the top. For walk poses that naturally fill 16 rows, no adjustment needed.
- Walk frame: arms-out running pose. 1px vertical bob implemented via `sy -= this.walkFrame` in `player.js draw()`.

### Ground probe snap rule

`physics.js` has a ground probe after the main AABB resolution that catches the sub-pixel case where gravity (0.45px/frame) doesn't produce enough overlap to trigger the normal downward collision. **The probe must snap `y` and zero `vy`**, not just set `onGround=true`. Without the snap, `y` drifts by a fraction of a pixel each frame, rounds differently in `Math.round()` at draw time, and produces a 1px vertical flicker while standing. The correct pattern:

```js
entity.y  = probeRow * TILE_SIZE - entity.h;  // snap to exact grid
entity.vy = 0;
entity.onGround = true;
```

### Canvas text is always fuzzy — use DOM for HUD

`ctx.fillText()` on a 256×224 canvas applies subpixel antialiasing at canvas resolution, then the CSS scale magnifies those blurred pixels. The result always looks fuzzy compared to sprite art drawn as filled rectangles.

**Rule**: never use `ctx.fillText()` for any in-game UI (coin counter, score, lives). Instead, put HUD text in real DOM elements inside `#hud` or a separate overlay div. DOM text renders at full screen resolution and stays crisp. Update element `.textContent` from the game loop only when the value changes (not every frame) to avoid layout thrash.

### ES module cache-busting

Bumping `?v=N` on `<script src="main.js?v=N">` in `index.html` only forces `main.js` to re-fetch. Sub-modules imported inside JS files are cached separately by the browser's module map and will **not** update unless their import URL also changes.

**Rule**: every `import` in every JS file needs its own `?v=N`. This includes `input.js`, `renderer.js`, `editor.js`, `level.js` — not just the entity/sprite files. When caught without a version string, add one and bump it immediately.

```js
// in main.js — all imports need version strings
import { createInput }              from './input.js?v=37';
import { Renderer, createCamera }   from './renderer.js?v=37';
import { createPlayer }             from './entities/player.js?v=37';

// in player.js
import { resolveEntity }            from '../physics.js?v=37';
import { PLAYER_SMALL_STAND_R, ... } from '../player-sprites.js?v=37';
```

Keep all version numbers in sync across every file.

---

## 9. Game loop

`main.js` runs one `requestAnimationFrame` loop:

```
loop(now):
  dt = clamp((now - last) / 16.67, 0, 2)
  last = now
  input.poll()
  if mode === 'play':
    player.update(dt)
    entities.update(dt)
    physics.resolve(dt)
    camera.follow(player)
    checkLevelEnd()
  else:
    editor.update()
  renderer.draw()
```

Use a fixed-timestep accumulator only if jitter is visible. Start simple.

---

## 10. Coordinate system

- **World**: game pixels. Level = 1536 wide × 768 tall (96×48 tiles of 16). Origin top-left.
- **Camera**: 256×224 viewport in world coords. Follows player with a 32-pixel horizontal dead-zone and a 32-pixel vertical dead-zone. Camera x clamped to `[0, 1280]`, camera y clamped to `[0, 544]`.
- **Canvas internal resolution**: 256×224. CSS-scaled to fit container.
- `image-rendering: pixelated` on the canvas.
- Ground is anchored at rows 46–47. Sky ceiling (edit mode limit) is row 2. Rows 0–45 are open build space above ground.

---

## 11. Edit mode UX

HUD has Play/Edit toggle (button label flips: "Edit" in play mode, "Play" in edit mode).

### HUD button labels (play mode)

| Button | Label | Notes |
|---|---|---|
| Toggle editor | "Edit Map" | Was "Edit" — renamed for clarity |
| Hero select | "Select Hero" | Was "Hero" — renamed for clarity |
| Hero editor | "Hero Editor" | New in Phase 11 — opens the pixel sprite editor |
| Start Over | "Start Over" | Unchanged |

The **"Hero Editor"** button is hidden in map editor mode (same rule as "Select Hero"). All three hero-related buttons are hidden when map editor is active — only "Edit Map" (relabelled "Play") and "⚠ Clear Map Edits" are shown.

**Edit mode shows:**
- Faint white grid overlay on the play area
- **Right-side palette strip** (32px wide, 8 slots of ~28px each) — tiles selectable by tapping
- Blue dashed sky-limit line at row 2 (cannot place tiles above this)
- Touch control overlay hidden; edit-only HUD buttons (Reset, Export) shown
- Drag-to-pan the viewport (5px threshold distinguishes drag from tap)

**Palette items (in order):** Erase (X), Ground Top, Ground, Hard, Brick, ? Block, Coin, Pipe

**Interactions:**
- Tap palette slot → select tool
- Tap in play area → place selected tile (or erase, or place pipe)
- Erase tool → remove tile; if tile is part of a pipe, removes all 4 compound tiles
- Pipe → places a 2×2 compound tile (pipe_tl/tr/sl/sr)
- Drag on play area → pan viewport
- Auto-save on every tile change (`localStorage` key `mario-tablet:level:custom`)
- Reset button (HUD) → clears localStorage and reloads page (with confirm)
- Export button (HUD) → downloads `level.json`

**? block contents**: random at runtime — 70% coin pop, 30% mushroom. No in-editor picker. Walker enemy placeable in Phase 8.

**Level data shape:**

```js
{
  width: 96,
  height: 48,
  spawn: { x: 2, y: 45 },   // tile coords — player.js multiplies by 16
  tiles: [ /* [row][col], strings or null */ ],
  entities: [
    { type: "stomper", x: 240, y: 720 }
  ]
}
```

---

## 12. Build phases

Each phase ends with a working, playable build. Don't bundle phases. Deploy to Pages is **manual and per-milestone** (not per-phase) — see §13.

- **Phase 1 — Skeleton** ✅: index.html, canvas, hardcoded test level (ground row + a few bricks). No player.
- **Phase 2 — Player movement** ✅: Nicky sprite, walk/run/jump physics, AABB tile collision, camera follow. Keyboard only. Jump latch input fix. Level layout tuned for reachable ? blocks.
- **Phase 3 — Touch controls** ✅: D-pad + A/B virtual buttons. Hit targets ≥64px. `touch-action: none` on controls. Test on iPad. (`setVirtualKey()` already scaffolded in `input.js`.)
- **Phase 4 — Environment physics** ✅: Brick breaking (Super smashes, Small bonks), ? blocks spawn coin pop (+1 instant) or mushroom item, floating coins collectible on contact, mushroom emerges → slides → collected (Small→Super). New: src/items.js. Dev: P key toggles small/super.
- **Phase 5 — Edit mode** ✅: Toggle, right-side palette strip, place/delete/pipe, drag-to-pan, auto-save, reset, JSON export. Level expanded to 96×48, vertical camera scroll added.
- **Phase 6 — Graphics overhaul** ✅: Background decorations, improved tiles (ground, brick, used block), Small Nicky stand/walk/jump sprites from CSV art, walk animation. **Deferred to Phase 10**: Super Nicky sprites. Nicky color pass removed from scope — placeholder colors are final.
- **Phase 7 — Finish line**: Goal post tile placeable in editor. Touching it shows "Level Clear!" message and pauses play. Death animation (brief fall + fade) when player takes a fatal hit, then respawn at spawn marker. No lives, no game over screen.
- **Phase 8 — Enemy**: Single walker enemy (goomba-style dome-head, original sprite). Walks, reverses at walls, stomp = defeat, side touch = damage. Placeable in edit mode via palette strip.
- **Phase 9 — Hero selector**: Simple hero select screen shown before play. Player picks a hero, hits Play. Heroes share the same sprite artwork — each is defined by a palette color override (a `colors` object mapping sprite palette keys to new hex values). No CSV upload needed per hero. Nicky (default, no overrides) is always first; additional heroes appended to `heroes.js`. `drawSprite` accepts an optional `colors` parameter for per-draw overrides.
- **Phase 10 — Edit mode polish**: Arrow key scroll in edit mode; walkers placed in editor now appear on return to play (entity array rebuild on mode switch); Export button removed; Hero button hidden in edit mode; Start Over button added to play-mode HUD (reload without clearing level edits, distinct from Reset which wipes the level).
- **Phase 11 — Hero editor**: In-game UI for creating and editing fully custom playable heroes with pixel-art sprites.

  **Entry point**: "Hero Editor" button on the hero select screen.

  **Hero list view**: shows all user-created heroes with Edit, Rename, and Delete options. Built-in heroes (Nicky, Dex) are listed as read-only — no edit/delete.

  **New Hero flow**: prompt for name → choose "From Scratch" (blank grid) or "From Template" (copy frames from any existing hero, including built-ins).

  **Pixel editor** (full-screen, capped to game canvas max-width):
  - 6 frame tabs: Small Stand, Small Walk, Small Jump, Super Stand, Super Walk, Super Jump
  - Small frames: 16×16 grid. Super frames: 16×32 grid (stored but dormant until Phase 13)
  - Grid cell size: 28px (touch-friendly)
  - Full NES 54-color palette in the right panel (one click per cell — no drag-to-paint required). No preview pane — palette gets the full right-panel space.
  - "Copy to:" buttons let you deep-copy the current frame to another frame (e.g. copy Stand → Walk then adjust hands)
  - Hero name editable from within the editor (rename in place)

  **Data model** for custom heroes (stored in localStorage under `mario-tablet:custom-heroes`):
  ```js
  {
    id: 'custom_<timestamp>',
    name: 'My Hero',
    isCustom: true,
    frames: {
      small_stand: [ /* 16 strings of 16 chars each — hex color or '.' */ ],
      small_walk:  [ /* 16×16 */ ],
      small_jump:  [ /* 16×16 */ ],
      super_stand: null,   // populated when Super engine ships
      super_walk:  null,
      super_jump:  null,
    }
  }
  ```
  Custom heroes use direct hex colors per cell (no key/palette-override system). The key system (K/B/Z etc.) remains in use only for built-in heroes and environment objects (pipes, tiles) where CSV-based refinement is needed.

  **Renderer integration**: `player.js` / `renderer.js` check if the active hero has `isCustom: true` and a `frames` object; if so, use those arrays directly instead of the global `PLAYER_SMALL_*` constants. Falls back to Nicky frames if a frame is missing.

  **New file**: `src/hero-editor.js`. Keep under 300 lines; split if needed.

  **HUD changes** (do at start of Phase 11): rename "Edit" → "Edit Map", rename "Hero" → "Select Hero", add new "Hero Editor" button. "Hero Editor" and "Select Hero" are both hidden when map editor is active (same rule already applied to "Hero" in Phase 10).

  **Walk frame cleanup** (do at start of Phase 11): remove `PLAYER_SMALL_WALK2_R` from `player-sprites.js` — it is identical to `WALK1_R`. Update animation logic in `player.js` to use a single walk frame (`PLAYER_SMALL_WALK1_R`), keeping the existing walk timer and bob intact.

- **Phase 12 — Graphics refinement + SFX**: SFX via Web Audio API (no library, ~80 lines in audio.js — jump, coin collect, block hit, death tones). Tile and environment sprite polish as needed (pipe, blocks, etc.) via CSV refinement workflow.

- **Phase 13 — Super state**: Super Nicky sprites (16×32), super state engine work (brick-breaking from below, hit shrinks Super→Small), and super frame authoring unlocked in the hero editor (super_stand/super_walk/super_jump tabs become active). Until this phase, super frame tabs in the hero editor are visible but marked "Coming soon."

### Removed from scope (may revisit)
- Lives counter and game over screen
- Shellback, Spikeplant, Cannonball enemies
- Tailed powerup (spin attack, no flight)
- Multiple enemy types beyond one walker

When a phase ships: tick its box in `README.md` Status, append to §16 Decisions log here, and tell the user it's ready to upload to GitHub Pages. Bump the cache-bust `?v=` number on script/style tags in `index.html`.

---

## 13. Run & deploy workflow

This project does **not** use git, and does **not** use a local web server. The agent must never:
- Run `git init`, `git add`, `git commit`, `git push`, or suggest installing git
- Run `python -m http.server`, `npx serve`, or any local-server command
- Suggest LAN-IP testing flows

The user has chosen a manual-upload-only workflow. Every iteration ships through GitHub Pages. This is slower than the alternatives, but the user has accepted that trade-off.

### The single test loop

1. Agent edits files in the project folder (Cowork)
2. User uploads changed files to GitHub via the repo web UI: **Add file → Upload files** → drag the whole project folder (it preserves structure and overwrites same-path files) → write a commit message in the form → **Commit changes**
3. User waits ~30s for Pages to rebuild
4. User refreshes the Pages URL on iPad

Because every iteration costs the user an upload step, the agent should:
- **Bundle related changes** into one logical batch before declaring "ready to test." Don't ask the user to upload after every micro-tweak.
- **End each session with a clear "files changed since last upload"** list, so the user can drag just those files if they prefer (or the whole folder, which is also fine).
- **Test the change as thoroughly as possible in code** before handing it off — physics constants, sprite math, edit-mode logic — so the on-device test is a confirmation, not a discovery.

### First-time Pages setup (user does this in browser, one time)

- Empty repo created on github.com (Public).
- Repo Settings → Pages → Source: "Deploy from a branch" → `main` / `/ (root)` → Save.
- After the first upload, the Pages URL appears at the top of that settings page. Bookmark it.

### Cache-busting on iPad

Safari caches aggressively, and the upload-and-wait loop is already slow — stale cache on top of that is brutal. To pre-empt it:

- The agent should add a version query string to the script and stylesheet tags in `index.html` and bump it on every meaningful change:

  ```html
  <link rel="stylesheet" href="styles.css?v=12">
  <script type="module" src="src/main.js?v=12"></script>
  ```

- Increment the `v=` number whenever any JS or CSS changes. The user doesn't need to think about it; the agent maintains it.
- If the user still sees stale behavior, instruct them to long-press the refresh button in iPad Safari and pick "Reload Without Content Blockers" or close and reopen the tab.

---

## 14. iOS / Safari gotchas

- Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">`
- Tap delay: `touch-action: manipulation` on buttons
- Highlight on tap: `-webkit-tap-highlight-color: transparent`
- Rubber-band scroll: `body { overscroll-behavior: none; overflow: hidden; touch-action: none; }`
- Audio autoplay: Web Audio API `AudioContext` must be created or resumed inside a user-gesture handler (first tap)
- `localStorage` disabled in Private Browsing — detect and degrade
- Safe areas: pad controls overlay with `env(safe-area-inset-bottom)`
- Web can't truly lock orientation. Detect portrait → show "rotate to landscape" overlay

---

## 15. Working agreements (for the agent)

1. **Read this file at the start of every session.** Sessions are intentionally short — this file is what carries context.
2. **Back up before a new phase.** At the start of any session that begins a new phase, copy the current `prod/` folder into `backup/` (overwrite) before touching any files. Remind the user to do this if they haven't.
3. **No build tools.** Plain HTML+JS+CSS. ES modules are fine.
4. **No external CDN deps in core gameplay.** SFX will use the built-in Web Audio API — no library needed.
4. **Keep modules small.** Past ~300 lines usually means split.
5. **Don't delete files unless asked.** Refactor by adding alongside.
6. **Each phase ends in a runnable state, ready to upload.** If something's half-done, mark `// TODO:` rather than leave broken code.
7. **Bundle changes before handoff.** The user's deploy step is manual (drag-upload to GitHub web UI), so don't ask them to upload after every micro-tweak. Group related work, then say "ready to upload."
8. **One thing at a time when tuning.** Don't combine physics tweaks with sprite redraws — the user needs to A/B them.
9. **End every session with a status update.** Tick the relevant box in `README.md`, append a one-liner to §16 below describing what changed and why. This is what makes the next session start clean.
10. **Visual design policy in §2 is hard.** Don't produce sprites with Nintendo's specific designs even if asked. Push back and offer the original alternative.
11. **Conflicts surface before changes.** If something the user asks for contradicts this file, name the conflict and ask — don't silently override either.

---

## 16. Decisions log

Append-only. Format: `YYYY-MM-DD — <change>`.

- **2026-04-26** — Project kicked off. Visual style: NES pixel art, original sprite designs in SMB3 aesthetic. Level width: ~6 screens. Stack: vanilla HTML+JS+Canvas, no build step. Hosting: GitHub Pages.
- **2026-04-26** — Phase 1 shipped. Canvas renders crisp on iPad.
- **2026-04-26** — Phase 2 shipped. Player character renamed Nicky, colors changed to pink/purple. Physics tuned: jumpImpulse -5.5, runJumpBonus -1.5, jumpReleaseCutoff 1.5 — confirmed 4-tile standing / 6-tile running jumps. Input rewritten with keydown latch to fix 70% jump-miss bug. Level layout redesigned so all ? blocks have clear jump paths from ground. Physics rewritten as directional leading-edge AABB.
- **2026-04-26** — Removed P-meter and flight from scope (was Phase 5). Cape powerup now gives spin attack only. Phase numbering updated. Graphics overhaul added as dedicated Phase 6 (not mixed with gameplay work).
- **2026-04-27** — Phase 3 shipped. Touch controls wired in input.js: zone-based D-pad on #dpad container (14px deadzone, multi-touch safe), A=jump (KeyZ) / B=run (KeyX) round buttons. Portrait overlay already in main.js. Visual .pressed feedback on all buttons. Cache bust bumped to v=4.
- **2026-04-27** — Confirmed: "Caped" powerup stays as spin-attack-only for now (no ears/tail sprite, no P-meter, no flight). P-meter + tailed form deferred to post-Phase-8. README Phase 5 "Caped & P-meter" line removed; phases renumbered to match instructions.
- **2026-04-27** — Phase plan restructured: Phase 4 is now Environment physics (block hits, coins, mushroom powerup) so the world has meaningful interactions before enemies are introduced. Tail powerup moved to Phase 8 alongside all enemies. Old Phase 4 (enemies + powerups) split and reordered.
- **2026-04-27** — Phase 4b shipped: ? block contents + mushroom powerup. Bumping a ? block converts it to 'used', spawns a coin pop (visual, instant +1 coin) or a mushroom item (physical). Mushroom emerges one tile over 22 frames, slides right, reverses on walls, collected by walking into it (Small→Super). Floating coin tiles collectible on player contact. New file: src/items.js. Mushroom sprite added to sprites.js.
- **2026-04-27** — Phase 4a shipped: brick breaking. physics.js now records hitCeiling={col,row,tileId} on upward collision. player.js reads it and calls world.breakBrick (Super) or world.bumpBlock (Small/qblock). Bricks permanently removed via setTile. 4-fragment debris particles (orange, gravity, 30-frame fade). Blocks bump up 4px via sin curve over 14 frames. Hard blocks produce no reaction. Dev: press P to toggle small/super for testing.
- **2026-04-27** — Repo reorganized into prod/ (GitHub Pages), backup/ (pre-phase snapshots), and assets/ (working files). §7 updated to reflect new structure. Backup-before-phase policy added.
- **2026-04-27** — Phase 5 shipped: Edit mode. LEVEL_ROWS expanded 14→48 (ground rows 46–47, sky ceiling row 2, build space rows 2–45). Vertical camera scroll added (32px dead-zone, clamped). editor.js: right-side 32px palette strip with 8 slots (erase, ground_top, ground, hard, brick, qblock, coin, pipe), drag-to-pan with 5px threshold, auto-save on every change, compound pipe placement (2×2) + smart erasure, sky limit dashed line, grid overlay. ? block contents random at runtime (70% coin, 30% mushroom). Entity placement and spawn marker deferred to Phase 8. Reset (clears localStorage) and Export (downloads level.json) added to HUD.
- **2026-04-27** — Physics ground probe snap fix: probe now snaps `y = probeRow * TILE_SIZE - h` and zeros `vy` in addition to setting `onGround=true`. Without this, sub-pixel gravity drift caused 1px vertical flicker during standing. Walk animation: switched to alternating `WALK1_R` ↔ `STAND_R` (was both frames identical, causing sliding look). Walk timer threshold tuned from 20 → 4 for correct feel; do not revert. Cache bust at v=32.
- **2026-04-27** — Phase 6 shipped. Remaining art (Nicky color pass, Super Nicky sprites, enemy sprites) deferred to Phase 8 (final art pass).
- **2026-04-27** — Phase 7 started. Coin counter added as DOM element in #hud (not canvas — canvas text is always fuzzy at 256×224 resolution). #hud background removed (was dark bar covering gameplay). Mobile B button changed to tap-to-toggle run (keyboard hold unchanged). Walk animation threshold tuned to 3. Version strings added to input.js and renderer.js imports (were missing). Cache bust at v=38. Completed: background decorations (clouds/hills/bushes) world-positioned at wy≈562–736 so they're visible during play (camera.y≈544); draw order sky→hills→bushes→clouds→tiles. Ground tile improved with dark green shadow + tan separator row. Brick tile redesigned with black mortar grid (upper/lower offset bricks). Used block redesigned with black border (matching ? block family) + gray interior. Mushroom sprite added (new R/r palette entries). Small Nicky standing sprite replaced with pixel-perfect CSV-derived art (K/B/Z placeholder colors; intended pink/purple pending color pass). Walk frame added (arms-out pose from CSV, 1px bob). Bug fixed: canvas `arc(..., Math.PI, 0, true)` draws bottom half (downward), not top — all background arcs changed to `false`. ES module cache-busting rule established: bump version in import statements too, not just index.html. Cache bust at v=18.
- **2026-04-29** — Phase plan finalized. Removed from scope: lives, game over screen, Shellback/Spikeplant/Cannonball enemies, Tailed powerup, Nicky color pass (placeholder colors now permanent). Final phase order: 7 = finish line (goal post, Level Clear, death + respawn); 8 = walker enemy (single dome-head type, stomp mechanic, editor-placeable); 9 = hero selector (simple pick screen before play, each hero added via CSV upload per session); 10 = Super Nicky sprites + SFX (Web Audio API, no library). "May revisit" items recorded in §12.
- **2026-04-29** — Phase 8 shipped. Walker enemy: dome-headed original sprite (WALKER_1/WALKER_2 in sprites.js), two walk frames. Walks at 0.6px/frame, reverses at walls (vx zeroed by physics) and ledge edges (ground probe ahead). Stomp from above = defeat + 5px bounce; side contact = Small→die or Super→shrink+90 invuln frames. Editor: 10th palette slot (entity type), tap to place/remove walker, teal border highlight in edit mode, erase tool also removes entities. Two default walkers at col 15 and col 43. editor.js truncation bug fixed (file was cut mid-line since Phase 7). Cache bust at v=40.
- **2026-04-29** — Phase 7 shipped. Goal tile added (checkerboard yellow/white, 16×16). Touching it shows "LEVEL CLEAR!" DOM overlay (NES gold border, coin count, Play Again button). Death: fall off world bottom triggers dead flag — player falls and fades to transparent over 60 frames, then window.location.reload() (no respawn, no lives). Editor palette expanded to 9 slots (goal added as slot 9). Goal post placed at [45][92] in default level. Cache bust at v=39.
- **2026-04-29** — Phase 9 shipped. Hero select screen shown on load before game starts. Heroes share sprites; each defined by a `colors` palette override map in `heroes.js`. `drawSprite` updated to accept optional `colors` arg (backward-compatible). player.js gets `colors: null` field set by `startGame()`. Two heroes: Nicky (default palette) and Dex (B → deep blue). DOM overlay `#hero-select-overlay` with dynamic cards built from HEROES array; `drawHeroPreview()` renders 16×16 sprite onto card canvas with color overrides, CSS-scaled to 64×64 pixelated. Selection persisted in localStorage. Enter/Space starts game from keyboard. Pink Nicky color correction requirement removed — Nicky's placeholder colors (B=#C84800 brick-red cap/shoes, Z=#FCB89C skin) are the final canonical colors. Cache bust at v=42.
- **2026-04-29** — Phase 10 shipped. Edit mode polish: (1) Arrow key scroll — editor.js tracks its own key state independently of input.js; ArrowLeft/Right/Up/Down scroll camera at 4px/frame; keys cleared on mode toggle to prevent stuck input. (2) Walker entity rebuild — switching from edit to play mode now rebuilds the live `entities` array from `level.entities`, so walkers placed in the editor appear immediately. (3) HUD cleanup: Export button removed; Hero and Start Over buttons hidden in edit mode; Reset button relabelled "⚠ Clear Map Edits". (4) Start Over button added to play-mode HUD — `window.location.reload()` without clearing localStorage, restarting from spawn with level edits intact. Cache bust at v=43.
- **2026-04-29** — HUD button labels clarified: "Edit" → "Edit Map", "Hero" → "Select Hero", new "Hero Editor" button added for Phase 11. "Hero Editor" hidden in map editor mode (same rule as "Select Hero"). §11 HUD table added.
- **2026-04-29** — Phase 11 (Hero Editor) designed and added to plan. Key decisions: (1) custom heroes use direct hex colors per cell, not the key/palette-override system — full NES 54-color palette picker; (2) 6 frames total (small + super × stand/walk/jump), super frames stored as null until Phase 13 Super engine ships; (3) built-in heroes (Nicky, Dex) are read-only in the editor; (4) walk animation consolidated to single frame (WALK1 == WALK2, remove duplicate); (5) fixed objects (pipes, tiles) keep the key-based system for CSV refinement workflow; (6) new file src/hero-editor.js. Phases reordered: Hero Editor → Phase 11, Graphics/SFX → Phase 12, Super state → Phase 13.
- **2026-04-29** — Post-Phase-9 UX polish. (1) "👤 Hero" HUD button added beside Edit — reopens hero select overlay mid-session and pauses game. (2) Death animation cutoff reduced 90→65 frames; pressing jump after 30 frames also skips to reload immediately. (3) Jump button (A) confirms both overlays: starts game on hero select, reloads on Level Clear (30-frame lockout to prevent accidental trigger). (4) Left/right d-pad and arrow keys cycle heroes on the select screen. Bug: wiring left/right in both a keydown handler AND the loop's edge detection caused a double-cycle — with 2 heroes the cycles cancelled out and nothing appeared to happen. Fix: remove from keydown handler, use loop edge detection only (works for keyboard and touch uniformly).

---

## 17. README.md template (create on first run)

```md
# NES-Style Tablet Platformer

A single-level NES-style platformer with an in-game level editor, optimized for iPad.

**Live**: https://<your-user>.github.io/<repo>/

## Controls

- **Desktop**: Arrow keys = move, Z = jump, X = run/grab
- **Tablet**: D-pad on left, A/B buttons on right

## Status

- [x] Phase 1 — Skeleton
- [x] Phase 2 — Player movement (Nicky, physics, input latch, level layout)
- [x] Phase 3 — Touch controls
- [x] Phase 4 — Environment physics (brick breaking, ? blocks, coins, Mushroom → Super)
- [x] Phase 5 — Edit mode
- [x] Phase 6 — Graphics overhaul (backgrounds, improved tiles, Small Nicky sprites)
- [x] Phase 7 — Finish line (goal post, Level Clear, death animation + respawn)
- [x] Phase 8 — Enemy (walker, stomp mechanic, editor-placeable)
- [x] Phase 9 — Hero selector (pick screen, palette-override heroes)
- [x] Phase 10 — Edit mode polish (arrow scroll, entity rebuild, HUD cleanup)
- [ ] Phase 11 — Hero editor (create/edit/name custom heroes, pixel grid + NES palette, saved locally)
- [ ] Phase 12 — Graphics refinement + SFX (Web Audio API sounds, tile polish)
- [ ] Phase 13 — Super state (Super Nicky sprites, super engine, super frames in hero editor)
```
- **2026-04-30** — Phase 11 shipped. New src/hero-editor.js: hero list view, new-hero flow (blank or from template), 6-frame pixel editor (Stand/Walk/Jump; Super frames visible but locked until Phase 13), 54-color NES palette strip, real-time preview. Custom heroes stored in localStorage as hex-per-cell 2D arrays. Renderer/player.js support isCustom heroes via drawCustomFrame (new export in sprites.js). WALK2_R sprite removed (was duplicate of WALK1_R). HUD: 'Edit' → 'Edit Map', 'Hero' → 'Select Hero', new 'Hero Editor' button (hidden in edit mode). Cache bust bumped to v=45.
- **2026-05-02** — Naming consistency pass: renamed "Character" → "Hero" throughout. `characters.js` → `heroes.js`, `char-editor.js` → `hero-editor.js`, `CHARACTERS` → `HEROES`, `createCharEditor` → `createHeroEditor`, all DOM IDs/CSS classes (`char-card` → `hero-card`, etc.), HUD button labels ("Select Char" → "Select Hero", "Char Editor" → "Hero Editor"), overlay title "CHOOSE YOUR CHARACTER" → "CHOOSE YOUR HERO", localStorage key updated to `mario-tablet:selected-hero`. Cache bust bumped to v=47.
- **2026-05-02** — HUD layout rearranged: "Start Over" and "Select Hero" moved to left group; "Edit Map" and "Hero Editor" moved to right group. No logic changes needed — main.js hides/shows buttons by element ID, not by group. index.html only change.
- **2026-04-30** — Phase 11 pixel editor UI polished. (1) Editor is now full-screen (not a modal), capped to game canvas max-width `calc(100vh * 256/224)` and centred — matches the game view column. (2) Real-time preview removed; right panel is now copy row + palette only, giving the palette full vertical space. (3) "Copy to:" buttons added — deep-copies current frame to any other unlocked frame with a green flash confirmation; makes it easy to pose Walk/Jump from a Stand base. (4) Grid cell size bumped 20→28px for better touch targets. Cache bust bumped to v=46.
