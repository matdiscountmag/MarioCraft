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
- **Names in code and UI**: use the project's own names (`player`, `stomper`, `shellback`, `spikeplant`, `cannonball`) — never `mario`, `goomba`, `koopa`, etc.

If the user asks for something that crosses the line, push back politely and offer the original-design alternative. Don't just comply quietly.

---

## 3. Player character

**Name: Nicky.** A humanoid hero with a pink cap and purple overalls. Three power states.

| State | Sprite size | Abilities |
|---|---|---|
| Small | 16×16 | Walk, run, jump. 1 hit = die. |
| Super | 16×32 | Above + break bricks from below + 1 extra hit before reverting to Small. |
| Tailed | 16×32 | Above + spin attack (B in air or while not running). |

(Naming note: "Tailed" is our equivalent of the SMB3 raccoon form. Visual: original ears + tail design, distinct from Nintendo's specific raccoon suit. No flight / P-meter — deferred to post-Phase-8.)

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

### Variable jump

A-press fires the base impulse. While A is held (up to ~12 frames), apply small upward force. On A-release while still rising, cut velocity. Short tap = small hop, hold = full jump.

---

## 4. Enemies

| Project name | Size | Behavior |
|---|---|---|
| Stomper | 16×16 | Walks, reverses at walls. Stomp = defeat. Side touch = damage. |
| Shellback green | 16×24 | Walks, walks off ledges. Stomp = becomes shell. Touching shell kicks it; shell slides until wall, kills enemies in path. Re-stomp shell to stop. |
| Shellback red | 16×24 | Like green but won't walk off ledges. |
| Spikeplant | 16×24 | Emerges from a pipe top on a timer. Cannot be stomped. Pauses while player is on the pipe. |
| Cannonball | 16×16 | Spawned from off-screen launcher tiles. Flies horizontally. Stompable. |

---

## 5. World tiles & objects

Editor palette items. All snap to the 16×16 grid.

- **Ground** (textured top + filler row beneath)
- **Hard block** (gray, indestructible — for stairs)
- **Brick** (orange brick, breakable when Super hits from below)
- **? Block** (yellow with bouncing ?, contents set in editor: coin / mushroom / tail)
- **Used block** (gray flat, what brick/? becomes after empty)
- **Coin** (collectible)
- **Pipe top** (32×16) and **pipe shaft** (32×16) — decorative in v1
- **Goal post** (end-of-level)
- **Powerup: Mushroom** (Small → Super)
- **Powerup: Tail** (Super → Tailed)
- **Spawn marker** (where player starts; exactly one per level)
- Placeable enemies: Stomper, Shellback green/red, Spikeplant, Cannonball

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
```

Nicky's color scheme: pink cap + highlights (N=#F878B8), dark pink shading (n=#A02060), purple outfit (V=#7840C8), skin (Z=#FCB89C), dark brown shoes (H=#883800). These are already live in `sprites.js` and `player-sprites.js`.

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
│   │       ├── stomper.js
│   │       ├── shellback.js
│   │       ├── spikeplant.js
│   │       └── cannonball.js
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

**Animation**: 2–3 keyframes per cycle (`PLAYER_SMALL_WALK_1`, `_WALK_2`). Cycle based on horizontal speed. Spin attack = 4 fast frames.

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

**? block contents**: random at runtime — 70% coin pop, 30% mushroom. No in-editor picker. Entities (stompers, etc.) not yet placeable — deferred to Phase 8.

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
- **Phase 6 — Graphics overhaul**: Redraw all sprites (Nicky, tiles, enemies) to NES quality. Improve tile variety, add background details (clouds, hills). This is a dedicated art pass — do not mix with gameplay changes.
- **Phase 7 — Polish**: Coin counter, lives, win condition (goal post), death/respawn animation, game over screen.
- **Phase 8 — Enemies & Tail**: Stomper AI, Shellback green/red, Spikeplant, Cannonball. Tail powerup (Super→Tailed, spin attack — no flight, no P-meter). SFX.

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
- Audio autoplay: `Tone.start()` only inside a user-gesture handler (first tap)
- `localStorage` disabled in Private Browsing — detect and degrade
- Safe areas: pad controls overlay with `env(safe-area-inset-bottom)`
- Web can't truly lock orientation. Detect portrait → show "rotate to landscape" overlay

---

## 15. Working agreements (for the agent)

1. **Read this file at the start of every session.** Sessions are intentionally short — this file is what carries context.
2. **Back up before a new phase.** At the start of any session that begins a new phase, copy the current `prod/` folder into `backup/` (overwrite) before touching any files. Remind the user to do this if they haven't.
3. **No build tools.** Plain HTML+JS+CSS. ES modules are fine.
3. **No external CDN deps in core gameplay.** Audio library is the lone exception (when added) with local fallback.
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
- [ ] Phase 6 — Graphics overhaul
- [ ] Phase 7 — Polish
- [ ] Phase 8 — Enemies & Tail
```
