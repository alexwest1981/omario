# SMB (NES, 1985): mechanics reference

## 1. Frame movement

| Property | NES NTSC reference | Notes |
|---|---:|---|
| Game logic cadence | 1 update per video frame; NTSC NES is nominally about 60.0988 Hz [source: https://www.nesdev.org/wiki/NTSC_video] | A 60 Hz clone runs about 0.16% slower in real time; scale a real-time accumulator if wall-clock matching matters. [reasoning] |
| Ground speed caps | `$28` = +2.5 px/frame, `$18` = +1.5 px/frame, `$10` = +1 px/frame; signed left values `$D8` = -2.5, `$E8` = -1.5, `$F0` = -1 [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] | The source’s movement notes identify the three right/left profiles as run, walk, and low-speed caps respectively. [source: https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md] |
| Acceleration | **Not established here as a single px/frame² value.** The disassembly applies a fractional friction adder to the speed byte and selects it by state/input. [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] | A 4.4 speed byte changes in fractional increments; conversion to a simple acceleration depends on the current profile and input path. [source: https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md] |
| Stop friction / reverse braking | **Exact per-frame changes not established here.** The code has friction table bytes `$E4`, `$98`, `$D0`; reversal doubles the selected friction increment. [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] | These are implementation adder values, not direct pixel-per-frame acceleration figures. [source: https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md] |

Speed is represented as signed 4.4 displacement: high nibble is signed pixels and low nibble is sixteenths of a pixel; the integrator carries fractional movement into pixel position. [source: https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md]

## 2. Jumping

The original-style NTSC jump initializer selects a profile from horizontal speed magnitude. `$FC` is -4 px/frame initial vertical speed for profiles 0–2; `$FB` is -5 px/frame for profiles 3–4. Gravity bytes are fractional increments added to vertical speed each frame; held-jump gravity and released/fall gravity differ. [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm]

| Speed profile | Jump gravity | Release/fall gravity | Initial Y speed | Interpretation |
|---|---:|---:|---:|---|
| `$00–$08` | `$20` | `$70` | `$FC` (-4) | stationary/slow [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] |
| `$09–$0F` | `$20` | `$70` | `$FC` (-4) | walking profile [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] |
| `$10–$18` | `$1E` | `$60` | `$FC` (-4) | faster approach [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] |
| `$19–$1B` | `$28` | `$90` | `$FB` (-5) | running profile [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] |
| `$1C+` | `$28` | `$90` | `$FB` (-5) | fastest profile [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] |

Downward speed is capped at 4 px/frame. [source: https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md] The jump-button check uses the jump gravity while A remains held in consecutive samples; releasing selects fall gravity after Mario has risen at least one pixel. [source: https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md]

The Mushroom Kingdom guide reports nominal arcs: standing jump 4 blocks high; walking jump 5 blocks long and 4 blocks + 6 px high; running jump 8½ blocks long and 5 blocks + 1 px high. [source: https://themushroomkingdom.net/smb_breakdown.shtml] For a 16 px tile these are respectively 64 px high, 80 px distance / 70 px high, and 136 px distance / 81 px high. [reasoning] Those are guide-level nominal arcs, not a frame-by-frame measurement; exact distance depends on launch speed, button hold, collision, and landing. [reasoning]

## 3. Block bumping

On a bump the NES code sets the block object’s vertical speed to `$FE` (-2 px/frame) and clears Mario’s vertical speed; the block is advanced by the shared gravity/integration path. [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/objects/blocks.asm] The exact peak displacement and total animation duration are **not established from the checked text sources**. [reasoning]

Enemies standing on a block hit from below are damaged, and coins resting on it are collected. [source: https://themushroomkingdom.net/smb_breakdown.shtml] Block contents dispatch to mushroom/flower, coin, 1-up mushroom, vine, or star handlers according to block data. [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/objects/blocks.asm] The guide says coins are 200 points each; multicoins are emitted through repeated hits until their timer expires. [source: https://themushroomkingdom.net/smb_breakdown.shtml]

## 4. Clock

The visible course timer’s tick rate and initial value are **not established by the checked sources in this pass**. [reasoning] On course clear, remaining time converts to 50 points per displayed second, except in x-4 castle courses, where there is no time bonus. [source: https://themushroomkingdom.net/smb_breakdown.shtml] Timer zero is an instant-death condition. [source: https://themushroomkingdom.net/smb_breakdown.shtml]

## 5. Score table

| Event | Points |
|---|---:|
| Goomba stomp | 100 normally [source: https://themushroomkingdom.net/smb_breakdown.shtml] |
| Consecutive stomps without touching ground | 100, 200, 400, 500, 800, 1,000, 2,000, 4,000, 5,000, 8,000, then 1-up [source: https://themushroomkingdom.net/smb_breakdown.shtml] |
| Coin | 200 [source: https://themushroomkingdom.net/smb_breakdown.shtml] |
| Breakable brick | 50 [source: https://themushroomkingdom.net/smb_breakdown.shtml] |
| Mushroom, Fire Flower, Starman | 1,000 [source: https://themushroomkingdom.net/smb_breakdown.shtml] |
| Flagpole | Height-dependent: guide provides a score-zone chart [source: https://themushroomkingdom.net/smb_breakdown.shtml] |
| Bowser | Exact point value not established here. [reasoning] |
| 1-up mushroom | Adds a life; point score is not established here. [source: https://themushroomkingdom.net/smb_breakdown.shtml] |

The stomping sequence requires no ground contact; Bullet Bills do not count toward it. [source: https://themushroomkingdom.net/smb_breakdown.shtml] The 1-up is awarded after the 8,000-point step (the 11th successful stomp in that sequence). [source: https://themushroomkingdom.net/smb_breakdown.shtml]

## 6. Death and lives

Falling into a pit/lava or reaching timer zero causes instant death; losing a life and restarting at a course position are separate from the eight-second damage-invulnerability blink after a powered-up Mario is hit. [source: https://themushroomkingdom.net/smb_breakdown.shtml] Exact death animation frame count, death-state reset fields, continue/game-over transition details, and the precise resume/checkpoint rule by course are **not established by the checked sources in this pass**. [reasoning]

## 7. Sources, versions, and authenticity

Sources checked: a source-annotated SMB1 assembly repository’s movement notes and assembly files, The Mushroom Kingdom’s SMB guide, NESdev’s NTSC timing reference, and Nintendo’s NES Classic manual. [source: https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md] [source: https://themushroomkingdom.net/smb_breakdown.shtml] [source: https://www.nesdev.org/wiki/NTSC_video] [source: https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf]

The assembly source has separate revision profiles, including NTSC and PAL constants; its PAL jump speeds/gravity differ from the NTSC table. [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm] This pass did not establish a complete mechanics comparison against Super Mario All-Stars or Super Mario Bros. Deluxe, so no port-specific numeric claims are made. [reasoning] For an NES-authentic clone, use the NES NTSC ROM’s behavior and NTSC constants as the target; a 60 Hz fixed timestep is a close practical approximation, while 60.0988 Hz matches the nominal NTSC frame cadence more closely. [reasoning] The primary assembly table gives raw values suitable for implementing the NES behavior; the guide’s jump distances are a useful external cross-check rather than a replacement for frame-level emulation. [reasoning]

## What I could not establish

- Exact per-frame walk/run acceleration, no-input friction, and reverse-braking values expressed as pixels/frame²; the table bytes and profile logic are available, but this pass did not derive every frame transition. [source: https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm]
- Exact block bump peak distance and animation duration. [reasoning]
- Exact in-game timer tick cadence and starting timer value. [reasoning]
- Bowser’s score value and numeric flagpole bands from the source chart. [reasoning]
- Exact death-animation frame count, death reset fields, resume location by course, and lives/continue/game-over state flow. [reasoning]
- Full numeric comparison of NES, All-Stars, and Deluxe movement/gameplay behavior. [reasoning]
