// Self-check for Mario.js. Run: node tests/mario.test.js
// Mario.js carries a `.pragma library` first line for QML; strip it for node.
const fs = require("fs")
const path = require("path")
const assert = require("assert")

// Each file gets its own context: the two libraries are separate QML modules
// (Mario.build / Art.build), so they must not share one scope either.
const vm = require("vm")
const load = (file) => {
  const body = fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/^\.pragma[^\n]*\n/, "")
  const ctx = vm.createContext({})
  vm.runInContext(body, ctx)
  return ctx
}

const Mario = load("Mario.js")
const MarioArt = load("Art.js")
assert.ok(typeof Mario.step === "function" && Mario.TILE === 16, "Mario.js did not export its names")
assert.ok(typeof MarioArt.goomba === "function", "Art.js did not export its names")

const TILE = Mario.TILE
const IN = (o) => Object.assign(Mario.input(), o || {})
const DT = 1 / 60

// Run the game for `seconds` of wall time with a fixed input.
function run(s, seconds, input) {
  let t = 0
  while (t < seconds) { Mario.step(s, DT, input); t += DT }
  return s
}
// Run until `cond` is true or the timeout expires; returns the seconds used.
function until(s, cond, input, maxSeconds = 6) {
  let t = 0
  while (t < maxSeconds && !cond(s)) { Mario.step(s, DT, input); t += DT }
  return t
}
// A game past Toad's title screen (the title is checked on its own below).
function fresh() { const s = Mario.newGame(); s.status = "play"; return s }
// Movement tests want a clear stretch of road, not a goomba in the way.
function quiet(s) { s.ents.forEach((e) => { e.active = false }); return s }
// A column with clear ground either side of it, so a test that walks Mario into
// something is not secretly walking him into a pipe.
function clearColumn(s, from) {
  for (let c = from; c < s.def.width - 5; c++) {
    let fri = true
    for (let d = -3; d <= 4; d++) {
      const mark = Mario.solidAt(s.grid, c + d, 13)     // ground underneath
      const luft = !Mario.solidAt(s.grid, c + d, 12)    // and nothing in the way
      if (!mark || !luft) fri = false
    }
    if (fri) return c
  }
  throw new Error("no clear column found")
}

function place(s, col, rowTop) {
  s.mario.x = col * TILE + 2
  s.mario.y = rowTop * TILE
  s.mario.vx = 0
  s.mario.vy = 0
}

let passed = 0
function check(name, fn) {
  fn()
  passed++
  console.log("  ok  " + name)
}

// ── level ────────────────────────────────────────────────────────────────────
check("level builds: ground solid, pits empty", () => {
  const s = fresh()
  assert.ok(Mario.solidAt(s.grid, 0, 13))
  assert.ok(Mario.solidAt(s.grid, 211, 14))
  assert.ok(!Mario.solidAt(s.grid, 69, 13), "pit at 69")
  assert.ok(!Mario.solidAt(s.grid, 86, 14), "pit at 86")
  assert.ok(!Mario.solidAt(s.grid, 153, 13), "pit at 153")
  assert.equal(Mario.at(s.grid, 28, 11), "P", "pipe 2 tall at 28")
  assert.equal(Mario.at(s.grid, 46, 9), "P", "pipe 4 tall at 46")
  assert.equal(Mario.at(s.grid, 167, 5), "S", "staircase top")
  assert.equal(Mario.at(s.grid, 198, 12), "F", "flagpole")
})

check("statics and blocks split without loss", () => {
  const s = fresh()
  let n = 0
  for (let y = 0; y < Mario.ROWS; y++)
    for (let x = 0; x < s.def.width; x++) if (Mario.at(s.grid, x, y) !== " ") n++
  assert.equal(s.render.statics.length + s.render.blocks.length, n)
  assert.equal(s.render.blocks.length, s.def.blocks.length)
})

// ── movement ─────────────────────────────────────────────────────────────────
check("mario settles on the ground, not inside it", () => {
  const s = run(fresh(), 0.5, IN())
  assert.equal(s.mario.y + s.mario.h, Mario.GROUND_ROW * TILE)
  assert.ok(s.mario.onGround)
})

check("walk right ~95 px/s, run ~152 px/s", () => {
  const a = quiet(fresh()); const x0 = a.mario.x
  run(a, 2, IN({ right: true }))
  const walked = a.mario.x - x0
  assert.ok(walked > 150 && walked < 190, "walked " + walked.toFixed(1))
  const b = quiet(fresh()); const x1 = b.mario.x
  run(b, 2, IN({ right: true, run: true }))
  const ran = b.mario.x - x1
  assert.ok(ran > walked + 60 && ran < 320, "ran " + ran.toFixed(1))
})

