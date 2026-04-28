// player.js — Nicky, the pink hero. SMB3-style physics.
import { resolveEntity } from '../physics.js?v=32';
import { drawSprite } from '../sprites.js?v=28';
import {
  PLAYER_SMALL_STAND_R, PLAYER_SMALL_WALK1_R,
  PLAYER_SMALL_WALK2_R, PLAYER_SMALL_JUMP_R,
} from '../player-sprites.js?v=28';

const PHYS = {
  gravity: 0.45, maxFall: 7.0,
  walkAccel: 0.18, runAccel: 0.30,
  walkMaxSpeed: 1.9, runMaxSpeed: 3.2,
  groundFriction: 0.16, airFriction: 0.04,
  jumpImpulse: -5.5, jumpHoldExtra: -0.28,
  maxHoldFrames: 12, jumpReleaseCutoff: 1.5,
  runJumpBonus: -1.5,
  pMeterFillRate: 0.018, pMeterDrainRate: 0.012,
  invulnAfterHit: 90,
};

const COYOTE_FRAMES = 7;
const JUMP_BUFFER_FRAMES = 8;

export function createPlayer(spawnCol, spawnRow) {
  return {
    x: spawnCol * 16, y: spawnRow * 16,
    vx: 0, vy: 0,
    w: 16, h: 16,
    state: 'small',
    onGround: false, facingRight: true,
    jumpHeld: false, jumpHoldFrames: 0, jumpJustFired: false,
    coyoteTimer: 0,
    jumpBuffer: 0,
    pMeter: 0,
    walkFrame: 0, walkTimer: 0,
    airTimer: 0,
    invulnTimer: 0,

    // world: optional callbacks { breakBrick(col,row), bumpBlock(col,row) }
    update(dt, input, levelData, world) {
      const isRunning = input.run;
      const maxSpeed  = isRunning ? PHYS.runMaxSpeed  : PHYS.walkMaxSpeed;
      const accel     = isRunning ? PHYS.runAccel     : PHYS.walkAccel;
      const friction  = this.onGround ? PHYS.groundFriction : PHYS.airFriction;

      if (input.left) {
        this.vx = Math.max(this.vx - accel * dt, -maxSpeed);
        this.facingRight = false;
      } else if (input.right) {
        this.vx = Math.min(this.vx + accel * dt, maxSpeed);
        this.facingRight = true;
      } else {
        const drag = friction * dt;
        if (Math.abs(this.vx) <= drag) this.vx = 0;
        else this.vx -= Math.sign(this.vx) * drag;
      }

      // Coast down if released run while above walk cap
      if (Math.abs(this.vx) > PHYS.walkMaxSpeed + 0.01 && !isRunning) {
        this.vx -= Math.sign(this.vx) * PHYS.groundFriction * dt * 0.5;
      }

      // P-meter
      if (isRunning && Math.abs(this.vx) >= PHYS.runMaxSpeed - 0.15)
        this.pMeter = Math.min(1, this.pMeter + PHYS.pMeterFillRate * dt);
      else
        this.pMeter = Math.max(0, this.pMeter - PHYS.pMeterDrainRate * dt);

      // Coyote time
      if (this.onGround) {
        this.coyoteTimer = COYOTE_FRAMES;
      } else {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
      }

      // Jump buffer
      if (input.jumpPressed) {
        this.jumpBuffer = JUMP_BUFFER_FRAMES;
      } else {
        this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
      }

      // Jump fire
      const canJump = this.onGround || this.coyoteTimer > 0;
      this.jumpJustFired = false;
      if (this.jumpBuffer > 0 && canJump && this.vy >= 0) {
        const bonus = Math.abs(this.vx) >= PHYS.runMaxSpeed * 0.8 ? PHYS.runJumpBonus : 0;
        this.vy = PHYS.jumpImpulse + bonus;
        this.jumpHeld = true;
        this.jumpHoldFrames = 0;
        this.jumpJustFired = true;
        this.jumpBuffer = 0;
        this.coyoteTimer = 0;
      }

      // Jump hold
      if (this.jumpHeld) {
        if (input.jump && this.jumpHoldFrames < PHYS.maxHoldFrames) {
          this.vy += PHYS.jumpHoldExtra * dt;
          this.jumpHoldFrames += dt;
        } else if (!input.jump && !this.jumpJustFired) {
          if (this.vy < -PHYS.jumpReleaseCutoff) this.vy = -PHYS.jumpReleaseCutoff;
          this.jumpHeld = false;
        }
      }

      // Gravity
      this.vy = Math.min(this.vy + PHYS.gravity * dt, PHYS.maxFall);

      // Tile collision
      resolveEntity(this, levelData);

      // Block interaction — head bump from below
      if (this.hitCeiling && world) {
        const { col, row, tileId } = this.hitCeiling;
        if (tileId === 'brick') {
          if (this.state === 'super') {
            world.breakBrick(col, row);   // Super: smash it
          } else {
            world.bumpBlock(col, row);    // Small: bonk
          }
        } else if (tileId === 'qblock') {
          world.bumpBlock(col, row);      // ? block: bump (contents wired in Phase 4b)
        }
        // hard / ground / pipe: no reaction
      }

      // World left boundary
      if (this.x < 0) { this.x = 0; this.vx = 0; }

      // Fell out of world — respawn
      if (this.y > levelData.height * 16 + 32) {
        this.x = levelData.spawn.x * 16;
        this.y = levelData.spawn.y * 16;
        this.vx = 0; this.vy = 0;
      }

      // Air timer — only show jump sprite after 4 frames off the ground
      if (this.onGround) { this.airTimer = 0; } else { this.airTimer += dt; }

      // Walk animation
      if (this.onGround && Math.abs(this.vx) > 0.1) {
        this.walkTimer += Math.abs(this.vx) * dt;
        if (this.walkTimer > 4) { this.walkFrame = 1 - this.walkFrame; this.walkTimer = 0; }
      } else { this.walkTimer = 0; }

      if (this.invulnTimer > 0) this.invulnTimer -= dt;
    },

    draw(ctx, camera) {
      if (this.invulnTimer > 0 && Math.floor(this.invulnTimer / 4) % 2 === 0) return;
      const sx = Math.round(this.x - camera.x);
      let sy = Math.round(this.y - camera.y);
      let sprite;
      if (this.airTimer > 4) {
        sprite = PLAYER_SMALL_JUMP_R;
      } else if (Math.abs(this.vx) > 0.1) {
        sprite = this.walkFrame === 0 ? PLAYER_SMALL_WALK1_R : PLAYER_SMALL_STAND_R;
        // sy -= this.walkFrame;  // 1px bob — disabled
      } else {
        sprite = PLAYER_SMALL_STAND_R;
      }
      drawSprite(ctx, sprite, sx, sy, !this.facingRight);
    },
  };
}
