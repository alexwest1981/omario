// Measures this clone's own numbers on a flat test track: top speeds and jump
// arcs, for the comparison with the NES originals. Not a test - a measurement.
//   node tests/measure.js
// The numbers in research/README.md are this script's output.
const fs = require("fs"), path = require("path"), vm = require("vm")
const ROOT = path.join(__dirname, "..")
const load = (f) => { const b = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/^\.pragma[^\n]*\n/, ""); const c = vm.createContext({}); vm.runInContext(b, c); return c }
const M = load("Mario.js")
const TILE = M.TILE, DT = 1 / 60
console.log("konstanter: walkMax", M.T.walkMax, "runMax", M.T.runMax, "jumpV", M.T.jumpV,
            "grav", M.T.grav, "gravHold", M.T.gravHold, "maxFall", M.T.maxFall)

// plan bana: 120 rutors mark, inga hinder, ingen flagga inom mätsträckan
function plan() {
  const s = M.newGame()
  s.def = { world: "test", width: 120, ground: [[0, 119]], pipes: [], blocks: [], stairs: [],
            goombas: [], coins: [], flag: 118, decor: [] }
  M.reset(s, false)
  return s
}
function kör(s, sekunder, input) {
  let t = 0
  while (t < sekunder) { M.step(s, DT, Object.assign(M.input(), input)); t += DT }
}

// toppfart: medelvärdet över sista sekunden, inte ögonblicket
function toppfart(run) {
  const s = plan()
  kör(s, 3, { right: true, run })
  const x0 = s.mario.x, v = s.mario.vx
  kör(s, 1, { right: true, run })
  return { vx: Math.round(Math.abs(v)), medel: Math.round((s.mario.x - x0)) }
}

function hopp(run) {
  const s = plan()
  kör(s, 2.5, { right: true, run })          // upp i fart
  const startY = s.mario.y, startX = s.mario.x
  let topp = startY, t = 0, lyfte = false
  while (t < 4) {
    M.step(s, DT, Object.assign(M.input(), { right: true, run, jump: true }))
    t += DT
    if (s.mario.y < topp) topp = s.mario.y
    if (!s.mario.onGround) lyfte = true
    else if (lyfte) break
  }
  return { hojd: Math.round(startY - topp), langd: Math.round(s.mario.x - startX), tid: +t.toFixed(2) }
}

// stående hopp: stå still, håll hoppet
function ståhopp() {
  const s = plan()
  const startY = s.mario.y
  let topp = startY, t = 0, lyfte = false
  while (t < 4) {
    M.step(s, DT, Object.assign(M.input(), { jump: true }))
    t += DT
    if (s.mario.y < topp) topp = s.mario.y
    if (!s.mario.onGround) lyfte = true
    else if (lyfte) break
  }
  return { hojd: Math.round(startY - topp), tid: +t.toFixed(2) }
}

const g = toppfart(false), r = toppfart(true)
console.log("toppfart: gång vx", g.vx, "px/s (", g.medel, "px på en sekund ) | spring vx", r.vx, "px/s (", r.medel, "px )")
const sh = ståhopp(), gh = hopp(false), rh = hopp(true)
for (const [namn, h] of [["stående", sh], ["gång", gh], ["spring", rh]]) {
  console.log(namn.padEnd(8), "hopp: höjd", String(h.hojd).padStart(3), "px =", (h.hojd / TILE).toFixed(1),
              "block | längd", (h.langd !== undefined ? (String(h.langd).padStart(4) + " px = " + (h.langd / TILE).toFixed(1) + " block") : "-"), "| lufttid", h.tid, "s")
}
console.log("originalet: gång 90, spring 150 px/s | stående 4 block högt, gång 4 block + 6 px högt och 5 block långt, spring 5 block + 1 px högt och 8,5 block långt")