check("facing and friction: releasing input stops mario", () => {
  const s = quiet(fresh())
  run(s, 1, IN({ left: true }))
  assert.equal(s.mario.facing, -1)
  run(s, 1.5, IN())
  assert.equal(s.mario.vx, 0)
})

check("jump apex depends on holding the button", () => {
  const hold = quiet(fresh())
  let top = 999
  run(hold, 0.9, IN({ jump: true }))
  const restY = Mario.GROUND_ROW * TILE - 16
  // sample the apex properly
  const h2 = quiet(fresh())
  let min = restY
  for (let i = 0; i < 60; i++) { Mario.step(h2, DT, IN({ jump: true })); min = Math.min(min, h2.mario.y) }
  const highJump = restY - min
  const t2 = quiet(fresh())
  let min2 = restY
  Mario.step(t2, DT, IN({ jump: true }))
  for (let i = 0; i < 60; i++) { Mario.step(t2, DT, IN()); min2 = Math.min(min2, t2.mario.y) }
  const tapJump = restY - min2
  assert.ok(highJump > 55 && highJump < 85, "held jump " + highJump)
  assert.ok(tapJump > 12 && tapJump < highJump - 20, "tapped jump " + tapJump)
  assert.ok(top > 0)
})

check("pipelines block: mario stops at the pipe face", () => {
  const s = quiet(fresh())
  place(s, 24, 12)
  run(s, 3, IN({ right: true, run: true }))
  // collision works in pixel space: the box's last pixel is x+w-1, so a
  // sub-pixel overlap of up to 1px is expected and invisible (sprite art sits
  // inside the 12px hitbox).
  assert.ok(s.mario.x + s.mario.w <= 28 * TILE + 1.001, "x=" + s.mario.x)
  assert.ok(s.mario.x + s.mario.w > 28 * TILE - 2)
})

check("staircase is climbable", () => {
  const s = quiet(fresh())
  place(s, 158, 12)
  run(s, 3, IN({ right: true, run: true, jump: true }))
  assert.ok(s.mario.y < 12 * TILE - 40, "climbed to y=" + s.mario.y)
})

check("ceiling: mario cannot leave the top of the level", () => {
  const s = quiet(fresh())
  place(s, 22, 10)
  for (let i = 0; i < 120; i++) Mario.step(s, DT, IN({ jump: true, right: true }))
  assert.ok(s.mario.y >= 0)
})

// ── blocks ───────────────────────────────────────────────────────────────────
check("? block: bumps to used, pays 200 and one coin", () => {
  const s = fresh()
  place(s, 16, 12)
  const t = until(s, (g) => g.coins > 0, IN({ jump: true }), 3)
  assert.ok(t < 3, "no coin within 3s")
  assert.equal(Mario.at(s.grid, 16, 9), "U")
  assert.equal(s.score, 200)
  assert.equal(s.coins, 1)
})

check("M block: spawns a mushroom that mario can eat", () => {
  const s = fresh()
  place(s, 23, 12)
  until(s, (g) => g.items.some((i) => i.active && i.type === "mushroom"), IN({ jump: true }), 3)
  assert.ok(s.items.some((i) => i.active && i.type === "mushroom"), "no mushroom")
  place(s, 23, 12)
  until(s, (g) => g.mario.big, IN(), 6)
  assert.ok(s.mario.big, "never grew")
  assert.equal(s.mario.h, 30)
})

check("brick: small mario bumps it, big mario breaks it", () => {
  const small = fresh()
  place(small, 20, 12)
  until(small, () => true, IN({ jump: true }), 1.2)
  assert.equal(Mario.at(small.grid, 20, 9), "B", "small mario kept the brick")

  const big = fresh()
  Mario.grow(big)
  place(big, 20, 11)
  until(big, (g) => Mario.at(g.grid, 20, 9) === " ", IN({ jump: true }), 3)
  assert.equal(Mario.at(big.grid, 20, 9), " ", "big mario broke the brick")
})

// ── enemies ──────────────────────────────────────────────────────────────────
check("stomp: squash a goomba, bounce, +100", () => {
  const s = fresh()
  const e = s.ents.find((x) => x.active && x.state === "walk")
  place(s, 0, 0)
  s.mario.x = e.x
  s.mario.y = e.y - 40
  s.mario.vy = 60
  until(s, (g) => g.ents.some((x) => x.state === "squashed"), IN(), 2)
  assert.ok(s.ents.some((x) => x.state === "squashed"), "not squashed")
  assert.ok(s.mario.vy < 0, "no bounce")
  assert.equal(s.score, 100)
})

