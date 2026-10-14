.pragma library

// Sprites are lists of [x, y, w, h, colour] rectangles in level pixels (one
// tile = 16 px). The characters are real pixel maps (one char per pixel) that
// are run-length merged into rectangles once at load; the tiles and the decor
// are hand-placed rectangles. No images, no canvas.

var C = {
  red: "#e03028",
  skin: "#f8b070",
  blue: "#2848d8",
  brown: "#8c4a10",
  dark: "#101010",
  white: "#fcfcfc",
  yellow: "#f8d030",
  gold: "#c89018",
  green: "#48a038",
  dkgreen: "#1c6820",
  ltgreen: "#88d060",
  brick: "#b04010",
  brickdark: "#681c04",
  bricklite: "#d87040",
  ground: "#c86020",
  grounddark: "#7c3c0c",
  groundlite: "#e89848",
  cream: "#fce0b8",
  used: "#a06020",
  useddark: "#6c3c0c",
  sky: "#6b8cff"
}

var PAL = {
  R: C.red, S: C.skin, N: C.brown, K: C.dark, B: C.blue,
  Y: C.yellow, W: C.white, T: C.cream, G: C.green, O: C.gold,
  P: "#f8a0c0", D: C.dkgreen, L: C.ltgreen, A: C.brickdark
}

var WIDTH = 16

// ------------------------------------------------------------- pixel art -----

// One char per pixel, '.' is transparent. Runs of the same colour become one
// rectangle, so a 16x16 sprite costs as many rectangles as it has colour runs.
function pixels(rows, floorRow) {
  var out = []
  for (var y = 0; y < rows.length; y++) {
    var row = rows[y], x = 0
    while (x < row.length) {
      var ch = row.charAt(x)
      if (ch === ".") { x++; continue }
      var run = 1
      while (x + run < row.length && row.charAt(x + run) === ch) run++
      out.push([x, y, run, 1, PAL[ch] || C.dark])
      x += run
    }
  }
  if (floorRow !== undefined && out.length) {          // feet on the hit box, always
    var low = out[0][1]
    for (var i = 1; i < out.length; i++) if (out[i][1] > low) low = out[i][1]
    var dy = floorRow - low
    if (dy) for (i = 0; i < out.length; i++) out[i][1] += dy
  }
  return out
}

// Mirrored frame, inside `width` (the sprite's own box: the 16 px maps and the
// wider characters both get their mirror from here).
function mirror(art, width) {
  var w = width || WIDTH
  var out = []
  for (var i = 0; i < art.length; i++) {
    var r = art[i]
    out.push([w - r[0] - r[2], r[1], r[2], r[3], r[4]])
  }
  return out
}

// ------------------------------------------------------------ mario (16) -----

var MARIO_SMALL = {
  stand: [
    "................",
    ".....RRRRR......",
    "....RRRRRRRRR...",
    "....NNNSSKS.....",
    "...NSNSSSKSSS...",
    "...NSNNSSSKSS...",
    "...NNSSSSKKKK...",
    ".....SSSSSSS....",
    "...RRRBRRBRR....",
    "..RRRRBBBBRRRR..",
    ".RRRRBBBBBBRRRR.",
    ".SSRRBYBBYBBRRS.",
    ".SSSBBBBBBBBSSS.",
    "..S.BBBBBBBB.S..",
    "....NNN..NNN....",
    "...NNNN..NNNN..."
  ],
  walk1: [
    "................",
    ".....RRRRR......",
    "....RRRRRRRRR...",
    "....NNNSSKS.....",
    "...NSNSSSKSSS...",
    "...NSNNSSSKSS...",
    "...NNSSSSKKKK...",
    ".....SSSSSSS....",
    "...RRRBRRBRR....",
    "..RRRRBBBBRRRR..",
    ".RRRRBBBBBBRRRR.",
    ".SSRRBYBBYBBRRS.",
    ".SSBBBBBBBBBBS..",
    "..BBBB..BBBBB...",
    ".NNNNN...NNNNN..",
    "NNNNN.....NNNN.."
  ],
  walk2: [
    "................",
    ".....RRRRR......",
    "....RRRRRRRRR...",
    "....NNNSSKS.....",
    "...NSNSSSKSSS...",
    "...NSNNSSSKSS...",
    "...NNSSSSKKKK...",
    ".....SSSSSSS....",
    "...RRRBRRBRR....",
    "..RRRRBBBBRRRR..",
    ".RRRRBBBBBBRRRR.",
    ".SSRRBYBBYBBRRS.",
    ".SSSBBBBBBBBSSS.",
    "....BBBBBBBB....",
    "....NNNNNNNN....",
    "....NNNNNNNN...."
  ],
  jump: [
    "................",
    ".....RRRRR......",
    "....RRRRRRRRR...",
    "....NNNSSKS.....",
    "...NSNSSSKSSS...",
    "...NSNNSSSKSS...",
    "...NNSSSSKKKK.RR",
    ".....SSSSSSS.RR.",
    "...RRRBRRBRRRR..",
    "..RRRRBBBBRRRR..",
    "...RRBBBBBBRRR..",
    "....BBYBBYBB....",
    "....BBBBBBBB....",
    "....BBB..BBB....",
    "...NNNN..NNNN...",
    "...NNNN...NNN..."
  ]
}

