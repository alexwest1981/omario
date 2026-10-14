.pragma library

// Super Mario Bros style platformer core. Pure logic, no rendering: the same
// file runs under node (tests/mario.test.js) and inside QML.

var TILE = 16
var ROWS = 15
var GROUND_ROW = 13        // ground fills rows 13 and 14
var VIEW_W = 256
var VIEW_H = 240
var SOLID = "GBb?MUSP"
var BLOCKCHARS = "Bb?MU"   // tiles that can change (bumped / used / broken)
var START_LIVES = 3
var START_TIME = 400
var FLAG_TILE = 198

var T = {
  accel: 480,       // px/s^2 on the ground
  brake: 1200,      // px/s^2 when turning around
  friction: 380,
  walkMax: 95,      // px/s
  runMax: 152,
  grav: 1500,       // px/s^2, rising with jump released
  gravHold: 620,    // px/s^2, rising while jump is held (variable height)
  jumpV: 305,       // px/s initial upward speed
  maxFall: 520,
  stompBounce: 215,
  enemySpeed: 34,
  squashTime: 0.45,
  mushroomSpeed: 62,
  invuln: 1.6,
  timeRate: 2.5,    // SMB time units per second
  dt: 1 / 120,      // fixed physics substep
  deathTime: 2.2
}

// ---------------------------------------------------------------- level ------

function level1() {
  return {
    width: 212,
    // ground runs [first, last] column; the gaps between them are pits
    ground: [[0, 68], [71, 85], [89, 152], [155, 211]],
    // [column, height in tiles]
    pipes: [[28, 2], [38, 3], [46, 4], [57, 4]],
    // [column, row, tile char]  B brick, ? coin block, M mushroom block
    blocks: [
      [16, 9, "?"],
      [20, 9, "B"], [21, 9, "?"], [22, 9, "B"], [23, 9, "M"], [24, 9, "B"],
      [22, 5, "?"],
      [64, 9, "B"], [65, 9, "?"], [66, 9, "B"],
      [77, 9, "B"], [78, 9, "?"], [79, 9, "B"],
      [80, 5, "B"], [81, 5, "B"], [82, 5, "?"], [83, 5, "B"],
      [91, 5, "B"], [92, 5, "B"], [93, 5, "?"], [94, 5, "B"], [95, 5, "B"],
      [100, 9, "?"], [101, 9, "B"], [102, 9, "B"],
      [106, 9, "?"], [109, 9, "?"],
      [118, 9, "b"], [121, 9, "b"],
      [128, 5, "B"], [129, 5, "B"], [130, 5, "M"]
    ],
    // [column, height, direction] staircases of S blocks
    stairs: [[134, 4, 1], [140, 4, -1], [160, 8, 1]],
    goombas: [22, 40, 51, 52, 80, 82, 97, 98, 114, 115, 124, 125],
    // [column, row] free floating coins
    coins: [[33, 6], [34, 6], [35, 6], [72, 6], [73, 6], [74, 6], [75, 6],
            [86, 8], [87, 8], [88, 8], [136, 6], [137, 6], [138, 6]],
    flag: FLAG_TILE,
    // [column, row, art name] — drawn once, no collision
    decor: [
      [2, 11, "hillBig"], [10, 12, "bush"], [16, 12, "hill"], [30, 12, "bush"],
      [42, 11, "hillBig"], [52, 12, "bush"], [62, 12, "hill"],
      [75, 12, "bush"], [95, 11, "hillBig"], [112, 12, "bush"], [125, 12, "hill"],
      [145, 12, "bush"], [170, 12, "hill"], [178, 12, "bush"], [190, 11, "hillBig"],
      [0, 1, "cloud"], [8, 2, "cloud"], [20, 1, "cloud"], [36, 2, "cloud"],
      [50, 1, "cloud"], [68, 2, "cloud"], [84, 1, "cloud"], [104, 2, "cloud"],
      [126, 1, "cloud"], [150, 2, "cloud"], [166, 1, "cloud"], [184, 2, "cloud"],
      [202, 8, "castle"]
    ]
  }
}

function makeGrid(w) {
  var g = []
  for (var y = 0; y < ROWS; y++) {
    var row = []
    for (var x = 0; x < w; x++) row.push(" ")
    g.push(row)
  }
  return g
}