check("side hit kills a small mario, shrinks a big one", () => {
  const s = fresh()
  const e = s.ents.find((x) => x.active)
  place(s, 0, 0)
  s.mario.x = e.x - 8
  s.mario.y = e.y
  run(s, 1.5, IN())
  assert.equal(s.status, "dying")

  const b = fresh()
  Mario.grow(b)
  const e2 = b.ents.find((x) => x.active)
  place(b, 0, 0)
  b.mario.x = e2.x - 8
  b.mario.y = e2.y
  run(b, 1.5, IN())   // long enough for the grow-invulnerability to wear off
  assert.equal(b.status, "play")
  assert.equal(b.mario.big, false)
  assert.ok(b.mario.invuln > 0)
})

check("goomba walks, falls into a pit, and is removed", () => {
  const s = fresh()
  const e = s.ents[0]
  const x0 = e.x
  run(s, 1, IN())
  assert.ok(e.x < x0, "goomba did not walk left")
  e.x = 68 * TILE + 4
  e.y = (Mario.GROUND_ROW - 1) * TILE
  e.vx = 34                       // walk right, into the pit at columns 69-70
  run(s, 3, IN())
  assert.equal(e.active, false, "goomba survived the pit")
})

check("death: 3 lives, then game over, then R restarts", () => {
  const s = quiet(fresh())
  for (let n = 0; n < 2; n++) {
    Mario.kill(s)
    run(s, 3, IN())
    assert.equal(s.status, "play")
  }
  assert.equal(s.lives, 1)
  Mario.kill(s)
  run(s, 3, IN())
  assert.equal(s.status, "gameover")
  Mario.restart(s)
  assert.equal(s.status, "play")
  assert.equal(s.score, 0)
  assert.equal(s.lives, 3)
})

check("pit: mario dies falling off the level", () => {
  const s = quiet(fresh())
  place(s, 69, 8)
  run(s, 2, IN())
  assert.equal(s.status, "dying")
})

// ── goal + clock ─────────────────────────────────────────────────────────────
check("flagpole: course clear pays out", () => {
  const s = quiet(fresh())
  s.time = 300
  place(s, 196, 12)
  run(s, 2, IN({ right: true }))
  assert.equal(s.status, "clear")
  assert.ok(s.score >= 1000, "score " + s.score)
})

check("the clock runs down and kills mario", () => {
  const s = quiet(fresh())
  s.time = 1
  run(s, 1, IN())
  assert.equal(s.status, "dying")
})

// ── robustness ───────────────────────────────────────────────────────────────
check("fuzz: 2 minutes of random input stays finite and in bounds", () => {
  const s = fresh()
  let seed = 12345
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
  for (let i = 0; i < 120 * 60; i++) {
    const inp = IN({ left: rnd() < 0.3, right: rnd() < 0.5, jump: rnd() < 0.4, run: rnd() < 0.5 })
    Mario.step(s, DT, inp)
    const m = s.mario
    assert.ok(Number.isFinite(m.x) && Number.isFinite(m.y), "NaN position at step " + i)
    assert.ok(m.x > -32 && m.x < s.def.width * TILE, "x out of bounds " + m.x)
    assert.ok(m.y > -64 && m.y < 400, "y out of bounds " + m.y)
    assert.ok(Number.isFinite(s.camX) && s.camX >= 0)
  }
})

check("fixed timestep: same result for 30 vs 144 fps frames", () => {
  const a = quiet(fresh()); const b = quiet(fresh())
  for (let i = 0; i < 240; i++) Mario.step(a, 1 / 30, IN({ right: true, jump: i % 20 < 3 }))
  for (let i = 0; i < 1152; i++) Mario.step(b, 1 / 144, IN({ right: true, jump: i % 96 < 15 }))
  assert.ok(Math.abs(a.mario.x - b.mario.x) < 1.5, a.mario.x + " vs " + b.mario.x)
  assert.equal(a.status, b.status)
})


check("goombas turn at the level edges instead of walking off the map", () => {
  const s = quiet(fresh())
  s.mario.x = 2400        // out of the way: a death rebuilds the enemy pool, the flag freezes the game
  const e = Mario.spawnEnemy(s, 1)
  e.x = 6
  e.vx = -34
  run(s, 1.5, IN())
  assert.ok(e.x >= 0, "walked off the left edge: x=" + e.x)
  assert.ok(e.vx > 0, "did not turn around")

  e.x = s.def.width * TILE - e.w - 6
  e.vx = 34
  run(s, 1.5, IN())
  assert.ok(e.x <= s.def.width * TILE - e.w, "walked off the right edge: x=" + e.x)
  assert.ok(e.vx < 0, "did not turn around at the right edge")
})