// ------------------------------------------------------------- mario (32) ----

var MARIO_BIG = {
  stand: [
    "................",
    ".....RRRRR......",
    "....RRRRRRRRR...",
    "....NNNSSKS.....",
    "...NSNSSSKSSS...",
    "...NSNNSSSKSS...",
    "...NNSSSSKKKK...",
    ".....SSSSSSS....",
    "...RRRRRRRRR....",
    "..RRRRRRRRRRR...",
    "..RRRRRRRRRRR...",
    "..RRRBBBBBRRR...",
    ".RRRRBBYBBRRRR..",
    ".RRRRBBYBBRRRR..",
    ".RRRRBBBBBRRRR..",
    ".SSRRBBBBBRRSS..",
    ".SSSBBBBBBBSSS..",
    ".SS.BBBBBBB.SS..",
    "....BBBBBBB.....",
    "....BBBBBBB.....",
    "...BBBB.BBBB....",
    "...BBBB.BBBB....",
    "...BBBB.BBBB....",
    "...BBBB.BBBB....",
    "....BBB.BBB.....",
    "....BBB.BBB.....",
    "...NNNN.NNNN....",
    "..NNNNN.NNNNN...",
    "..NNNNN.NNNNN...",
    "...NNN...NNN....",
    "................",
    "................"
  ],
  walk1: [
    "................",
    ".....RRRRR......",
    "....RRRRRRRRR...",
    "....NNNSSKS.....",
    "...NSNSSSKSSS...",
    "...NSNNSSSKSS...",
    "...NNSSSSKKKK...",
    ".....SSSSSSS....",
    "...RRRRRRRRR....",
    "..RRRRRRRRRRR...",
    ".RRRRRRRRRRRRR..",
    ".RRRRBBBBBRRRR..",
    ".RRRRBBYBBRRRR..",
    "SSRRRBBYBBRRRSS.",
    "SSSRRBBBBBRRSSS.",
    "SS.SBBBBBBB.SSS.",
    "....BBBBBBB.....",
    "...BBBBB.BBB....",
    "..BBBBB...BBB...",
    "..BBBB.....BB...",
    "..BBB......BBB..",
    ".BBB........BB..",
    ".BBB........BBB.",
    "NNNN........BBB.",
    "NNNNN.......NNN.",
    "NNN.........NNN.",
    "NNN.........NNN.",
    "NNN..........NN.",
    "................",
    "................",
    "................",
    "................"
  ],
  jump: [
    "................",
    ".....RRRRR......",
    "....RRRRRRRRR...",
    "....NNNSSKS.....",
    "...NSNSSSKSSS...",
    "...NSNNSSSKSS...",
    "...NNSSSSKKKK...",
    "..RRRSSSSSSS....",
    "..RRRRRRRRRR....",
    ".RRRRRRRRRRRRR..",
    "SSRRRRRRRRRRRSS.",
    "SSRRRBBBBBRRRSS.",
    ".RRRRBBYBBRRRR..",
    "..RRRBBYBBRRR...",
    "..RRRBBBBBRRR...",
    "...SBBBBBBBSS...",
    "....BBBBBBB.....",
    "....BBBBBBB.....",
    "...BBBB.BBBB....",
    "...BBB...BBB....",
    "...BBB...BBB....",
    "...BBB...BBB....",
    "...BBB...BBB....",
    "..BBBB...BBBB...",
    "..BBBB...BBBB...",
    "..BBBB...BBBB...",
    "..NNNN...NNNN...",
    "..NNNNN..NNNNN..",
    "..NNNNN..NNNNN..",
    "..NNNNN..NNNNN..",
    "...NNN...NNN....",
    "...NNN...NNN...."
  ]
}