function set(g, x, y, c) {
  if (y >= 0 && y < ROWS && x >= 0 && x < g[y].length) g[y][x] = c
}

function at(g, x, y) {
  if (y < 0 || y >= ROWS || x < 0 || x >= g[0].length) return " "
  return g[y][x]
}

function solidAt(g, x, y) { return SOLID.indexOf(at(g, x, y)) >= 0 }

function build(def) {
  var g = makeGrid(def.width), i, k, x, y
  for (i = 0; i < def.ground.length; i++)
    for (x = def.ground[i][0]; x <= def.ground[i][1]; x++) {
      set(g, x, GROUND_ROW, "G")
      set(g, x, GROUND_ROW + 1, "G")
    }
  for (i = 0; i < def.pipes.length; i++) {
    var px = def.pipes[i][0], ph = def.pipes[i][1]
    for (k = 0; k < ph; k++) {
      set(g, px, GROUND_ROW - 1 - k, "P")
      set(g, px + 1, GROUND_ROW - 1 - k, "P")
    }
  }
  for (i = 0; i < def.stairs.length; i++) {
    var sx = def.stairs[i][0], sh = def.stairs[i][1], dir = def.stairs[i][2]
    for (k = 0; k < sh; k++) {
      var col = dir > 0 ? sx + k : sx + sh - 1 - k
      var height = dir > 0 ? k + 1 : sh - k
      for (var j = 0; j < height; j++) set(g, col, GROUND_ROW - 1 - j, "S")
    }
  }
  for (i = 0; i < def.blocks.length; i++)
    set(g, def.blocks[i][0], def.blocks[i][1], def.blocks[i][2])
  for (y = 4; y < GROUND_ROW; y++) set(g, def.flag, y, "F")   // flagpole, not solid
  return g
}

// Split the grid into: statics (art never changes) and blocks (bump/used/broken).
function renderLists(g, def) {
  var statics = [], blocks = [], y, x, ch
  for (y = 0; y < ROWS; y++)
    for (x = 0; x < def.width; x++) {
      ch = g[y][x]
      if (ch === " ") continue
      var rec = { x: x * TILE, y: y * TILE, ch: ch,
                  top: ch === "P" && at(g, x, y - 1) !== "P",
                  left: ch === "P" && at(g, x - 1, y) !== "P" }
      if (BLOCKCHARS.indexOf(ch) >= 0) blocks.push(rec)
      else statics.push(rec)
    }
  return { statics: statics, blocks: blocks }
}

// Top of the first solid tile in a column, for placing enemies and decor.
// Scans upward from the bottom so an enemy lands on the ground even when a
// floating block sits in the same column.
function landingY(g, x, h) {
  var y = ROWS - 1
  while (y >= 0 && !solidAt(g, x, y)) y--
  if (y < 0) return GROUND_ROW * TILE - h            // pit column: drop in
  while (y > 0 && solidAt(g, x, y - 1)) y--          // top of that stack
  return y * TILE - h
}

// ------------------------------------------------------------- entities ------

function spriteOf(type) {
  return { type: type, x: 0, y: 0, w: 14, h: 16, vx: 0, vy: 0, active: false,
           onGround: false, state: "walk", timer: 0, phase: 0, art: 0 }
}

function pool(n, type) {
  var a = []
  for (var i = 0; i < n; i++) {
    var e = spriteOf(type)
    e.slot = i
    a.push(e)
  }
  return a
}

function freeSlot(list) {
  for (var i = 0; i < list.length; i++) if (!list[i].active) return list[i]
  return null
}

function spawnEnemy(s, col) {
  var e = freeSlot(s.ents)
  if (!e) return null
  e.active = true
  e.w = 14
  e.h = 16
  e.x = col * TILE + 1
  e.y = landingY(s.grid, col, e.h)
  e.vx = -T.enemySpeed
  e.vy = 0
  e.state = "walk"
  e.timer = 0
  return e
}

function spawnCoin(s, col, row) {
  var it = freeSlot(s.items)
  if (!it) return null
  it.active = true
  it.type = "coin"
  it.w = 16
  it.h = 16
  it.x = col * TILE
  it.y = row * TILE
  it.vx = 0
  it.vy = 0
  return it
}