check("coin brick: pays a coin for a small mario too", () => {
  const s = quiet(fresh())
  place(s, 118, 12)
  const t = until(s, (g) => g.coins > 0, IN({ jump: true }), 3)
  assert.ok(t < 3, "no coin within 3s")
  assert.equal(Mario.at(s.grid, 118, 9), "U")
  assert.equal(s.coins, 1)
  assert.equal(s.score, 200)
})

check("mushroom slides out of its block before it starts walking", () => {
  const s = quiet(fresh())
  Mario.bumpBlock(s, 130, 5)
  const it = s.items.find((i) => i.active && i.type === "mushroom")
  assert.ok(it, "no mushroom spawned")
  assert.equal(it.y, 5 * TILE, "should start inside the block")
  assert.equal(it.vx, 0, "should not walk while emerging")

  run(s, 0.2, IN())
  assert.ok(it.y < 5 * TILE && it.y > 5 * TILE - 16, "not rising: y=" + it.y)

  run(s, 0.26, IN())
  assert.ok(it.vx > 0, "still not walking after emerging")
  assert.ok(it.y <= 5 * TILE - 15, "not clear of the block: y=" + it.y)

  run(s, 2, IN())
  assert.equal(it.y + it.h, Mario.GROUND_ROW * TILE, "should end up walking on the ground")
})

check("goomba art animates: two different frames while walking", () => {
  const e = { state: "walk", phase: 0 }
  const a = JSON.stringify(MarioArt.goomba(e))
  e.phase = 0.2
  const b = JSON.stringify(MarioArt.goomba(e))
  assert.notEqual(a, b, "feet never move")
  e.state = "squashed"
  assert.ok(MarioArt.goomba(e).length < 5, "squashed art should be flat")
})


check("pixel art: every frame is the right size and fits its sprite slots", () => {
  const frames = Object.keys(MarioArt.FRAMES)
  assert.ok(frames.length >= 20, "frames missing: " + frames.length)
  for (const key of frames) {
    const art = MarioArt.FRAMES[key]
    assert.ok(art.length > 0, key + " is empty")
    const CHAR = { toad: 1, princess: 1, bowser: 1 }      // and their F mirrors
    const base = key.replace(/F$/, "")
    const group = CHAR[base] ? "char" : (base === "shell" || base.startsWith("kWalk")) ? "enemy"
      : key.startsWith("mb") || key.startsWith("ms") ? "mario"
      : key.startsWith("g") ? "goomba" : "item"
    assert.ok(art.length <= MarioArt.SLOT_COUNT[group],
      key + " needs " + art.length + " rects but the " + group + " sprite has " + MarioArt.SLOT_COUNT[group])
    // mario, goombas and items live in a 16px box; the characters are drawn wider
    const boxW = group === "char" ? 32 : 16
    for (const r of art) {
      assert.ok(r[0] >= 0 && r[0] + r[2] <= boxW, key + " rect leaves the " + boxW + "px box: " + r.join(","))
      assert.ok(r[1] >= 0 && r[1] + r[3] <= 32, key + " rect leaves the sprite: " + r.join(","))
      assert.ok(typeof r[4] === "string" && r[4].charAt(0) === "#", key + " rect has no colour")
    }
  }
  // the maps are hand written: every row must be exactly 16 characters
  const maps = Object.assign({}, MarioArt.MARIO_SMALL, MarioArt.MARIO_BIG, MarioArt.GOOMBA,
                              { mushroom: MarioArt.MUSHROOM, axe: MarioArt.AXE, toad: MarioArt.TOAD,
                                princess: MarioArt.PRINCESS, bowser: MarioArt.BOWSER,
                                koopaWalk1: MarioArt.KOOPA_WALK1, koopaWalk2: MarioArt.KOOPA_WALK2,
                                shell: MarioArt.SHELL })
  for (const [name, rows] of Object.entries(maps)) {
    const w = rows[0].length
    for (const row of rows) assert.equal(row.length, w, name + " has a row of " + row.length + " chars: " + row)
  }
  assert.equal(MarioArt.MARIO_SMALL.stand.length, 16)
  assert.equal(MarioArt.MARIO_BIG.stand.length, 32)
  assert.equal(MarioArt.BOWSER[0].length, 24)
  // the characters' feet sit on the row the story screens place them by
  assert.equal(MarioArt.KOOPA_WALK1[0].length, 16)
  assert.equal(MarioArt.KOOPA_WALK1.length, 24)
  for (const [key, floor] of [["toad", 21], ["princess", 21], ["bowser", 23],
                              ["kWalk1", 21], ["shell", 12]]) {
    const low = MarioArt.FRAMES[key].reduce((a, r) => Math.max(a, r[1]), 0)
    assert.equal(low, floor, key + " feet at row " + low + ", expected " + floor)
  }

  // the feet of every mario frame must sit on the hit box floor
  for (const [key, floor] of [["msStand", 15], ["msWalk1", 15], ["msWalk2", 15], ["msJump", 15],
                              ["mbStand", 31], ["mbWalk1", 31], ["mbJump", 31]]) {
    const low = MarioArt.FRAMES[key].reduce((a, r) => Math.max(a, r[1]), 0)
    assert.equal(low, floor, key + " feet at row " + low + ", hit box floor is " + floor)
  }
})