// --------------------------------------------------------------- goomba ------

var GOOMBA = {
  walk1: [
    "................",
    "................",
    ".....NNNNNN.....",
    "...NNNNNNNNNN...",
    "..NNNNNNNNNNNN..",
    "..NNWKNNNNKWNN..",
    ".NNNWKNNNNKWNNN.",
    ".NNNWKNNNNKWNNN.",
    ".NNNNNNNNNNNNNN.",
    "..NNNNNNNNNNNN..",
    "..NNNNNNNNNNNN..",
    "..KKKKKKKKKKKK..",
    ".KKKKK....KKKKK.",
    ".KKKK......KKKK.",
    "................",
    "................"
  ],
  walk2: [
    "................",
    "................",
    ".....NNNNNN.....",
    "...NNNNNNNNNN...",
    "..NNNNNNNNNNNN..",
    "..NNWKNNNNKWNN..",
    ".NNNWKNNNNKWNNN.",
    ".NNNWKNNNNKWNNN.",
    ".NNNNNNNNNNNNNN.",
    "..NNNNNNNNNNNN..",
    "..NNNNNNNNNNNN..",
    "..KKKKKKKKKKKK..",
    "..KKKK....KKKK..",
    ".KKK........KKK.",
    "................",
    "................"
  ],
  squashed: [
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "..NNNNNNNNNNNN..",
    ".NNNNNNNNNNNNNN.",
    ".NNNNNNNNNNNNNN.",
    ".KKKKKKKKKKKKKK.",
    "................"
  ]
}

// ------------------------------------------------------------ items ---------

var MUSHROOM = [
  "................",
  ".....RRRRRR.....",
  "...RRRRRRRRRR...",
  "..RRWWRRRRWWRR..",
  ".RRRWWRRRRWWRRR.",
  ".RRRRRRRRRRRRRR.",
  ".RRWWRRRRRRWWRR.",
  ".RRWWRRRRRRWWRR.",
  "..RRRRRRRRRRRR..",
  "..TTTTTTTTTTTT..",
  "..TTKKTTTTKKTT..",
  "..TTKKTTTTKKTT..",
  "..TTTTTTTTTTTT..",
  "..TTTTTTTTTTTT..",
  "...TTTTTTTTTT...",
  "................"
]

// --------------------------------------------------------------- koopa -------
// Green koopa troopa, 16 wide and a tile and a half tall, plus the shell it
// leaves behind. Same idiom as the rest: one character per pixel, '.' empty.
var KOOPA_WALK1 = [
  "................",
  ".....GGGGGG.....",
  "....GGGGGGGG....",
  "...GGWWGGWWGG...",
  "...GGWKGGWKGG...",
  "...GGWWGGWWGG...",
  "....GGGGGGGG....",
  ".....YYYYYY.....",
  "...DDDDDDDDDD...",
  "..DDLLLLLLLLDD..",
  "..DDLLDDDDLLDD..",
  "..DDLLDDDDLLDD..",
  "..DDLLLLLLLLDD..",
  "..DDDDDDDDDDDD..",
  "...DDDDDDDDDD...",
  "....DDDDDDDD....",
  "....YYYYYYYY....",
  "....YY....YY....",
  "....YY....YY....",
  "....YY....YY....",
  "....YY....YY....",
  "...YYY....YYY...",
  "................",
  "................"
]