function spawnCoinPop(s, col, row) {
  var it = freeSlot(s.items)
  if (!it) return null
  it.active = true
  it.type = "coinpop"
  it.w = 16
  it.h = 16
  it.x = col * TILE
  it.y = row * TILE - 16
  it.vy = -150
  it.timer = 0.55
  return it
}

function spawnMushroom(s, col, row) {
  var it = freeSlot(s.items)
  if (!it) return null
  it.active = true
  it.type = "mushroom"
  it.w = 14
  it.h = 16
  it.x = col * TILE + 1
  it.y = row * TILE                       // starts inside the block it came from
  it.vx = 0
  it.vy = 0
  it.emerge = 0.45                        // seconds of sliding up before it walks
  it.onGround = false
  return it
}

// ------------------------------------------------------------ game state -----

function reset(s, keepScore) {
  var def = s.def
  s.grid = build(def)
  s.render = renderLists(s.grid, def)
  s.mario = {
    x: 3 * TILE, y: (GROUND_ROW - 1) * TILE - 16 + 16, w: 12, h: 16,
    vx: 0, vy: 0, onGround: false, facing: 1, big: false, dead: false,
    invuln: 0, anim: 0, walking: false, jumping: false
  }
  s.mario.y = GROUND_ROW * TILE - s.mario.h
  s.ents = pool(24, "goomba")
  for (var i = 0; i < def.goombas.length; i++) spawnEnemy(s, def.goombas[i])
  s.items = pool(32, "coin")
  for (var c = 0; c < def.coins.length; c++) spawnCoin(s, def.coins[c][0], def.coins[c][1])
  s.bumps = []
  s.camX = 0
  s.time = START_TIME
  s.deadTimer = 0
  s.clearTimer = 0
  s.status = "play"
  s.msg = ""
  if (!keepScore) { s.score = 0; s.coins = 0; s.lives = START_LIVES }
  s.acc = 0
}

function newGame() {
  var s = { def: level1(), tick: 0 }
  reset(s, false)
  return s
}

function restart(s) { reset(s, false) }   // R: fresh run, score cleared

// ---------------------------------------------------------------- physics ----

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function moveX(s, a, dx) {
  if (dx === 0) return false
  a.x += dx
  var hit = false
  var y0 = Math.floor(a.y / TILE), y1 = Math.floor((a.y + a.h - 1) / TILE)
  for (var y = y0; y <= y1; y++) {
    var t = Math.floor((dx > 0 ? a.x + a.w - 1 : a.x) / TILE)
    if (solidAt(s.grid, t, y)) {
      a.x = dx > 0 ? t * TILE - a.w : (t + 1) * TILE
      a.vx = 0
      hit = true
    }
  }
  return hit
}

function moveY(s, a, dy) {
  var res = { ground: false, head: null, headDist: 1e9 }
  if (dy === 0) return res
  a.y += dy
  var x0 = Math.floor(a.x / TILE), x1 = Math.floor((a.x + a.w - 1) / TILE)
  if (dy > 0) {
    // Feet are inside the row they strictly enter: at an exact boundary
    // (y+h == row top) this is the row below, which snaps the actor back to
    // rest instead of letting it bob half a pixel every other substep.
    var ty = Math.floor((a.y + a.h) / TILE)
    for (var x = x0; x <= x1; x++)
      if (solidAt(s.grid, x, ty)) {
        a.y = ty * TILE - a.h
        a.vy = 0
        res.ground = true
      }
  } else {
    var ty2 = Math.floor(a.y / TILE)
    var cx = a.x + a.w / 2
    for (var x2 = x0; x2 <= x1; x2++)
      if (solidAt(s.grid, x2, ty2)) {
        a.y = (ty2 + 1) * TILE
        a.vy = 0
        var d = Math.abs(x2 * TILE + TILE / 2 - cx)
        if (d < res.headDist) { res.head = { x: x2, y: ty2 }; res.headDist = d }
      }
  }
  return res
}

function addScore(s, n) { s.score += n }

function hurt(s) {
  var m = s.mario
  if (m.dead || m.invuln > 0) return
  if (m.big) {
    m.big = false
    m.h = 16
    m.y += 14
    m.invuln = T.invuln
    return
  }
  kill(s)
}

