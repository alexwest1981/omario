# Course structure (NES, 1985)

## 1. Length and storage

The length figures below are horizontal map widths reported by a game-data-based level reference. The reference reports its own “units” and block counts; for the clone’s 16 px grid, use the reported block count as tile count. [source: https://supermariobros.zone/world-1-1/] [source: https://supermariobros.zone/world-1-2/] [source: https://supermariobros.zone/world-1-3/] [source: https://supermariobros.zone/world-1-4/]

| Course | Width units | 16 px tiles | Width at 16 px/tile |
|---|---:|---:|---:|
| 1-1 | 1504 | 188 | 3008 px [source: https://supermariobros.zone/world-1-1/] |
| 1-2 | 1506 | 188 (rounding/edge convention differs by 2 units) | 3012 px [source: https://supermariobros.zone/world-1-2/] |
| 1-3 | 1144 | 143 | 2288 px [source: https://supermariobros.zone/world-1-3/] |
| 1-4 | 1108 | 139 | 2216 px [source: https://supermariobros.zone/world-1-4/] |

The four World 1 courses span 139–188 tiles; the sampled reference gives 188, 188, 143, and 139 tiles. [source: https://supermariobros.zone/world-1-1/] [source: https://supermariobros.zone/world-1-2/] [source: https://supermariobros.zone/world-1-3/] [source: https://supermariobros.zone/world-1-4/] I could not establish a sourced min/max or typical range for all 32 courses; do not treat World 1’s range as the whole game’s range. [reasoning]

The original level data is organized as “areas” (main route, bonus rooms, or other sections); areas consist of page-based object data. In documented format notes, a page is 16 columns by 15 rows of 16-pixel tiles; objects encode a page-relative X and row, and object records describe terrain features rather than storing a full painted screen bitmap. [source: https://github.com/bonimy/MushROMs/blob/master/doc/SMB1%20Level%20Format.md] A level can link to multiple areas (for example, a pipe enters a bonus area); therefore “course” and “area” are not interchangeable. [source: https://github.com/bonimy/MushROMs/blob/master/doc/SMB1%20Level%20Format.md]

## 2. Course types and rules

| Type / example | Visual set and typical exclusive content | Mechanics |
|---|---|---|
| Overworld: 1-1, 1-3 | Ground/sky palette, hills/clouds/bushes; ordinary ground enemies and pipes. [source: https://www.mariowiki.com/World_1-1_%28Super_Mario_Bros.%29] | Ordinary gravity and ground movement; pits are fatal. Pipes may be scenery or entrances. [source: https://supermariobros.zone/world-1-1/] |
| Underground: 1-2 | Underground palette and brick ceiling; underground bonus areas use the same visual family. [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29] | Low ceiling limits jumping; ceiling bricks can be broken by Super/Fire Mario, enabling the ceiling-run secret. Pipes connect areas. [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29] |
| Underwater: e.g. 2-2, 3-2 | Blue water area with aquatic enemies such as Bloopers and Cheep-Cheeps. [source: https://www.mariowiki.com/World_2-2_%28Super_Mario_Bros.%29] | Swim by repeated jump input; movement is buoyant/slower, and the player can move vertically without ground support. [source: https://www.mariowiki.com/World_2-2_%28Super_Mario_Bros.%29] |
| Castle: 1-4 | Castle palette/brick interior; lava, Fire-Bars, Podoboos, Bowser, bridge and axe. 1-4 has Fire-Bars and a disguised Bowser. [source: https://www.mariowiki.com/World_1-4_%28Super_Mario_Bros.%29] | Lava kills on contact; Fire-Bars rotate around fixed pivots; Podoboos leap from lava in castle variants. [source: https://www.mariowiki.com/World_1-4_%28Super_Mario_Bros.%29] |
| Bridge / athletic sections | These are layout situations, not separate course-wide physics modes: 1-4’s bridge sits over lava; 1-3 is a high-platform course with lifts. [source: https://www.mariowiki.com/World_1-4_%28Super_Mario_Bros.%29] [source: https://www.mariowiki.com/World_1-3_%28Super_Mario_Bros.%29] | Apply the relevant course physics; bridges can be destroyed by axe at the castle end, while lifts/platforms move on set paths. [source: https://www.mariowiki.com/World_1-4_%28Super_Mario_Bros.%29] |

The same broad enemy families can appear in more than one course type; the cited sources do not provide a complete, definitive “only appears in this type” entity inventory. [reasoning] Implement the palettes/terrain and their rule changes as course attributes, while treating enemies as per-course placements. [reasoning]

## 3. Pipes and warp zones

There are three standard warp zones in the original game: one in 1-2 and two in 4-2. [source: https://thonky.com/super-mario-bros-1/list-of-warp-zones]

| Origin | How to reach it | Destinations |
|---|---|---|
| 1-2 | At the end, use the moving lift to reach the ceiling, break through where needed as Super/Fire Mario, then run over the normal exit pipe. [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29] | Three marked pipes go to Worlds 2, 3, and 4. [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29] |
| 4-2 (first) | Reach the hidden vine block, climb the vine to the upper bonus route. [source: https://thonky.com/super-mario-bros-1/list-of-warp-zones] | Worlds 6, 7, and 8. [source: https://thonky.com/super-mario-bros-1/list-of-warp-zones] |
| 4-2 (second) | Take the underground ceiling route past the normal exit pipe. [source: https://thonky.com/super-mario-bros-1/list-of-warp-zones] | World 5. [source: https://thonky.com/super-mario-bros-1/list-of-warp-zones] |

A standard enterable vertical pipe is entered by standing on its top and pressing Down; which pipe works is configured per pipe, and walking into its side does not enter it. [source: https://supermariobros.zone/world-1-1/] Pipes can also serve as exits from a room: Mario walks into the pipe opening from the side and the area transition carries him through. [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29] The hidden 1-2 route requires discovering that the lift reaches the screen ceiling and then running right above the ordinary exit; the 4-2 routes require probing the indicated hidden block or ceiling path. [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29] [source: https://thonky.com/super-mario-bros-1/list-of-warp-zones]

## 4. Flagpole clear and between-course flow

At a flagpole, Mario grabs at his height, slides down, then walks automatically toward the small castle; the course-clear flow converts remaining timer to score before the next course loads. [source: https://www.mariowiki.com/Goal_Pole] Height bands award 100, 400, 800, 2000, or 5000 points from low to high. [source: https://www.mariowiki.com/Goal_Pole] The exact band thresholds in pixels were not established from the text sources checked. [reasoning]

After reaching the goal, the timer converts to score in 50-point ticks; the walk to the castle and transition follows, with no separate world map or between-level tally screen in the NES flow. [source: https://www.mariowiki.com/World_1-1_%28Super_Mario_Bros.%29] [source: https://www.mariowiki.com/Goal_Pole] If the timer’s final digit is 1, 3, or 6, the game triggers one, three, or six fireworks, respectively. [source: https://protipoftheday.com/node/165.html]

## 5. Castle endings

In castle courses Bowser stands on a bridge over lava; the axe is just beyond him, and touching it removes the bridge so Bowser falls. [source: https://www.mariowiki.com/World_1-4_%28Super_Mario_Bros.%29] [source: https://www.mariowiki.com/Axe] Defeating Bowser with fireballs does not itself clear the course; crossing the bridge and touching the axe does. [source: https://www.mariowiki.com/Axe]

There are two castle outcomes: after castles 1–7, the rescued Toad says, “Thank you Mario! But our princess is in another castle!”; at 8-4, the real Princess Peach says, “Thank you Mario! Your quest is over. We present you a new quest. Push button B to select a world.” [source: https://www.mariowiki.com/Toad_(species)] [source: https://www.mariowiki.com/Princess_Peach]

After the axe, the NES shows a brief bridge/Bowser defeat animation, then the rescued character text; the next world/course is loaded after the message. The precise duration in frames was not established by the text sources checked. [source: https://www.mariowiki.com/Axe] [source: https://www.mariowiki.com/Toad_(species)]

## 6. Death and respawn

The game has halfway-point respawns in most non-castle courses: once passed, death restarts Mario at that point; castle courses are excluded. [source: https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf] This is a restart position within the same course, not a new checkpoint object the player activates. [reasoning] Course-specific checkpoint coordinates for 1-1 through 1-4 were not established by the text sources checked. [reasoning]

## 7. World 1 implementation checklist

- [ ] Use 16 px world tiles; target course widths: 1-1 188 tiles, 1-2 188 tiles, 1-3 143 tiles, 1-4 139 tiles. [source: https://supermariobros.zone/world-1-1/] [source: https://supermariobros.zone/world-1-2/] [source: https://supermariobros.zone/world-1-3/] [source: https://supermariobros.zone/world-1-4/]
- [ ] Store each course as ordered areas; let each area contain page-relative object placements and a terminator/transition, rather than a full-resolution bitmap. [source: https://github.com/bonimy/MushROMs/blob/master/doc/SMB1%20Level%20Format.md]
- [ ] Build 1-1 as an overworld onboarding route with Goombas, a Koopa, blocks, pipes, pits, secret bonus area, and flagpole. [source: https://www.mariowiki.com/World_1-1_%28Super_Mario_Bros.%29]
- [ ] Build 1-2 as underground, with a low brick ceiling, pipe transitions, and an accessible ceiling route to a three-pipe warp zone (Worlds 2/3/4). [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29]
- [ ] Build 1-3 as an elevated athletic course with moving lifts/platforms and a flagpole. [source: https://www.mariowiki.com/World_1-3_%28Super_Mario_Bros.%29]
- [ ] Build 1-4 as a castle course with lava pits, Fire-Bars, hidden blocks, bridge, fake Bowser, and axe; omit a halfway respawn. [source: https://www.mariowiki.com/World_1-4_%28Super_Mario_Bros.%29] [source: https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf]
- [ ] Support Down-to-enter on designated pipes and side-entry area transitions where a pipe is an exit. [source: https://supermariobros.zone/world-1-1/] [source: https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29]
- [ ] Give underwater areas swim movement; keep this rule outside World 1’s four courses unless extending the scope. [source: https://www.mariowiki.com/World_2-2_%28Super_Mario_Bros.%29] [reasoning]
- [ ] On flagpole contact, select a height score band, lower the flag, walk Mario to the castle, convert remaining time, optionally fire fireworks for timer endings 1/3/6, then load the next course. [source: https://www.mariowiki.com/Goal_Pole] [source: https://protipoftheday.com/node/165.html]
- [ ] On castle axe contact, remove bridge, drop Bowser, show rescued-character dialogue; make the princess dialogue unique to the final castle. [source: https://www.mariowiki.com/Axe] [source: https://www.mariowiki.com/Toad_(species)] [source: https://www.mariowiki.com/Princess_Peach]
- [ ] Add a halfway respawn to 1-1, 1-2, and 1-3; restart 1-4 from its entrance after death. [source: https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf]

## What I could not establish

- The sourced typical minimum/maximum course width across all 32 courses.
- A definitive exhaustive list of entities that appear only in each course type.
- Exact pixel thresholds for each flagpole height band.
- Exact frame duration and full display timing of the castle axe sequence.
- Exact halfway respawn coordinates for World 1 courses.