var KOOPA_WALK2 = [
  "................",
  ".....GGGGGG.....",
  "....GGGGGGGG....",
  "...GGWWGGWWGG...",
  "...GGWKGGWKGG...",
  "...GGWWGGWWGG...",
  "....GGGGGGGG....",
  ".....YYYYYY.....",
  "...DDDDDDDDDD...",
  "..DDLLLLLLLLDD..",
  "..DDLLDDDDLLDD..",
  "..DDLLDDDDLLDD..",
  "..DDLLLLLLLLDD..",
  "..DDDDDDDDDDDD..",
  "...DDDDDDDDDD...",
  "....DDDDDDDD....",
  "....YYYYYYYY....",
  ".....YY..YY.....",
  "....YY....YY....",
  "...YY......YY...",
  "...YY......YY...",
  "..YYY......YYY..",
  "................",
  "................"
]

// The shell: what a stomped koopa leaves. Short, and it spins when it slides.
var SHELL = [
  "................",
  "....DDDDDDDD....",
  "..DDGGGGGGGGDD..",
  ".DDGGGGGGGGGGDD.",
  ".DGGGGGGGGGGGGD.",
  "DDGGGGDDDDGGGGDD",
  "DDGGGDDDDDDGGGDD",
  "DDGGGDDDDDDGGGDD",
  "DDGGGGDDDDGGGGDD",
  ".DGGGGGGGGGGGGD.",
  ".DDGGGGGGGGGGDD.",
  "..DDGGGGGGGGDD..",
  "...YYYYYYYYYY...",
  "................",
  "................",
  "................"
]

// The fire flower, 16x16 on its block. Two frames so its colours flicker, as in
// the original.
var FLOWER = [
  "................",
  "....RRRRRRRR....",
  "...RRRRRRRRRR...",
  "..RRRRRRRRRRRR..",
  "..RRRGGGGGGRRR..",
  "..RRGGGGGGGGRR..",
  "...RGGYYYYGGR...",
  "...RGGYYYYGGR...",
  "....GGGGGGGG....",
  ".....GGGGGG.....",
  "......GGGG......",
  "....GGGGGG......",
  "...LLGGGG....DD.",
  "..LLLLGGG...DDD.",
  "...LLGGGG..DDD..",
  "....GGGGGG......"
]

// A fireball: 8x8, two frames, the second one the other way round.
var FIREBALL = [
  "..RRRR..",
  ".RYYYYR.",
  "RYWWWYYR",
  "RYWWWYYR",
  "RYYYYYYR",
  ".RYYYYR.",
  "..RRRR..",
  "........"
]

// --------------------------------------------------------------- bosses ------
// Bowser guards the bridge on the castle course. 24 wide, feet on row 23: green
// body, cream belly, red hair, spiked shell. He is never stompable, so the only
// way past him is over or around — the axe beyond him is what ends the game.
var BOWSER = [
  "........................",
  "........RRRRRR..........",
  ".......RRRRRRRR.........",
  "......RRWWWWWWRR........",
  "......RKWWKKWWKR........",
  "......RKWWKKWWKR........",
  "......RRWWWWWWRR........",
  ".......RWWWWWWR.........",
  "....GGGGWWWWWWGGGG......",
  "...GGGGGGGGGGGGGGGGG....",
  "..GGDDGWGGGGWGGGWDDGG...",
  "..GDDDWGGGGGGGGGWDDDG...",
  "..GDDDDGWGGWGGWDDDDG....",
  "...GGGGGYYYYYYGGGGG.....",
  "....GGGYYTTTTYYGGG......",
  "....GGYYTTTTTTYYGG......",
  "....GGYYTTTTTTYYGG......",
  "....GGGYYTTTTYYGGG......",
  ".....GGYYYYYYGGGG.......",
  ".....GGGGGGGGGGG........",
  "....GGGG....GGGG........",
  "....GDDG....GDDG........",
  "....GDDG....GDDG........",
  "...GGGGGG..GGGGGG......."
]

// The axe on the last pillar: touching it cuts the bridge and ends the game.
var AXE = [
  "................",
  "................",
  "....KKKKKKK.....",
  "...KWWWWWWWK....",
  "..KWWWWWWWWWK...",
  "..KWKKKKKKKWK...",
  "..KKWWWWWWWKK...",
  "...KKKKKKKKK....",
  "......NNN.......",
  "......NNN.......",
  "......NNN.......",
  "......NNN.......",
  "......NNN.......",
  "....NNNNNNN.....",
  "....NNNNNNN.....",
  "................"
]