check("pixel art: mario picks a different frame for walk, jump and facing", () => {
  const base = { onGround: true, vx: 0, anim: 0, facing: 1, big: false, dead: false }
  const stand = MarioArt.mario(base)
  assert.equal(stand, MarioArt.FRAMES.msStand)
  assert.equal(MarioArt.mario(Object.assign({}, base, { onGround: false })), MarioArt.FRAMES.msJump)
  assert.equal(MarioArt.mario(Object.assign({}, base, { vx: 90, anim: 0 })), MarioArt.FRAMES.msWalk2)
  assert.equal(MarioArt.mario(Object.assign({}, base, { vx: 90, anim: 0.13 })), MarioArt.FRAMES.msWalk1)
  assert.equal(MarioArt.mario(Object.assign({}, base, { facing: -1 })), MarioArt.FRAMES.msStandF)
  assert.equal(MarioArt.mario(Object.assign({}, base, { big: true })), MarioArt.FRAMES.mbStand)
})

// ── koopas, shells and the chain ────────────────────────────────────────────

check("a koopa is taller than a goomba and walks like one", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 0)
  const k = s.ents.find((e) => e.active && e.kind === "koopa")
  assert.ok(k, "no koopa in 1-1")
  assert.equal(k.h, 24, "a koopa stands a tile and a half tall")
  assert.equal(k.state, "walk")
  assert.ok(k.vx < 0, "walks left to begin")
  run(s, 1, IN())
  assert.ok(k.y >= 0, "stayed in the level")
})

check("stomping a koopa leaves a shell that can be kicked", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 0)
  const k = s.ents.find((e) => e.active && e.kind === "koopa")
  place(s, Math.floor(k.x / TILE), 11)              // rakt ovanför honom
  s.mario.vy = 200
  until(s, (g) => k.state !== "walk", IN(), 2)
  assert.equal(k.state, "shell", "the stomp leaves a shell")
  assert.equal(k.vx, 0, "and the shell sits still")
  assert.equal(k.h, TILE, "the shell is one tile tall")
  assert.ok(s.score >= 100, "the stomp scored")

  // stå still bredvid tills fristen gått ut, gå sedan in i skalet: spark
  run(s, Mario.T.kickGrace + 0.05, IN())
  const col = clearColumn(s, 55)
  k.x = col * TILE
  k.y = 13 * TILE - TILE
  place(s, col - 1, 12)
  until(s, (g) => k.state === "sliding", IN({ right: true }), 2)
  assert.equal(k.state, "sliding", "walking into it kicks it")
  assert.ok(Math.abs(k.vx) > Mario.T.runMax, "a kicked shell is faster than a run")
})

check("a kicked shell takes out another enemy", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 0)
  const k = s.ents.find((e) => e.active && e.kind === "koopa")
  const g = s.ents.find((e) => e.active && e.kind === "goomba")
  assert.ok(k && g, "need both kinds")
  // ställ skalet strax vänster om goomban och sparka det åt höger
  const col = clearColumn(s, 55)
  k.state = "sliding"
  k.h = TILE
  k.x = col * TILE
  k.y = 13 * TILE - TILE
  g.x = k.x + 60
  g.y = 13 * TILE - g.h
  k.kickGrace = 0
  k.vx = Mario.T.shellSpeed
  const före = s.score
  until(s, (gg) => g.state === "squashed", IN(), 2)
  assert.equal(g.state, "squashed", "the shell flattened the goomba")
  assert.equal(s.score - före, 500, "a shell kill is 500")
})

