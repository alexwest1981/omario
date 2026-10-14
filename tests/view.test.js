// Static checks on GameView.qml.
//
// The game state is one plain JS object, so the view carries a `rev` counter
// that every dynamic binding has to read *itself*. A binding whose only
// dependency is an intermediate `var` property never re-evaluates: that
// property returns the same object every frame, so QML sees no change and sends
// no notify. That is how enemies and coins came to be drawn at their spawn
// positions while the game kept moving them (you then die to something you
// cannot see).
//
// usage: node tests/view.test.js [path/to/GameView.qml]

const fs = require("fs")
const path = require("path")

const file = process.argv[2] || path.join(__dirname, "..", "GameView.qml")
const lines = fs.readFileSync(file, "utf8").split("\n")

let passed = 0
const fail = (msg) => { console.log("  FAIL " + msg); process.exitCode = 1 }
const check = (name, fn) => {
  const before = process.exitCode
  fn()
  if (process.exitCode === before) { passed++; console.log("  ok  " + name) }
}

// x/y/visible/art on a sprite: whatever shows where something is or how it looks
const LIVE = /^\s*(x|y|visible|art):/

check("bindings that show game state read view.rev", () => {
  let n = 0
  lines.forEach((line, i) => {
    if (!LIVE.test(line)) return
    if (!/view\.game|\be\b|\bit\b/.test(line)) return      // camera and static bindings
    if (/view\.game\.def\b/.test(line)) return               // level geometry: never changes
    n++
    if (!/view\.rev/.test(line)) {
      fail("line " + (i + 1) + " shows game state without reading view.rev: " + line.trim())
    }
  })
  if (n < 6) fail("expected at least 6 rev-reading sprite bindings, found " + n)
})

check("no binding depends on a var property that wraps the game state", () => {
  lines.forEach((line, i) => {
    const wrap = line.match(/property var (\w+): \{\s*view\.rev;/)
    if (!wrap) return
    const name = wrap[1]
    for (let j = i + 1; j < Math.min(i + 14, lines.length); j++) {
      const dep = lines[j]
      if (LIVE.test(dep) && new RegExp("\\b" + name + "\\b").test(dep) && !/view\.rev/.test(dep)) {
        fail("line " + (j + 1) + " depends on the " + name + " wrapper instead of reading view.rev")
      }
    }
  })
})

check("sprite slot counts come from Art.SLOT_COUNT", () => {
  const fromArt = lines.filter((l) => /slots:\s*Art\.SLOT_COUNT\./.test(l))
  if (fromArt.length < 3) fail("expected 3 sprite delegates sizing slots from Art, found " + fromArt.length)
  const hard = lines.filter((l) => /slots:\s*\d+\s*$/.test(l))
  if (hard.length > 4) fail(hard.length + " literal slot counts: art can outgrow them silently")
})

console.log("\n" + passed + " view checks passed")