// Toad and the princess, for the two story screens.
var TOAD = [
  "................",
  "....WWWWWWWW....",
  "...WWWWWWWWWW...",
  "..WWWWWWWWWWWW..",
  "..WWRRWWWWRRWW..",
  "..WWRRWWWWRRWW..",
  "..WWWWWWWWWWWW..",
  "..WWWWWWWWWWWW..",
  "..WWWKKWWKKWWW..",
  "..WWWWWWWWWWWW..",
  "...WWWWWWWWWW...",
  "....BBBBBBBB....",
  "...BBBBBBBBBB...",
  "..BBBBWWWWBBBB..",
  "..BBBBWWWWBBBB..",
  "..BBBBWWWWBBBB..",
  "..BBBBWWWWBBBB..",
  "...BBBBBBBBBB...",
  "...BBBBBBBBBB...",
  "....BB....BB....",
  "....BB....BB....",
  "...TTTT..TTTT...",
  "...TTTT..TTTT...",
  "................"
]

var PRINCESS = [
  "................",
  ".....YYYYYY.....",
  "....YYYYYYYY....",
  "...YY.WWWW.YY...",
  "...YYWWWWWWYY...",
  "...YYWKKWWKKW...",
  "...YYWWWWWWWW...",
  "...YYYWWWWWWY...",
  "....YYWWWWYY....",
  ".....WWWWWW.....",
  "....PPPPPPPP....",
  "...PPPWWWWPPP...",
  "..PPPWWWWWWPPP..",
  "..PPWWWWWWWWPP..",
  ".PPPWWWWWWWWPPP.",
  ".PPPWWWWWWWWPPP.",
  ".PPPPWWWWWWPPPP.",
  "PPPPPPPPPPPPPPPP",
  "PPPPPPPPPPPPPPPP",
  "PPPPPPPPPPPPPPPP",
  "PPPPPPPPPPPPPPPP",
  "PPPPPPPPPPPPPPPP",
  "PPPPPPPPPPPPPPPP",
  "................"
]

// ------------------------------------------------------- castle dressing -----

function lava() {
  return [[0, 0, 16, 16, C.red], [0, 0, 16, 3, C.yellow],
          [2, 4, 12, 12, "#d85818"], [0, 12, 16, 4, "#b03000"],
          [5, 6, 3, 3, C.yellow], [11, 9, 2, 2, C.yellow]]
}

function pillar() {
  // two tiles tall, so a row-11 pillar stands on the row-13 floor instead of
  // floating: base, shaft with a lit edge, and a capital at the top
  return [[2, 4, 12, 28, "#4c4c58"], [2, 4, 3, 28, "#6c6c78"], [12, 4, 2, 28, "#34343c"],
          [0, 0, 16, 4, "#5c5c68"], [0, 0, 16, 1, "#7c7c88"], [1, 30, 14, 2, "#34343c"]]
}

// Fire Mario is the big sprite in the other two colours: hat and shirt white,
// overalls red. Same rectangles, recoloured once at load.
function fiery(art) {
  var out = []
  for (var i = 0; i < art.length; i++) {
    var r = art[i], c = r[4]
    if (c === C.red) c = C.white
    else if (c === C.blue) c = C.red
    out.push([r[0], r[1], r[2], r[3], c])
  }
  return out
}

// Precompute every frame once (and its mirror), so drawing never allocates.
var FRAMES = {}
var SLOTS = { mario: 0, goomba: 0, item: 0, char: 0, enemy: 0, shot: 0 }

function add(key, group, rows, floorRow) {
  var art = pixels(rows, floorRow)
  FRAMES[key] = art
  FRAMES[key + "F"] = mirror(art, rows[0] ? rows[0].length : WIDTH)
  if (art.length > SLOTS[group]) SLOTS[group] = art.length
  return art
}