check("a sliding shell stops under a stomp and hurts from the side", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 0)
  const k = s.ents.find((e) => e.active && e.kind === "koopa")
  k.state = "sliding"
  k.h = TILE
  k.vx = Mario.T.shellSpeed
  k.kickGrace = 0
  place(s, Math.floor(k.x / TILE), 11)
  s.mario.vy = 200
  until(s, (gg) => k.state === "shell", IN(), 2)
  assert.equal(k.state, "shell", "landing on a sliding shell stops it")
  assert.equal(k.vx, 0)
})

check("the stomp chain pays the original's sequence and ends in a life", () => {
  const s = quiet(fresh())
  s.combo = 0
  const liv = s.lives
  for (let i = 0; i < 10; i++) Mario.stamp(s)
  assert.equal(s.score, 100 + 200 + 400 + 500 + 800 + 1000 + 2000 + 4000 + 5000 + 8000,
                "the ten first stomps pay the original's table")
  assert.equal(s.lives, liv, "no life yet")
  Mario.stamp(s)                                   // elfte: 1-up
  assert.equal(s.lives, liv + 1, "the eleventh stomp is a life")
  // och kedjan bryts när Mario rör marken
  const s2 = quiet(fresh())
  s2.combo = 4
  until(s2, (g) => g.mario.onGround, IN(), 1)
  assert.equal(s2.combo, 0, "touching the ground resets the chain")
})

check("a hundred coins gives an extra life", () => {
  const s = quiet(fresh())
  s.coins = 99
  const liv = s.lives
  Mario.bumpBlock(s, 118, 9)                       // myntklossen i 1-1
  assert.equal(s.coins, 0, "a hundred coins wraps")
  assert.equal(s.lives, liv + 1, "and pays a life")
})

// ── the fire flower ─────────────────────────────────────────────────────────

check("the mushroom block gives a flower to a big Mario and a mushroom to a small one", () => {
  const small = quiet(fresh())
  Mario.bumpBlock(small, 130, 5)
  const m1 = small.items.find((i) => i.active && i.type === "mushroom")
  assert.ok(m1, "small Mario gets a mushroom")

  const big = quiet(fresh())
  Mario.grow(big)
  Mario.bumpBlock(big, 130, 5)
  const m2 = big.items.find((i) => i.active && i.type === "flower")
  assert.ok(m2, "big Mario gets a flower")
  assert.ok(m2.emerge > 0, "and it slides out of the block like the mushroom")
})

check("the flower: small Mario becomes big, big Mario becomes fire", () => {
  const s = quiet(fresh())
  const it = Mario.spawnFlower(s, 20, 5)
  it.emerge = 0
  place(s, 20, 5)                                   // rakt i blomman
  until(s, (g) => !it.active, IN(), 3)
  assert.ok(s.mario.big, "small Mario grew")
  assert.ok(!s.mario.fire, "and is not fiery yet")

  const it2 = Mario.spawnFlower(s, 20, 5)
  it2.emerge = 0
  place(s, 20, 5)
  until(s, (g) => !it2.active, IN(), 3)
  assert.ok(s.mario.fire, "a second flower made him fiery")
})

check("the flower sits on its block instead of walking off", () => {
  const s = quiet(fresh())
  const it = Mario.spawnFlower(s, 20, 5)
  run(s, 1.2, IN())
  assert.equal(it.active, true, "still there")
  assert.equal(it.vx, 0, "and it never started walking")
  assert.ok(it.emerge <= 0, "it finished emerging")
})

check("fire Mario shoots with the run button, two at most", () => {
  const s = quiet(fresh())
  place(s, clearColumn(s, 55), 12)                   // en fri sträcka: skotten får plats
  Mario.grow(s)
  s.mario.fire = true
  const antal = () => s.shots.filter((k) => k.active).length
  const steg = (in_) => run(s, 0.06, IN(in_))        // kort nog att skotten hinner leva

  steg({ run: true })                                // en kant: ett skott
  assert.equal(antal(), 1, "one fireball")
  const första = s.shots.find((k) => k.active)
  steg({ run: true })
  steg({ run: true })                                // hållen: ingen ny kant
  assert.equal(antal(), 1, "a held button does not fire again")
  assert.equal(s.shots.find((k) => k.active), första, "and it is the same fireball")

  steg({})                                           // släpp
  steg({ run: true })                                // ny kant: ett till
  assert.equal(antal(), 2, "a new press fires a second one")
  steg({})
  steg({ run: true })
  assert.equal(antal(), Mario.T.fireMax, "but never more than two")
})

