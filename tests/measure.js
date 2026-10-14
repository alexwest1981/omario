// Measures this clone's own numbers on a flat test track: top speeds and jump
// arcs, for the comparison with the NES originals. Not a test - a measurement.
//   node tests/measure.js
// The numbers in research/README.md are this script's output.
//
// The jump is measured with the button held until the apex and released after
// it. That is the full-height jump, and in this game the release changes
// nothing on the way down (hold gravity only applies while rising). Holding the
// button past the landing instead starts a second hop inside the same step,
// which is how one earlier version of this file reported an airtime of 1.62 s:
// two jumps measured as one.
const fs = require("fs"), path = require("path"), vm = require("vm")
const ROOT = path.join(__dirname, "..")
const load = (f) => {
  const body = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^\.pragma[^\n]*\n/, "")
  const ctx = vm.createContext({})
  vm.runInContext(body, ctx)
  return ctx
}
const M = load("Mario.js")
const TILE = M.TILE, DT = 1 / 60

console.log("constants: walkMax", M.T.walkMax, "runMax", M.T.runMax, "jumpV", M.T.jumpV,
            M.T.jumpVrun !== undefined ? "(run " + M.T.jumpVrun + ")" : "", "grav", M.T.grav,
            "gravHold", M.T.gravHold, "maxFall", M.T.maxFall)

// flat track: 120 tiles of ground, no obstacles, the flag out of measuring range
function flat() {
  const s = M.newGame()
  s.def = { world: "test", width: 120, ground: [[0, 119]], pipes: [], blocks: [], stairs: [],
            goombas: [], coins: [], flag: 118, decor: [] }
  M.reset(s, false)
  return s
}
function drive(s, seconds, input) {
  let t = 0
  while (t < seconds) { M.step(s, DT, Object.assign(M.input(), input)); t += DT }
}

function topSpeed(run) {
  const s = flat()
  drive(s, 3, { right: true, run })
  const x0 = s.mario.x
  drive(s, 1, { right: true, run })
  return { vx: Math.round(Math.abs(s.mario.vx)), perSecond: Math.round(s.mario.x - x0) }
}

function jump(run) {
  const s = flat()
  drive(s, 2.5, { right: true, run })
  const startY = s.mario.y, startX = s.mario.x
  let top = startY, t = 0, wasAir = false
  while (t < 4) {
    const airBefore = !s.mario.onGround
    M.step(s, DT, Object.assign(M.input(), { right: true, run, jump: s.mario.onGround || s.mario.vy < 0 }))
    t += DT
    if (s.mario.y < top) top = s.mario.y
    if (!s.mario.onGround) wasAir = true
    else if (wasAir && airBefore) break          // landed between two steps
  }
  return { height: Math.round(startY - top), length: Math.round(s.mario.x - startX), airtime: +t.toFixed(2) }
}

function standJump() {
  const s = flat()
  const startY = s.mario.y
  let top = startY, t = 0, wasAir = false
  while (t < 4) {
    const airBefore = !s.mario.onGround
    M.step(s, DT, Object.assign(M.input(), { jump: s.mario.onGround || s.mario.vy < 0 }))
    t += DT
    if (s.mario.y < top) top = s.mario.y
    if (!s.mario.onGround) wasAir = true
    else if (wasAir && airBefore) break
  }
  return { height: Math.round(startY - top), airtime: +t.toFixed(2) }
}

const g = topSpeed(false), r = topSpeed(true)
console.log("top speed: walk", g.vx, "px/s (", g.perSecond, "px in one second ) | run", r.vx, "px/s (", r.perSecond, "px )")
const origins = { stand: "4 blocks (64 px) high", walk: "4 blocks + 6 px (70 px) high, 5 blocks (80 px) long",
                  run: "5 blocks + 1 px (81 px) high, 8.5 blocks (136 px) long" }
const sj = standJump(), wj = jump(false), rj = jump(true)
for (const [name, h, origin] of [["standing", sj, origins.stand], ["walking", wj, origins.walk], ["running", rj, origins.run]]) {
  const len = h.length !== undefined ? h.length + " px = " + (h.length / TILE).toFixed(1) + " blocks" : "-"
  console.log(name.padEnd(9), "jump: height", String(h.height).padStart(3), "px =", (h.height / TILE).toFixed(1),
              "blocks | length", len, "| airtime", h.airtime, "s")
  console.log("".padEnd(9), "   original:", origin)
}