function buildFrames() {
  add("msStand", "mario", MARIO_SMALL.stand, 15)
  add("msWalk1", "mario", MARIO_SMALL.walk1, 15)
  add("msWalk2", "mario", MARIO_SMALL.walk2, 15)
  add("msJump", "mario", MARIO_SMALL.jump, 15)
  add("mbStand", "mario", MARIO_BIG.stand, 31)
  add("mbWalk1", "mario", MARIO_BIG.walk1, 31)
  add("mbJump", "mario", MARIO_BIG.jump, 31)
  add("gWalk1", "goomba", GOOMBA.walk1)
  add("gWalk2", "goomba", GOOMBA.walk2)
  add("gSquash", "goomba", GOOMBA.squashed)
  add("mushroom", "item", MUSHROOM)
  add("flower", "item", FLOWER)
  FRAMES.flower2 = FRAMES.flower.map(function (r) {
    return [r[0], r[1], r[2], r[3], r[4] === C.white ? C.yellow : r[4] === C.yellow ? C.white : r[4]]
  })
  add("shot0", "shot", FIREBALL)
  add("shot1", "shot", FIREBALL.slice().reverse())
  add("axe", "item", AXE)
  add("kWalk1", "enemy", KOOPA_WALK1, 21)
  add("kWalk2", "enemy", KOOPA_WALK2, 21)
  add("shell", "enemy", SHELL, 12)
  add("coin0", "item", ["................", "......YYYY......", ".....YYYYYY.....", "....YYOOOOYY....",
                        "....YYOOOOYY....", "....YYOOOOYY....", "....YYOOOOYY....", "....YYOOOOYY....",
                        "....YYOOOOYY....", "....YYOOOOYY....", "....YYOOOOYY....", ".....YYYYYY.....",
                        "......YYYY......", "................", "................", "................"])
  add("coin1", "item", ["................", ".......YY.......", "......YYYY......", ".......OO.......",
                        ".......OO.......", ".......OO.......", ".......OO.......", ".......OO.......",
                        ".......OO.......", ".......OO.......", ".......OO.......", "......YYYY......",
                        ".......YY.......", "................", "................", "................"])
  add("toad", "char", TOAD, 21)
  add("princess", "char", PRINCESS, 21)
  add("bowser", "char", BOWSER, 23)      // add() makes the mirrored frame too
}
buildFrames()

// The fiery big frames, built from the big ones so the poses cannot drift apart.
var ELD_FRAN = { mbStandFire: "mbStand", mbWalk1Fire: "mbWalk1", mbJumpFire: "mbJump" }
for (var eld in ELD_FRAN) {
  FRAMES[eld] = fiery(FRAMES[ELD_FRAN[eld]])
  FRAMES[eld + "F"] = mirror(FRAMES[eld], WIDTH)
}

// Visible slot counts: GameView sizes its Repeaters from these, so art can
// never outgrow its sprite.
var SLOT_COUNT = SLOTS

// ----------------------------------------------------------------- draw ------

function mario(m) {
  var big = m.big
  var key
  if (!m.onGround) key = big ? "mbJump" : "msJump"
  else if (Math.abs(m.vx) > 6) {
    var stride = Math.floor(m.anim * 8) % 2
    key = big ? (stride ? "mbWalk1" : "mbStand") : (stride ? "msWalk1" : "msWalk2")
  } else key = big ? "mbStand" : "msStand"
  if (m.dead) key = big ? "mbJump" : "msJump"
  if (big && m.fire) key = key + "Fire"
  return FRAMES[m.facing < 0 ? key + "F" : key] || FRAMES.msStand
}

function goomba(e) {
  if (e.state === "squashed") return FRAMES.gSquash
  return Math.floor((e.phase || 0) * 6) % 2 ? FRAMES.gWalk2 : FRAMES.gWalk1
}

// Every enemy draws through here, so a new kind is one branch.
function enemy(e) {
  if (e.kind === "koopa") {
    if (e.state === "shell" || e.state === "sliding") {
      if (e.state === "sliding") return Math.floor((e.phase || 0) * 8) % 2 ? FRAMES.shellF : FRAMES.shell
      return FRAMES.shell
    }
    return Math.floor((e.phase || 0) * 6) % 2 ? FRAMES.kWalk2 : FRAMES.kWalk1
  }
  return goomba(e)
}

function bowser(b) {
  // two-frame sway so he is not a statue
  return Math.floor((b.phase || 0) * 4) % 2 ? FRAMES.bowser : FRAMES.bowserF
}

// Toad and the princess are drawn facing right; the story screens use them
// straight on, so ask for the un-mirrored frame by name.
function char(name) {
  return FRAMES[name]
}