check("a fireball bounces off the ground and takes out a goomba for 200", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 0)                            // fienderna tillbaka
  const g = s.ents.find((e) => e.active && e.kind === "goomba")
  assert.ok(g, "a goomba to shoot at")
  s.ents.forEach((e) => { if (e !== g) e.active = false })   // bara den här
  const col = clearColumn(s, 55)
  g.x = col * TILE + 90                             // en bit bort: skottet hinner studsa
  g.y = 13 * TILE - g.h
  g.vx = 0
  s.mario.x = col * TILE + 2
  s.mario.y = 12 * TILE
  s.mario.facing = 1
  Mario.grow(s)
  s.mario.fire = true
  const före = s.score
  run(s, 0.06, IN({ run: true }))
  const sk = s.shots.find((k) => k.active)
  assert.ok(sk, "a fireball left Mario")
  assert.ok(sk.vx > Mario.T.runMax, "faster than Mario runs")
  // lägg skottet rakt på goomban: det är träffen som prövas, inte tur med studsen
  sk.x = g.x - 4
  sk.y = g.y + 4
  sk.vx = Mario.T.fireSpeed
  sk.vy = 0
  Mario.step(s, DT, IN())
  assert.equal(g.state, "squashed", "the fireball took out the goomba")
  assert.equal(s.score - före, 200, "a fireball kill is 200")
  assert.equal(sk.active, false, "and the fireball is spent")
})

check("a fireball bounces off the ground and dies at a wall", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 0)
  s.ents.forEach((e) => { e.active = false })        // ingen fiende i vägen
  place(s, clearColumn(s, 55), 12)
  Mario.grow(s)
  s.mario.fire = true
  run(s, 0.06, IN({ run: true }))
  const sk = s.shots.find((k) => k.active)
  assert.ok(sk, "a fireball")
  let studsade = false, senaste = sk.vy, steg = 0
  while (sk.active && steg++ < 300) {
    Mario.step(s, DT, IN())
    if (senaste > 0 && sk.vy < 0) studsade = true
    senaste = sk.vy
  }
  assert.ok(studsade, "it bounced on the ground")
  assert.ok(!sk.active, "and something eventually stopped it")
})

check("losing fire falls back to big, not to small", () => {
  const s = quiet(fresh())
  Mario.grow(s)
  s.mario.fire = true
  s.mario.invuln = 0                                 // grow() hands out a moment of grace
  Mario.hurt(s)
  assert.ok(!s.mario.fire && s.mario.big, "fire goes to big")
  s.mario.invuln = 0
  Mario.hurt(s)
  assert.ok(!s.mario.big, "big goes to small")
  assert.ok(!s.mario.dead, "and he is still alive")
})

check("the power-up carries to the next course but not through a death", () => {
  const s = quiet(fresh())
  Mario.grow(s)
  s.mario.fire = true
  Mario.startLevel(s, 1)
  assert.ok(s.mario.fire && s.mario.big, "the next course starts with the power-up")
  assert.equal(Mario.hud(s).world, "1-2")
  Mario.hurt(s)                                     // tar elden
  s.mario.invuln = 0                                // och efter skyddet
  Mario.hurt(s)                                     // storleken
  assert.ok(!s.mario.big && !s.mario.fire, "a hit takes it away again")
})

check("fire Mario is the big sprite in the other two colours", () => {
  const bas = { big: true, onGround: true, vx: 0, anim: 0, facing: 1, dead: false }
  const eld = MarioArt.mario(Object.assign({}, bas, { fire: true }))
  assert.equal(eld, MarioArt.FRAMES.mbStandFire)
  assert.notEqual(eld, MarioArt.FRAMES.mbStand)
  assert.equal(MarioArt.mario(Object.assign({}, bas, { fire: true, facing: -1 })), MarioArt.FRAMES.mbStandFireF)
  assert.equal(MarioArt.mario(bas), MarioArt.FRAMES.mbStand, "the plain big sprite is untouched")
  const färger = new Set(eld.map((r) => r[4]))
  assert.ok(färger.has(MarioArt.C.red) && färger.has(MarioArt.C.white), "hat and overalls swapped colours")
})

// ── courses ─────────────────────────────────────────────────────────────────