function kill(s) {
  var m = s.mario
  if (m.dead) return
  m.dead = true
  m.vy = -300
  m.vx = 0
  s.status = "dying"
  s.deadTimer = T.deathTime
}

function grow(s) {
  var m = s.mario
  if (m.big) return
  m.big = true
  m.h = 30
  m.y -= 14
  m.invuln = 0.6
  addScore(s, 1000)
}

function bumpBlock(s, x, y) {
  var ch = at(s.grid, x, y)
  if (ch === "?" || ch === "M") {
    set(s.grid, x, y, "U")
    if (ch === "?") { s.coins++; addScore(s, 200); spawnCoinPop(s, x, y) }
    else spawnMushroom(s, x, y)
  } else if (ch === "b") {
    // coin brick: pays a coin and becomes a used block, whatever Mario's size
    set(s.grid, x, y, "U")
    s.coins++
    addScore(s, 200)
    spawnCoinPop(s, x, y)
  } else if (ch === "B") {
    if (s.mario.big) {
      set(s.grid, x, y, " ")
      addScore(s, 50)
    }
  } else return
  s.bumps.push({ x: x, y: y, t: 0.22 })
  // enemies standing on a bumped tile are knocked out, as in SMB
  var px = x * TILE
  for (var i = 0; i < s.ents.length; i++) {
    var e = s.ents[i]
    if (e.active && e.state === "walk" && e.y + e.h <= y * TILE + 2 && e.y + e.h > y * TILE - 6 &&
        e.x + e.w > px - 4 && e.x < px + TILE + 4) {
      e.state = "squashed"
      e.timer = T.squashTime
      e.vx = 0
      addScore(s, 100)
    }
  }
}

function movedCamera(s) {
  var target = s.mario.x - 96
  if (target > s.camX) s.camX = target
  var max = s.def.width * TILE - VIEW_W
  if (s.camX > max) s.camX = max
  if (s.camX < 0) s.camX = 0
}

// ------------------------------------------------------------------ input ----

function input() { return { left: false, right: false, jump: false, run: false } }

// --------------------------------------------------------------- main step ---

