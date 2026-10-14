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

// Toad's two lines, as in the original: the story before the first course and
// the ending after the last one.
var TITLE_MSG = "THE PRINCESS IS IN ANOTHER CASTLE!"
var WON_MSG = "THANK YOU MARIO!"

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
  fireSpeed: 260,   // px/s: a fireball leaves faster than Mario runs
  fireBounce: 260,  // px/s upward when a fireball touches the ground
  fireMax: 2,       // fireballs in flight at once, as in the original
  fireLife: 2.0,    // seconds before one gives up
  shellSpeed: 190,  // px/s: a kicked koopa shell, faster than Mario at a run
  shellH: 16,       // a shell is shorter than the koopa standing up
  kickGrace: 0.2,   // seconds after a stomp when the shell cannot be kicked
  squashTime: 0.45,
  mushroomSpeed: 62,
  invuln: 1.6,
  clearTime: 3.0,        // flagpole animation before the next course
  timeRate: 2.5,    // SMB time units per second
  dt: 1 / 120,      // fixed physics substep
  deathTime: 2.2
}

// ---------------------------------------------------------------- level ------

function level1() {
  return {
    world: "1-1",
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
    goombas: [22, 40, 51, 52, 80, 82, 97, 98, 114, 115, 129, 130, 148, 149, 170, 171],
    koopas: [30, 60, 105, 130],
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

// --------------------------------------------------------------- worlds ------
// Four courses in the spirit of world 1: 1-1 is the original, 1-2 is a pipe
// maze with corridors of bricks, 1-3 is the athletic one (floating platforms,
// little ground) and 1-4 is the castle: a bridge over lava, Bowser on it, and
// the axe beyond him. Same vocabulary as level1() — a course is data, and the
// numbering comes from the list at the bottom, not from the function names.

function level2() {
  return {
    world: "1-2",
    width: 196,
    ground: [[0, 30], [33, 58], [61, 96], [99, 140], [143, 195]],
    pipes: [[12, 2], [24, 3], [40, 2], [52, 4], [68, 3], [80, 2], [104, 3], [126, 4], [150, 2], [170, 3]],
    blocks: [
      [6, 9, "?"],
      [16, 9, "B"], [17, 9, "?"], [18, 9, "B"],
      [16, 5, "B"], [17, 5, "B"], [18, 5, "M"], [19, 5, "B"],
      [44, 9, "?"], [45, 9, "B"], [46, 9, "?"],
      [44, 5, "B"], [45, 5, "b"], [46, 5, "B"],
      [72, 9, "B"], [73, 9, "?"], [74, 9, "B"], [75, 9, "?"], [76, 9, "B"],
      [72, 5, "?"],
      [90, 9, "b"], [91, 9, "b"],
      [108, 5, "B"], [109, 5, "?"], [110, 5, "B"],
      [118, 9, "?"], [119, 9, "B"], [120, 9, "M"],
      [132, 5, "B"], [133, 5, "?"], [134, 5, "B"],
      [156, 9, "?"], [157, 9, "B"], [158, 9, "?"], [159, 9, "B"],
      [176, 9, "b"], [177, 9, "b"]
    ],
    stairs: [[26, 3, -1], [86, 4, 1], [180, 5, 1]],
    goombas: [8, 20, 21, 36, 47, 48, 62, 63, 88, 92, 106, 122, 123, 136, 137, 146, 162, 163, 186],
    koopas: [20, 50, 78, 120, 160],
    coins: [[4, 6], [5, 6], [34, 8], [35, 8], [36, 8], [50, 6], [66, 6], [67, 6],
            [84, 6], [85, 6], [102, 8], [103, 8], [116, 6], [117, 6], [130, 6],
            [144, 8], [145, 8], [168, 6], [169, 6], [184, 6], [185, 6]],
    flag: 190,
    decor: [
      [2, 12, "bush"], [18, 12, "hill"], [36, 12, "bush"], [56, 11, "hillBig"],
      [78, 12, "bush"], [94, 12, "hill"], [112, 12, "bush"], [128, 11, "hillBig"],
      [148, 12, "bush"], [166, 12, "hill"], [182, 12, "bush"],
      [6, 1, "cloud"], [22, 2, "cloud"], [42, 1, "cloud"], [64, 2, "cloud"],
      [86, 1, "cloud"], [108, 2, "cloud"], [130, 1, "cloud"], [152, 2, "cloud"],
      [174, 1, "cloud"],
      [188, 9, "castle"]
    ]
  }
}

function level3() {
  // The athletic one: ground islands with gaps between them, brick platforms
  // over and beside the gaps for the coins. Every platform is within one jump
  // of the last — the bot in tests/mario.test.js walks it on every run, so a
  // course that cannot be finished fails the suite.
  return {
    world: "1-3",
    width: 178,
    ground: [[0, 24], [28, 36], [40, 48], [52, 60], [64, 72], [76, 86], [92, 100],
             [104, 112], [116, 124], [128, 136], [140, 148], [152, 164], [170, 177]],
    pipes: [[8, 2], [14, 3], [144, 2]],
    blocks: [
      [6, 9, "?"],
      [18, 9, "B"], [19, 9, "?"], [20, 9, "B"],
      [25, 10, "B"], [26, 10, "B"], [27, 10, "B"],
      [37, 10, "B"], [38, 10, "?"], [39, 10, "B"],
      [44, 8, "B"], [45, 8, "M"],
      [50, 10, "B"], [51, 10, "B"],
      [56, 6, "?"], [57, 6, "B"],
      [62, 10, "B"], [63, 10, "B"],
      [68, 6, "B"], [69, 6, "?"], [70, 6, "B"],
      [73, 10, "B"], [74, 10, "B"], [75, 10, "B"],
      [80, 9, "?"], [81, 9, "B"], [82, 9, "?"],
      [88, 10, "B"], [89, 10, "B"], [90, 10, "B"], [91, 10, "B"],
      [96, 6, "B"], [97, 6, "M"], [98, 6, "B"],
      [102, 10, "B"], [103, 10, "B"],
      [108, 9, "?"], [109, 9, "B"],
      [114, 10, "B"], [115, 10, "B"],
      [120, 8, "B"], [121, 8, "?"], [122, 8, "B"],
      [126, 10, "B"], [127, 10, "B"],
      [132, 6, "B"], [133, 6, "?"], [134, 6, "B"],
      [137, 10, "B"], [138, 10, "B"], [139, 10, "B"],
      [153, 9, "?"], [154, 9, "B"], [155, 9, "?"],
      [160, 10, "B"], [161, 10, "B"], [162, 10, "B"],
      [166, 9, "B"], [167, 9, "?"]
    ],
    stairs: [[10, 3, 1], [30, 3, -1], [168, 4, 1]],
    goombas: [20, 31, 44, 57, 68, 81, 96, 109, 121, 133, 146, 158, 174],
    koopas: [30, 44, 70, 84, 132, 160],
    coins: [[4, 6], [5, 6], [16, 6], [22, 5], [23, 5], [35, 7], [46, 6], [47, 6],
            [58, 7], [59, 7], [70, 7], [71, 7], [83, 7], [84, 7], [94, 5], [95, 5],
            [106, 7], [107, 7], [118, 6], [119, 6], [130, 5], [131, 5], [142, 6],
            [143, 6], [150, 7], [151, 7], [157, 6], [158, 6], [164, 7], [165, 7]],
    flag: 172,
    decor: [
      [4, 12, "hill"], [16, 12, "bush"], [42, 12, "hillBig"], [66, 12, "bush"],
      [96, 12, "hill"], [120, 12, "bush"], [142, 12, "hillBig"], [160, 12, "bush"],
      [2, 1, "cloud"], [14, 2, "cloud"], [28, 1, "cloud"], [44, 2, "cloud"],
      [58, 1, "cloud"], [74, 2, "cloud"], [88, 1, "cloud"], [104, 2, "cloud"],
      [118, 1, "cloud"], [134, 2, "cloud"], [148, 1, "cloud"], [164, 2, "cloud"],
      [170, 9, "castle"]
    ]
  }
}

function level4() {
  // The castle. The floor is broken into a bridge over lava (the lava is drawn
  // as decor at ground level and the gaps are pits, exactly like the outdoor
  // courses), Bowser walks the far end of it and the axe sits past him on the
  // last pillar. Touching the axe ends the game.
  return {
    world: "1-4",
    castle: true,
    width: 168,
    ground: [[0, 26], [30, 42], [46, 58], [62, 74], [78, 90], [94, 106], [110, 122], [126, 138], [142, 167]],
    pipes: [[10, 3], [18, 2]],
    blocks: [
      [6, 9, "?"],
      [14, 9, "B"], [15, 9, "?"], [16, 9, "B"],
      [34, 9, "B"], [35, 9, "?"], [36, 9, "B"], [37, 9, "M"], [38, 9, "B"],
      [34, 5, "B"], [35, 5, "B"],
      [50, 9, "?"], [51, 9, "B"],
      [66, 5, "B"], [67, 5, "?"], [68, 5, "B"],
      [82, 9, "b"], [83, 9, "b"],
      [98, 9, "?"], [99, 9, "B"], [100, 9, "?"],
      [114, 5, "B"], [115, 5, "B"], [116, 5, "?"],
      [130, 9, "?"], [131, 9, "B"]
    ],
    stairs: [[22, 3, 1], [88, 3, -1], [118, 4, 1]],
    goombas: [8, 16, 36, 44, 52, 60, 68, 70, 84, 86, 100, 108, 116, 124, 132, 134],
    koopas: [8, 36, 70, 96, 130],
    coins: [[12, 6], [13, 6], [24, 5], [25, 5], [32, 6], [33, 6], [48, 6],
            [56, 6], [57, 6], [72, 6], [80, 6], [92, 6], [96, 6], [104, 6],
            [112, 6], [120, 6], [128, 6], [136, 6], [140, 6], [146, 6]],
    // Bowser patrols the last stretch of the bridge; the axe is past him.
    bowser: [156, 12],
    axe: [161, 12],
    flag: 164,
    decor: [
      [2, 11, "pillar"], [20, 11, "pillar"], [44, 11, "pillar"], [60, 11, "pillar"],
      [76, 11, "pillar"], [92, 11, "pillar"], [108, 11, "pillar"], [124, 11, "pillar"],
      [140, 11, "pillar"], [150, 11, "pillar"],
      // lava at the ground rows, in every gap: no collision, the fall does it
      [27, 13, "lava"], [28, 13, "lava"], [29, 13, "lava"],
      [43, 13, "lava"], [44, 13, "lava"], [45, 13, "lava"],
      [59, 13, "lava"], [60, 13, "lava"], [61, 13, "lava"],
      [75, 13, "lava"], [76, 13, "lava"], [77, 13, "lava"],
      [91, 13, "lava"], [92, 13, "lava"], [93, 13, "lava"],
      [107, 13, "lava"], [108, 13, "lava"], [109, 13, "lava"],
      [123, 13, "lava"], [124, 13, "lava"], [125, 13, "lava"],
      [139, 13, "lava"], [140, 13, "lava"], [141, 13, "lava"]
    ]
  }
}

// The courses, in the order they are played. Everything else reads this list,
// so adding a fifth course is one entry and one function.
var LEVELS = [level1, level2, level3, level4]

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

function spawnEnemy(s, col, kind) {
  var e = freeSlot(s.ents)
  if (!e) return null
  e.active = true
  e.kind = kind || "goomba"
  e.w = e.kind === "koopa" ? 13 : 14
  e.h = e.kind === "koopa" ? 24 : 16     // a koopa is a tile and a half tall
  e.x = col * TILE + 1
  e.y = landingY(s.grid, col, e.h)
  e.vx = -T.enemySpeed
  e.vy = 0
  e.state = "walk"
  e.timer = 0
  e.kickGrace = 0
  return e
}

function spawnCoin(s, col, row, type) {
  var it = freeSlot(s.items)
  if (!it) return null
  it.active = true
  it.type = type || "coin"
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

function spawnFlower(s, col, row) {
  var it = freeSlot(s.items)
  if (!it) return null
  it.active = true
  it.type = "flower"
  it.w = 16
  it.h = 16
  it.x = col * TILE
  it.y = row * TILE
  it.vx = 0
  it.vy = 0
  it.emerge = 0.45
  it.onGround = false
  return it
}

// One fireball, if fewer than two are already in the air. It leaves in the
// direction Mario faces, a little faster than he can run.
function spawnShot(s) {
  var m = s.mario
  var ute = 0
  for (var i = 0; i < s.shots.length; i++) if (s.shots[i].active) ute++
  if (ute >= T.fireMax) return null
  var it = freeSlot(s.shots)
  if (!it) return null
  it.active = true
  it.w = 8
  it.h = 8
  it.x = m.facing > 0 ? m.x + m.w : m.x - 8
  it.y = m.y + (m.big ? 10 : 4)
  it.vx = (m.facing > 0 ? 1 : -1) * T.fireSpeed + m.vx / 2
  it.vy = 0
  it.timer = T.fireLife
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
    vx: 0, vy: 0, onGround: false, facing: 1, big: false, fire: false, dead: false,
    invuln: 0, anim: 0, walking: false, jumping: false
  }
  s.mario.y = GROUND_ROW * TILE - s.mario.h
  s.ents = pool(24, "goomba")
  for (var i = 0; i < def.goombas.length; i++) spawnEnemy(s, def.goombas[i])
  var koopas = def.koopas || []
  for (var k = 0; k < koopas.length; k++) spawnEnemy(s, koopas[k], "koopa")
  s.combo = 0
  s.shots = pool(4, "shot")
  s.shotHeld = false
  s.items = pool(32, "coin")
  for (var c = 0; c < def.coins.length; c++) spawnCoin(s, def.coins[c][0], def.coins[c][1])
  // Bowser belongs to the castle course; he patrols a short stretch of the
  // bridge and is never stompable, exactly like the original. The axe past him
  // is an ordinary item with its own type — touching it ends the game.
  s.bowser = null
  if (def.bowser) {
    var bw = def.bowser
    s.bowser = {
      x: bw[0] * TILE, y: bw[1] * TILE - 14, w: 30, h: 30,
      vx: -T.enemySpeed * 0.6, phase: 0,
      minX: (bw[0] - 2) * TILE, maxX: (bw[0] + 2) * TILE
    }
  }
  if (def.axe) spawnCoin(s, def.axe[0], def.axe[1], "axe")
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

function startLevel(s, i) {
  var behåll = s.mario ? { big: s.mario.big, fire: s.mario.fire } : null
  s.index = i
  s.def = LEVELS[i]()
  reset(s, true)                // score and lives carry over between courses
  if (behåll && behåll.big) {   // and so does the power-up, as in the original
    s.mario.big = true
    s.mario.h = 30
    s.mario.y -= 14
    s.mario.fire = behåll.fire
  }
}

function newGame() {
  var s = { def: LEVELS[0](), tick: 0, index: 0, title: true }
  reset(s, false)
  s.status = "title"            // Toad tells you why you are here; jump starts
  s.msg = TITLE_MSG
  return s
}

// The course after this one, or the ending when there is none. Called by the
// clear animation's timer, and by the axe on the castle course.
function nextLevel(s) {
  if (s.index + 1 < LEVELS.length) startLevel(s, s.index + 1)
  else { s.status = "won"; s.msg = "THANK YOU MARIO" }
}

function restart(s) {             // R: fresh run at 1-1, score cleared
  s.def = LEVELS[0]()
  s.index = 0
  reset(s, false)
}

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

// A coin, and the extra life at 100 as in the original.
function ta_mynt(s) {
  s.coins++
  addScore(s, 200)
  if (s.coins >= 100) { s.coins -= 100; s.lives++ }
}

// Enemies taken out in one air chain: 100, 200, 400, 500, 800, 1000, 2000,
// 4000, 5000, 8000 and then an extra life, as in the original. The chain is
// reset the moment Mario touches the ground.
var COMBO = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000]

function stamp(s) {
  if (s.combo < COMBO.length) { addScore(s, COMBO[s.combo]); s.combo++ }
  else s.lives++
}

// The flower: it makes small Mario big and big Mario fiery, which is why the
// same block gives a mushroom to a small Mario and a flower to a big one.
function blomma(s) {
  var m = s.mario
  if (!m.big) grow(s)
  else if (!m.fire) { m.fire = true; addScore(s, 1000) }
}

function hurt(s) {
  var m = s.mario
  if (m.dead || m.invuln > 0) return
  if (m.fire) {                 // fire falls back to big, not to small
    m.fire = false
    m.invuln = T.invuln
    return
  }
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
    if (ch === "?") { ta_mynt(s); spawnCoinPop(s, x, y) }
    else if (s.mario.big) spawnFlower(s, x, y)
    else spawnMushroom(s, x, y)
  } else if (ch === "b") {
    // coin brick: pays a coin and becomes a used block, whatever Mario's size
    set(s.grid, x, y, "U")
    ta_mynt(s)                 // 200 points and the coin, the life at 100
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
    // fire Mario shoots with the run button; the edge keeps a held button from
    // emptying the whole pool at once
    if (m.fire && in_.run && !s.shotHeld) spawnShot(s)
    s.shotHeld = in_.run

    if (in_.jump && m.onGround) { m.vy = -T.jumpV; m.onGround = false }
    m.jumping = !m.onGround
    m.vy += (in_.jump && m.vy < 0 ? T.gravHold : T.grav) * h
    if (m.vy > T.maxFall) m.vy = T.maxFall

    moveX(s, m, m.vx * h)
    var ry = moveY(s, m, m.vy * h)
    m.onGround = ry.ground
    if (m.onGround) s.combo = 0            // the stomp chain ends on the ground
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
      s.clearTimer = T.clearTime
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
    if (e.kickGrace > 0) e.kickGrace -= h
    e.vy += T.grav * h
    if (e.vy > T.maxFall) e.vy = T.maxFall
    var edir = e.vx
    if (moveX(s, e, e.vx * h)) e.vx = -edir      // a kicked shell bounces too
    var er = moveY(s, e, e.vy * h)
    e.onGround = er.ground
    e.phase += h
    // turn around at the level edges instead of walking off the map
    if (e.x < 0) { e.x = 0; e.vx = -e.vx }
    else if (e.x > s.def.width * TILE - e.w) { e.x = s.def.width * TILE - e.w; e.vx = -e.vx }
    if (e.y > ROWS * TILE + 16) { e.active = false; continue }

    // a kicked shell takes out whatever is in front of it
    if (e.state === "sliding") {
      for (var j = 0; j < s.ents.length; j++) {           // ponytail: n^2 over <=24 enemies
        var o = s.ents[j]
        if (o === e || !o.active || o.state !== "walk") continue
        if (overlap(e, o)) {
          o.state = "squashed"
          o.timer = T.squashTime
          o.vx = 0
          addScore(s, 500)
        }
      }
    }

    if (!m.dead && overlap(m, e)) {
      var feet = m.y + m.h
      var stamp_d = m.vy > 0 && feet - e.y < 12
      if (e.state === "shell" || e.state === "sliding") {
        if (stamp_d) {                                    // land on it: it stops
          if (e.state === "sliding") { e.state = "shell"; e.vx = 0 }
          e.kickGrace = T.kickGrace
          m.vy = -T.stompBounce
          m.onGround = false
        } else if (e.state === "shell") {
          // inside the kick grace neither happens: the shell you just stomped
          // must not hurt you while you are still landing on it
          if (e.kickGrace <= 0) {                         // walk into it: it goes
            e.state = "sliding"
            e.vx = (m.x + m.w / 2 < e.x + e.w / 2) ? T.shellSpeed : -T.shellSpeed
          }
        } else hurt(s)                                    // a moving shell hurts
      } else if (stamp_d) {
        if (e.kind === "koopa") {                         // into its shell
          e.state = "shell"
          e.vx = 0
          e.kickGrace = T.kickGrace
          e.y += e.h - T.shellH
          e.h = T.shellH
        } else {
          e.state = "squashed"
          e.timer = T.squashTime
          e.vx = 0
        }
        m.vy = -T.stompBounce
        m.onGround = false
        stamp(s)
      } else hurt(s)
    }
  }

  // ---- bowser ----
  if (s.bowser) {
    var b = s.bowser
    b.x += b.vx * h
    if (b.x < b.minX) { b.x = b.minX; b.vx = -b.vx }
    else if (b.x > b.maxX) { b.x = b.maxX; b.vx = -b.vx }
    b.phase += h
    // never stompable: touching him anywhere costs a life
    if (!m.dead && overlap(m, b)) hurt(s)
  }

  // ---- fireballs ----
  for (i = 0; i < s.shots.length; i++) {
    var sk = s.shots[i]
    if (!sk.active) continue
    sk.timer -= h
    if (sk.timer <= 0) { sk.active = false; continue }
    sk.vy += T.grav * h
    if (sk.vy > 420) sk.vy = 420
    if (moveX(s, sk, sk.vx * h)) { sk.active = false; continue }   // a wall stops it
    var föll = sk.vy > 0                       // read before moveY, which zeroes it on landing
    var skr = moveY(s, sk, sk.vy * h)
    if (skr.ground && föll) sk.vy = -T.fireBounce                  // it bounces
    if (sk.y > ROWS * TILE + 16) { sk.active = false; continue }
    for (var q = 0; q < s.ents.length; q++) {
      var träffad = s.ents[q]
      if (!träffad.active || träffad.state === "squashed") continue
      if (overlap(sk, träffad)) {
        träffad.state = "squashed"
        träffad.timer = T.squashTime
        träffad.vx = 0
        addScore(s, 200)
        sk.active = false
        break
      }
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
    } else if (it.type === "mushroom" || it.type === "flower") {
      if (it.emerge > 0) {
        // slides up out of its block; then the mushroom walks and the flower sits
        it.emerge -= h
        it.y -= TILE * h / 0.45
        if (it.emerge <= 0 && it.type === "mushroom") it.vx = T.mushroomSpeed
      } else if (it.type !== "flower") {
        // a flower that has emerged just sits on its block: no walking, no
        // falling, and no `continue` — it must still reach the pickup below
        it.vy += T.grav * h
        if (it.vy > T.maxFall) it.vy = T.maxFall
        var mdir = it.vx
        if (moveX(s, it, it.vx * h)) it.vx = -mdir
        it.onGround = moveY(s, it, it.vy * h).ground
        if (it.y > ROWS * TILE + 16) { it.active = false; continue }
      }
    }
    if (!m.dead && overlap(m, it)) {
      if (it.type === "axe") {
        // the axe cuts the bridge: Bowser goes down and the game is won
        it.active = false
        s.bowser = null
        s.status = "won"
        s.msg = WON_MSG
        return
      }
      if (it.type === "mushroom") { it.active = false; grow(s) }
      else if (it.type === "flower") { it.active = false; blomma(s) }
      else if (it.type === "coin") { it.active = false; ta_mynt(s) }
      // a coinpop is the coin thrown out of a block: the block already paid
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
  if (s.status === "title") {          // Toad's line: jump to start playing
    if (in_.jump) s.status = "play"
    s.tick++
    return
  }
  if (s.status === "clear") {          // the flagpole animation, then the next course
    s.clearTimer -= dt
    if (s.clearTimer <= 0) nextLevel(s)
    s.tick++
    return
  }
  if (s.status === "gameover" || s.status === "won") { s.tick++; return }
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
    world: s.def.world,
    status: s.status,
    msg: s.msg
  }
}