function shot(sk) {
  return FRAMES[(sk.timer || 0) * 8 % 2 < 1 ? "shot0" : "shot1"]
}

function item(it) {
  if (it.type === "axe") return FRAMES.axe
  if (it.type === "flower") return FRAMES[(it.phase || 0) * 4 % 2 < 1 ? "flower" : "flower2"]
  if (it.type === "mushroom") return FRAMES.mushroom
  return Math.floor((it.phase || 0) * 4) % 2 ? FRAMES.coin1 : FRAMES.coin0
}

// Item frames share one pool in the view, so they share one slot count.

// ---------------------------------------------------------------- tiles ------

function tile(ch, top, left) {
  switch (ch) {
  case "G":
    return [[0, 0, 16, 16, C.ground], [0, 0, 16, 2, C.groundlite], [2, 4, 12, 9, C.grounddark]]
  case "B":
  case "b":
    return [[0, 0, 16, 16, C.brick], [0, 0, 16, 1, C.bricklite],
            [0, 7, 16, 1, C.brickdark], [0, 8, 16, 1, C.brickdark],
            [7, 0, 1, 7, C.brickdark], [3, 8, 1, 8, C.brickdark], [11, 8, 1, 8, C.brickdark]]
  case "?":
  case "M":
    return [[0, 0, 16, 16, C.yellow], [1, 1, 14, 14, C.gold], [2, 2, 12, 12, C.yellow],
            [4, 4, 8, 3, C.dark], [10, 5, 3, 4, C.dark], [7, 9, 3, 3, C.dark], [7, 12, 2, 2, C.dark]]
  case "U":
    return [[0, 0, 16, 16, C.used], [1, 1, 14, 14, C.useddark], [2, 2, 12, 12, C.used]]
  case "S":
    return [[0, 0, 16, 16, C.groundlite], [0, 0, 16, 2, "#f8c070"], [2, 4, 12, 9, C.ground]]
  case "P":
    if (top) {
      // lip that overhangs the tile by 2px, plus the body underneath it
      var cap = [[-2, 0, 18, 4, C.ltgreen], [-2, 4, 18, 3, C.green], [0, 7, 16, 9, C.green]]
      if (left) cap.push([0, 7, 3, 9, C.ltgreen])
      else cap.push([13, 7, 3, 9, C.dkgreen], [16, 0, 2, 7, C.dkgreen])
      return cap
    }
    return left ? [[0, 0, 16, 16, C.green], [0, 0, 3, 16, C.ltgreen]]
                : [[0, 0, 16, 16, C.green], [13, 0, 3, 16, C.dkgreen]]
  case "F":
    return [[7, 0, 2, 16, C.dkgreen], [6, 0, 4, 3, C.green], [6, 0, 4, 1, C.ltgreen]]
  }
  return []
}

// ----------------------------------------------------------------- decor -----

function hill(big) {
  if (big) return [[0, 16, 64, 16, C.ltgreen], [6, 6, 52, 12, C.ltgreen], [16, 0, 32, 8, C.ltgreen]]
  return [[0, 10, 40, 8, C.ltgreen], [5, 4, 30, 8, C.ltgreen], [13, 0, 14, 6, C.ltgreen]]
}

function bush() {
  return [[0, 8, 40, 8, C.green], [4, 4, 32, 6, C.green], [11, 1, 18, 5, C.green]]
}

function cloud() {
  return [[0, 6, 56, 8, C.white], [8, 0, 40, 8, C.white], [18, 10, 24, 6, C.white]]
}

function castle() {
  return [
    [0, 24, 80, 56, C.brick], [8, 16, 8, 10, C.brick], [24, 16, 8, 10, C.brick],
    [40, 16, 8, 10, C.brick], [56, 16, 8, 10, C.brick],
    [24, 6, 32, 12, C.brick], [32, 0, 16, 8, C.brick],
    [32, 48, 16, 32, C.dark], [16, 40, 8, 8, C.dark], [56, 40, 8, 8, C.dark],
    [0, 24, 80, 2, C.bricklite]
  ]
}

function flag() {
  return [[0, 0, 14, 4, C.green], [0, 4, 10, 4, C.green], [0, 8, 6, 4, C.green]]
}