function substep(s, h, in_) {
  if (s.status === "dying") {
    var d = s.mario
    d.vy += T.grav * h
    d.y += d.vy * h
    s.deadTimer -= h
    if (s.deadTimer <= 0) {
      s.lives--
      if (s.lives <= 0) { s.status = "gameover"; s.msg = "GAME OVER" }
      else reset(s, true)
    }
    return
  }
  if (s.status !== "play") return

  var m = s.mario, i, it

  // ---- mario ----
  if (!m.dead) {
    var dir = (in_.right ? 1 : 0) - (in_.left ? 1 : 0)
    var maxSpd = in_.run ? T.runMax : T.walkMax
    if (dir !== 0) {
      m.facing = dir
      if (dir * m.vx < 0) m.vx += dir * T.brake * h
      else m.vx += dir * T.accel * h
      if (Math.abs(m.vx) > maxSpd) {
        var over = Math.abs(m.vx) - maxSpd
        m.vx -= dir * Math.min(over, T.friction * 2 * h)
      }
      m.walking = true
    } else {
      m.walking = false
      var fr = T.friction * h
      if (Math.abs(m.vx) <= fr) m.vx = 0
      else m.vx -= (m.vx > 0 ? 1 : -1) * fr
    }
    if (in_.jump && m.onGround) { m.vy = -T.jumpV; m.onGround = false }
    m.jumping = !m.onGround
    m.vy += (in_.jump && m.vy < 0 ? T.gravHold : T.grav) * h
    if (m.vy > T.maxFall) m.vy = T.maxFall

    moveX(s, m, m.vx * h)
    var ry = moveY(s, m, m.vy * h)
    m.onGround = ry.ground
    if (ry.head) bumpBlock(s, ry.head.x, ry.head.y)
    if (m.y < 0) { m.y = 0; m.vy = 0 }
    if (m.invuln > 0) m.invuln -= h
    m.anim += (Math.abs(m.vx) / 60 + (m.walking ? 0.6 : 0)) * h

    if (m.y > ROWS * TILE + 8) { kill(s); return }

    // flagpole
    if (m.x + m.w >= s.def.flag * TILE) {
      addScore(s, 1000 + Math.round(s.time) * 10)
      s.status = "clear"
      s.msg = "COURSE CLEAR"
      m.vx = 0
      return
    }
  }

  // ---- enemies ----
  for (i = 0; i < s.ents.length; i++) {
    var e = s.ents[i]
    if (!e.active) continue
    if (e.state === "squashed") {
      e.timer -= h
      if (e.timer <= 0) e.active = false
      continue
    }
    e.vy += T.grav * h
    if (e.vy > T.maxFall) e.vy = T.maxFall
    var edir = e.vx
    if (moveX(s, e, e.vx * h)) e.vx = -edir
    var er = moveY(s, e, e.vy * h)
    e.onGround = er.ground
    e.phase += h
    // turn around at the level edges instead of walking off the map
    if (e.x < 0) { e.x = 0; e.vx = T.enemySpeed }
    else if (e.x > s.def.width * TILE - e.w) { e.x = s.def.width * TILE - e.w; e.vx = -T.enemySpeed }
    if (e.y > ROWS * TILE + 16) { e.active = false; continue }

    if (!m.dead && overlap(m, e)) {
      var feet = m.y + m.h
      if (m.vy > 0 && feet - e.y < 12) {
        e.state = "squashed"
        e.timer = T.squashTime
        e.vx = 0
        m.vy = -T.stompBounce
        m.onGround = false
        addScore(s, 100)
      } else hurt(s)
    }
  }

  // ---- items ----
  for (i = 0; i < s.items.length; i++) {
    it = s.items[i]
    if (!it.active) continue
    if (it.type === "coinpop") {
      it.vy += 900 * h
      it.y += it.vy * h
      it.timer -= h
      if (it.timer <= 0) { it.active = false; continue }
    } else if (it.type === "mushroom") {
      if (it.emerge > 0) {
        // slides up out of its block before it starts walking, as in SMB
        it.emerge -= h
        it.y -= TILE * h / 0.45
        if (it.emerge <= 0) it.vx = T.mushroomSpeed
      } else {
        it.vy += T.grav * h
        if (it.vy > T.maxFall) it.vy = T.maxFall
        var mdir = it.vx
        if (moveX(s, it, it.vx * h)) it.vx = -mdir
        it.onGround = moveY(s, it, it.vy * h).ground
        if (it.y > ROWS * TILE + 16) { it.active = false; continue }
      }
    }
    if (!m.dead && overlap(m, it)) {
      if (it.type === "mushroom") { it.active = false; grow(s) }
      else { it.active = false; s.coins++; addScore(s, 200) }
    }
  }

  // ---- block bump animation ----
  for (i = s.bumps.length - 1; i >= 0; i--) {
    s.bumps[i].t -= h
    if (s.bumps[i].t <= 0) s.bumps.splice(i, 1)
  }

  // ---- clock ----
  s.time -= T.timeRate * h
  if (s.time <= 0) { s.time = 0; kill(s); return }

  movedCamera(s)
}

function step(s, dt, in_) {
  if (!(dt > 0)) return
  if (s.status === "gameover" || s.status === "clear") { s.tick++; return }
  if (dt > 0.25) dt = 0.25
  s.acc += dt
  var guard = 0
  while (s.acc >= T.dt && guard++ < 64) {
    s.acc -= T.dt
    substep(s, T.dt, in_)
  }
  s.tick++
}

// ---------------------------------------------------------------- helpers ----

// Bumped tile offset in px, so the block jumps up and settles.
function bumpOffset(s, tileX, tileY) {
  for (var i = 0; i < s.bumps.length; i++) {
    var b = s.bumps[i]
    if (b.x === tileX && b.y === tileY) {
      var k = 1 - b.t / 0.22
      return -Math.round(Math.sin(k * Math.PI) * 7)
    }
  }
  return 0
}

// The five SMB glyphs, as slots (0..5) of 6 rects each, for the bar/panel HUD.
function hud(s) {
  return {
    score: s.score,
    coins: s.coins,
    lives: s.lives,
    time: Math.max(0, Math.ceil(s.time)),
    world: "1-1",
    status: s.status,
    msg: s.msg
  }
}
