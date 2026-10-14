# Research: what a faithful Super Mario Bros (NES, 1985) clone needs

Five reports, produced by parallel research agents (Orca, `codex exec`) and then
reviewed by a sixth agent whose only job was to judge them (`05-verdict.md`).
The reviewer's conclusion shapes how everything here should be read:

> The data in these reports is a research lead, not a complete implementation
> specification.

So: the reports are kept verbatim as evidence, and this file is the part to work
from. Numbers below carry the verdict's weight, not the report's confidence.

| file | what it is | how much holds |
|---|---|---|
| `01-physics.md` | frame movement, jumping, block bumps, clock, score table, death | raw constants hold; guide-level arcs are [weak] |
| `02-course-structure.md` | course lengths, course types, pipes and warp zones, flagpole, castle endings | topology holds; **widths are wrong as printed** |
| `03-entities-gap.md` | enemy/item/state inventory **plus the gap list against this repository** | gap list verified against the code |
| `04-palette-metrics.md` | NES palette, sub-palettes, sprite boxes, screen layout | palette architecture holds; boxes are [weak] |
| `05-verdict.md` | the judgment: per-claim verdicts, URL table, identifier check | — |

## Constants worth implementing (NES NTSC, from the disassembly)

Speed is a signed 4.4 value (high nibble = pixels, low nibble = sixteenths), so
these are exact px/frame at the NES's ~60.0988 Hz update.

| property | value | px/s at 60 Hz |
|---|---:|---:|
| run speed cap | ±2.5 px/frame | 150 |
| walk speed cap | ±1.5 px/frame | 90 |
| low-speed cap | ±1.0 px/frame | 60 |
| jump initial speed, standing/walking | -4 px/frame | 240 |
| jump initial speed, running | -5 px/frame | 300 |
| terminal fall speed | 4 px/frame | 240 |
| gravity while the button is held | 0x20 / 0x1E / 0x28 by speed profile | — |
| gravity after release | 0x70 / 0x60 / 0x90 by speed profile | — |
| block bump: the block's own vy | -2 px/frame | 120 |

Score: stomping enemies in a row without touching the ground gives
100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000 and then a 1-up. Coins are
200, a broken brick 50, a power-up 1000. Remaining time converts at 50 points per
displayed second, except in the x-4 castle courses, which pay no time bonus.

Where this repository stands after the 1.1.0 round, measured on a flat test
track (`T.walkMax` 95, `T.runMax` 152, `T.jumpV` 305, `T.grav` 1500,
`T.gravHold` 620, `T.maxFall` 520):

| | original | this clone |
|---|---:|---:|
| walk top speed | 90 px/s | 95 px/s |
| run top speed | 150 px/s | 152 px/s |
| standing jump height | 4 blocks (64 px) | 4.6 blocks (74 px) |
| walking jump | 70 px high, 80 px long | 74 px high, 78 px long |
| running jump | 81 px high, 136 px long | 74 px high, 124 px long |
| airtime | — | 0.82 s |

Re-measure with `node tests/measure.js`; the numbers above are its output.

So the arc is already close: the heights are within 10 px, the walking jump is
two pixels off in length, and the running jump is nine per cent short. The one
real difference is that this clone jumps with the same initial speed at every
walking pace, while the original uses -4 px/frame standing and walking and
-5 px/frame once Mario is at running speed. Adding that split is worth about
10 px of height and would need the hold gravity split with it (the original's
is 0x20 for the slow profiles and 0x28 for the fast ones). Left out on purpose:
the arc is inside a few per cent of the original at every speed, and a lower
standing jump puts the four-tile pipes in the courses at risk.

An earlier version of this file claimed a 1.62 s airtime and jumps of 154 and
246 px. That was the measurement tool's bug, not the game's: it held the jump
button past the landing, so two hops were measured as one. The tool now
releases at the apex, which is the same arc in this physics (hold gravity only
applies while rising) without the second hop.

## The gap list (verified against this repository)

From `03-entities-gap.md`, whose every identifier was grep-checked by the
reviewer and by hand:

- **Enemies** — the goomba and the koopa troopa (with the shell state, the kick
  and the sliding shell) exist. Missing: paratroopa, piranha plant, bullet bill,
  podoboo, firebar, hammer bro, latiku and spiny, buzzy beetle.
- **Power-ups** — the mushroom, the fire flower and the fireball weapon (fire
  state, two in flight at once, bouncing, 200 a kill, fire lost before size)
  exist. Missing: starman, 1-up mushroom, vine.
- **Blocks** — `bumpBlock()` hardcodes `?`→coin, `M`→mushroom, `b`→coin,
  `B`→break. Missing: per-block content data, hidden/invisible blocks, and
  flower/star/1-up/coin-filled bricks.
- **Hazards and platforms** — nothing but static geometry and pits. Missing:
  moving platforms and lifts with a rider, lava as a collision surface,
  podoboo, firebars, and the castle bridge as a stateful object.
- **Bowser** — ours patrols and hurts on touch. Missing: his jump, his fire
  breath, the five-fireball defeat, what happens when he falls, and the Toad
  chamber after the axe.
- **Lives** — 100 coins grants an extra life, and so does the eleventh enemy in
  one air chain, as in the original.

## What this corpus does NOT settle — settle it before coding

- **Course widths.** `02` prints widths whose arithmetic does not close
  (188 tiles x 16 px = 3008, not the 3012 printed). Do not copy them. Read the
  level format notes and the disassembly instead.
- **Per-frame acceleration.** The disassembly applies fractional friction by
  state and input; nobody derived one px/frame^2 from it. Read
  `src/game/player/physics.asm` and derive the transitions, or measure in an
  emulator.
- **Clock cadence and death flow.** Start value, ticks per second, death
  animation frames, what resets, and the exact per-course resume rule.
- **Collision boxes.** The actor boxes in `04` come from a browser recreation
  article, not from CHR/OAM data. Treat as [weak].
- **Enemy movement values.** Speeds, turn rules and the attack matrix are
  qualitative in every source that was reachable.
- **The RGB table.** It is one named approximation (FirebrandX lineage), not
  "the" 2C02 output; the chip emits composite video. Keep the label.

## Sources that did not answer

`gamefaqs.gamespot.com` returns 403 to a plain client and
`world-of-nintendo.com` returns 406 — confirmed by both the reviewer's sweep and
an independent one. Every claim resting only on those pages is unverified and is
marked [weak] in `05-verdict.md`. Everything cited from `nesdev.org`,
`raw.githubusercontent.com`, `mariowiki.com`, `supermariobros.zone` and
`themushroomkingdom.net` answered 200.

## How the run was made

One Orca worktree of this repository, four `codex exec` agents in parallel (one
report each, one file each), then a fifth agent to judge them. The briefs and the
wrapper are not kept here; the method is written up in the `orca-agent-worktrees`
skill. No file outside `research/` was touched by any agent, and the reports are
quoted verbatim — corrections belong in this file, not in theirs.