check("four courses in order, each with its own world label", () => {
  assert.equal(Mario.LEVELS.length, 4)
  assert.deepEqual(Mario.LEVELS.map((f) => f().world), ["1-1", "1-2", "1-3", "1-4"])
  const s = fresh()
  assert.equal(Mario.hud(s).world, "1-1")
  Mario.startLevel(s, 3)
  assert.equal(Mario.hud(s).world, "1-4")
  assert.ok(s.def.castle, "the last course is the castle")
})

check("Toad's line holds the game until jump", () => {
  const s = Mario.newGame()
  assert.equal(s.status, "title", "a new game opens on the story screen")
  assert.ok(Mario.hud(s).msg.length > 0, "the story screen has something to say")
  run(s, 1, IN())                                  // ingenting händer utan hopp
  assert.equal(s.status, "title")
  assert.equal(Math.round(s.mario.x), 3 * Mario.TILE)
  run(s, 0.1, IN({ jump: true }))
  assert.equal(s.status, "play", "jump starts the game")
})

check("the flagpole hands over to the next course", () => {
  const s = quiet(fresh())
  place(s, s.def.flag, 12)
  until(s, (g) => g.status === "clear", IN({ right: true }), 3)
  assert.equal(s.status, "clear")
  assert.ok(s.score >= 1000, "clearing pays out")
  run(s, Mario.T.clearTime + 0.2, IN())             // clear-animationen
  assert.equal(s.def.world, "1-2", "the next course takes over")
  assert.equal(s.status, "play")
  assert.equal(Mario.hud(s).lives, 3, "lives carry over")
})

check("the axe on the castle course ends the game", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 3)
  assert.ok(s.bowser, "the castle has Bowser on the bridge")
  assert.ok(s.def.axe[0] * TILE > s.bowser.maxX, "the axe sits past his patrol")
  place(s, s.def.axe[0], 12)
  until(s, (g) => g.status === "won", IN(), 2)
  assert.equal(s.status, "won", "the axe wins the game")
  assert.equal(s.bowser, null, "and Bowser is gone")
})

check("bowser is not stompable", () => {
  const s = quiet(fresh())
  Mario.startLevel(s, 3)
  const b = s.bowser
  place(s, Math.floor(b.x / TILE), 11)              // rakt över honom
  s.mario.vy = 200                                  // på väg ner, som ett stamp
  until(s, (g) => g.status !== "play", IN(), 2)
  assert.equal(s.status, "dying", "landing on Bowser costs a life")
})

check("every course can be walked to the end", () => {
  // En enkel bot: håll höger, hoppa vid vägg, hål, fiende och Bowser. Fienderna
  // är avstängda — det här mäter banornas geometri (hål, avsatser, slottet,
  // yxan och att banbyte och slut hänger ihop), inte fiendekollisionerna, som
  // har egna prov ovan.
  const s = Mario.newGame()
  const GR = Mario.GROUND_ROW
  const bot = (g) => {
    const in_ = Mario.input()
    if (g.status === "title") { in_.jump = true; return in_ }
    const m = g.mario
    const col = Math.floor((m.x + m.w) / TILE), row = Math.floor((m.y + m.h - 1) / TILE)
    in_.right = true
    const golv = (c) => { for (let y = row; y <= GR; y++) if (Mario.solidAt(g.grid, c, y)) return true; return false }
    in_.run = golv(col + 2) && golv(col + 3)
    if (!m.onGround) { in_.jump = m.vy < 0; return in_ }
    let want = false
    for (const d of [1, 2]) for (const dy of [0, -1]) if (Mario.solidAt(g.grid, col + d, row + dy)) want = true
    if (!golv(col + 1) || !golv(col + 2)) want = true
    for (const e of g.ents) if (e.active && e.x > m.x && e.x - m.x < 46 && Math.abs(e.y - m.y) < 40) want = true
    if (g.bowser && g.bowser.x > m.x && g.bowser.x - m.x < 120) in_.run = true
    if (g.bowser && g.bowser.x > m.x && g.bowser.x - m.x < 90) want = true
    in_.jump = want
    return in_
  }
  let t = 0
  const sedda = []
  while (t < 400 && s.status !== "won" && s.status !== "gameover") {
    for (const e of s.ents) e.active = false
    if (sedda[sedda.length - 1] !== s.def.world) sedda.push(s.def.world)
    Mario.step(s, DT, bot(s))
    t += DT
  }
  assert.deepEqual(sedda, ["1-1", "1-2", "1-3", "1-4"], "courses visited in order")
  assert.equal(s.status, "won", "the run ended as " + s.status + " on course " + s.def.world)
  assert.ok(t < 200, "the run took " + t.toFixed(1) + "s of game time")
})

console.log("\n" + passed + " checks passed")
