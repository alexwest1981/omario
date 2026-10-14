# Research wave verdict

## Verdicts

- **01 — Physics: mostly holds as a cautious reference.** The raw NTSC byte tables and explicit caveats are useful; frame-level mechanics and jump arcs are deliberately not overstated. The guide-level scores/arcs are weaker than the disassembly. Several claimed exact values still need direct byte interpretation and ROM/emulator confirmation before implementation. [physics source](https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm) [movement notes](https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md) [guide](https://themushroomkingdom.net/smb_breakdown.shtml)
- **02 — Course structure: mixed, useful topology, suspect dimensions.** Area-versus-course distinction, warp routes, general course types, and flagpole behavior largely hold. World-width arithmetic is not internally consistent: 1506 units is not 188×16 (3008), and the report gives 3012 px; 188 tiles ×16 is 3008. Treat all four reported widths as unverified. Some specific course/checkpoint claims rely on tertiary sources or a manual that does not document coordinates. [level reference](https://supermariobros.zone/world-1-2/) [format notes](https://github.com/bonimy/MushROMs/blob/master/doc/SMB1%20Level%20Format.md) [Goal Pole](https://www.mariowiki.com/Goal_Pole)
- **03 — Entities gap: repository audit is mostly useful; original behavior claims are uneven.** The named implementation gaps broadly match the code. Enemy attack matrices and variant behavior should be treated as weak where inferred from a general manual or walkthrough, and the report’s own caveats about numeric values are appropriate. [manual](https://www.world-of-nintendo.com/manuals/nes/super_mario_bros.shtml) [enemy guide](https://www.mariolegacy.com/nes/super-mario-bros.-enemies.htm) [repository source](../Mario.js)
- **04 — Palette metrics: palette architecture holds, several numeric/display measurements are weak.** The caveat that RGB is an approximation and changes by context is sound. Disassembly-derived PPU palette codes are the strongest part. Actor boxes from a browser recreation are not primary NES collision or opaque-pixel measurements; status strip/layout and decor dimensions should not be implemented from these prose claims alone. [NESdev palette notes](https://www.nesdev.org/wiki/PPU_palettes) [disassembly](https://github.com/pgattic/smb1-disasm/blob/master/main.asm) [dimension article](https://supermario-game.com/blog/how-tall-is-mario)

## URL availability

Each URL was requested twice with the prescribed curl commands: `curl -sIL --max-time 25 -A 'Mozilla/5.0' -o /dev/null -w '%{http_code}'` (HEAD) and `curl -sL --max-time 25 -A 'Mozilla/5.0' -o /dev/null -w '%{http_code}'` (GET). The following are exact results; `000` would indicate no HTTP status. No tested URL returned 000. **406/403 are server refusals to this client, not proof the source page is dead.** [World of Nintendo manual](https://www.world-of-nintendo.com/manuals/nes/super_mario_bros.shtml) [GameFAQs behavior source](https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/54461)

| URL | HEAD | GET |
|---|---:|---:|
| https://www.nesdev.org/wiki/NTSC_video | 200 | 200 |
| https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm | 200 | 200 |
| https://github.com/oranguthang/smb1_src/blob/main/docs/player_movement.md | 200 | 200 |
| https://themushroomkingdom.net/smb_breakdown.shtml | 200 | 200 |
| https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/objects/blocks.asm | 200 | 200 |
| https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf | 200 | 200 |
| https://supermariobros.zone/world-1-1/ | 200 | 200 |
| https://supermariobros.zone/world-1-2/ | 200 | 200 |
| https://supermariobros.zone/world-1-3/ | 200 | 200 |
| https://supermariobros.zone/world-1-4/ | 200 | 200 |
| https://github.com/bonimy/MushROMs/blob/master/doc/SMB1%20Level%20Format.md | 200 | 200 |
| https://www.mariowiki.com/World_1-1_%28Super_Mario_Bros.%29 | 200 | 200 |
| https://www.mariowiki.com/World_1-2_%28Super_Mario_Bros.%29 | 200 | 200 |
| https://www.mariowiki.com/World_2-2_%28Super_Mario_Bros.%29 | 200 | 200 |
| https://www.mariowiki.com/World_1-4_%28Super_Mario_Bros.%29 | 200 | 200 |
| https://www.mariowiki.com/World_1-3_%28Super_Mario_Bros.%29 | 200 | 200 |
| https://thonky.com/super-mario-bros-1/list-of-warp-zones | 200 | 200 |
| https://www.mariowiki.com/Goal_Pole | 200 | 200 |
| https://protipoftheday.com/node/165.html | 200 | 200 |
| https://www.mariowiki.com/Axe | 200 | 200 |
| https://www.mariowiki.com/Toad_(species) | 200 | 200 |
| https://www.mariowiki.com/Princess_Peach | 200 | 200 |
| https://www.nesdev.org/wiki/PPU_palettes | 200 | 200 |
| https://en.wikipedia.org/wiki/List_of_video_game_console_palettes | 200 | 200 |
| https://www.firebrandx.com/nespalette.html | 200 | 200 |
| https://github.com/pgattic/smb1-disasm/blob/master/main.asm | 200 | 200 |
| https://supermario-game.com/blog/how-tall-is-mario | 200 | 200 |
| https://github.com/MrRoblick/ppu2c02-luau | 200 | 200 |
| https://forums.nesdev.org/viewtopic.php?p=134797 | 200 | 200 |
| https://www.gamedeveloper.com/design/the-long-shadow-of-i-super-mario-bros-i- | 200 | 200 |
| https://www.world-of-nintendo.com/manuals/nes/super_mario_bros.shtml | 406 | 406 |
| https://www.mariolegacy.com/nes/super-mario-bros.-enemies.htm | 200 | 200 |
| https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/54461 | 403 | 403 |
| https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/66598 | 403 | 403 |
| https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/20569 | 403 | 403 |

## Weak and fallen claims

The labels below concern whether the cited source supports the attached claim, not whether the game behavior might be true. Most other direct transcriptions from the disassembly or cited pages hold at the stated level of precision.

- **01 — NES NTSC cadence / 0.16% comparison — weak.** [NESdev](https://www.nesdev.org/wiki/NTSC_video) gives approximately 60.0988 Hz, but the stated percentage is imprecise: relative to 60 Hz the slowdown is about 0.1646%, so “about 0.16%” is acceptable rounding, not an exact source quote.
- **01 — three nominal jump arcs — weak.** [The Mushroom Kingdom guide](https://themushroomkingdom.net/smb_breakdown.shtml) is a secondary guide, not a frame measurement; the report itself correctly says so. The converted pixels depend on the assumed 16 px block and arc labels. No independent frame-level confirmation is supplied.
- **01 — 4.4 movement interpretation and byte-to-pixel profile explanation — weak pending independent confirmation.** The [assembly](https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm) contains signed speed bytes and fractions, but the prose interpretation is not independently sourced. The byte caps themselves hold against that file; do not copy them as px/frame² acceleration values.
- **01 — “timer zero is instant death” and eight-second damage blink — weak.** [The Mushroom Kingdom](https://themushroomkingdom.net/smb_breakdown.shtml) is the sole cited support, and the [Nintendo manual](https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf) should be consulted for player-facing rules. The exact implementation timing was not independently checked here.
- **02 — tile counts and widths — wrong/internally inconsistent as printed.** The [world pages](https://supermariobros.zone/world-1-1/) list the referenced widths/counts, but the report’s arithmetic contradicts itself: 188×16=3008, not 3012; 1506 units is also not divisible into 188 16-unit tiles without a stated clipping convention. This table is a reference’s mapping, not established ROM map width.
- **02 — level format “16 columns by 15 rows of 16-pixel tiles” — weak/misread.** [MushROMs format notes](https://github.com/bonimy/MushROMs/blob/master/doc/SMB1%20Level%20Format.md) use page-based encoded object placement, but this phrase risks conflating a screen/page address space with the entire level storage grid. Confirm actual format definitions and the exact page coordinate semantics before writing a level parser.
- **02 — underwater controls and “buoyant/slower” — weak.** [World 2-2](https://www.mariowiki.com/World_2-2_%28Super_Mario_Bros.%29) establishes underwater play/aquatic enemies; its qualitative description is not a measured movement rule. The [disassembly](https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm) explicitly has swimming-specific jump/swim timers and gravity, which is better implementation evidence.
- **02 — warp-zone count — weakly worded.** [Thonky’s route list](https://thonky.com/super-mario-bros-1/list-of-warp-zones) describes the locations/routes, but “three standard warp zones” means three locations (1-2, two in 4-2), not three warp pipes/individual destinations. The report table clarifies this reasonably.
- **02 — 50-point timer conversion and no inter-level tally screen — weak.** [World 1-1](https://www.mariowiki.com/World_1-1_%28Super_Mario_Bros.%29) and [Goal Pole](https://www.mariowiki.com/Goal_Pole) support the broad flow; they do not establish every timing/detail as a frame-accurate NES rule. The claim “no separate world map” is plausible for NES flow but sourced to general wiki pages rather than primary documentation.
- **02 — halfway respawn “most non-castle courses” — weak.** [Nintendo’s manual](https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAAE.pdf) is the cited basis, but the precise “most” and castle exclusion require text locating; the report cannot derive coordinates from that citation. Verify in-game or from disassembly before implementing per-course checkpoints.
- **03 — enemy appearance inventory and attack matrix — weak.** [Mario Legacy](https://www.mariolegacy.com/nes/super-mario-bros.-enemies.htm) is the only cited source for many placement/quest claims; [World of Nintendo manual](https://www.world-of-nintendo.com/manuals/nes/super_mario_bros.shtml) is blocked by 406 to this curl client. The claims about shell/block-bump/fireball defeat across each enemy type are broader than a player manual’s summary and are not independently confirmed. Specifically treat the stated World 1 placements and first/second quest distinctions as provisional until checked against level data or ROM.
- **03 — Piranha Plant waits when Mario is near/on pipe — weak.** [Manual](https://www.world-of-nintendo.com/manuals/nes/super_mario_bros.shtml) says general pipe-plant behavior; [GameFAQs](https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/54461) was refused (403). It needs an accessible independent source or ROM check.
- **03 — five fireball hits defeat Bowser — weak, not verified by two independent accessible sources.** Both cited [GameFAQs 66598](https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/66598) and [54461](https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/54461) returned 403 to curl. Don’t treat repeated walkthrough citations as independent corroboration.
- **03 — Starman duration, exact item movements, Firebar/Podoboo movement, and attack immunity detail — weak.** [GameFAQs 20569](https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/20569) and [54461](https://gamefaqs.gamespot.com/nes/525243-super-mario-bros/faqs/54461) returned 403; the statements are appropriately caveated but not independently validated in this pass.
- **04 — RGB values — weak as a definitive hardware claim, correctly framed as one approximation.** The [Wikipedia palette table](https://en.wikipedia.org/wiki/List_of_video_game_console_palettes) and [FirebrandX palette](https://www.firebrandx.com/nespalette.html) are separate conversion sets, while [NESdev](https://www.nesdev.org/wiki/NTSC_video) explains why RGB is not unique. Label the displayed table by its actual conversion lineage rather than as “the” 2C02 colors.
- **04 — SMB subpalette assignments and object attribution — mostly holds but palette context is a caveat.** [Disassembly](https://github.com/pgattic/smb1-disasm/blob/master/main.asm) is strong primary evidence for data labels/bytes. Claims about which pictured object uses which group are weak where an object is animated, sprite-based, or overridden by area palettes; the report’s caveat is warranted.
- **04 — actor boxes (Mario 16×16/16×32, Goomba 16×16, Koopa 16×24, Bowser 32×32) — weak.** The sole numeric source is a [browser recreation article](https://supermario-game.com/blog/how-tall-is-mario), and the report itself says these are logical art boxes. It does not establish original ROM collision boxes or every pose’s opaque extents. Mushroom and coin sizes are explicitly reasoning-only, hence unverified.
- **04 — playfield/status strip 16×13 and 2 rows — weak to wrong terminology.** [NESdev forum post](https://forums.nesdev.org/viewtopic.php?p=134797) and [PPU overview project](https://github.com/MrRoblick/ppu2c02-luau) support raster/tile dimensions, but status graphics are 8×8 background tiles; “two metatile rows” is a useful 16 px equivalence, not the hardware unit. The claim of fixed HUD columns should remain approximate and dynamic.
- **04 — decor dimensions — no unsupported numeric claim is made.** The report properly leaves these unknown; [disassembly](https://github.com/pgattic/smb1-disasm/blob/master/main.asm) does name component metatiles but does not make one universal assembled size.

## Repository identifier check

Commands: `rg -n 'function ...|const ...' Mario.js Art.js GameView.qml` for the code identifiers, followed by targeted `rg -n 'identifier' Mario.js Art.js GameView.qml`. Every identifier named below was found unless marked otherwise. [Mario.js](../Mario.js) [Art.js](../Art.js) [GameView.qml](../GameView.qml)

| Claimed identifier(s) | Result / evidence |
|---|---|
| `level1`, `level2`, `level3`, `level4`, `LEVELS`, `build` | Found: `rg -n 'function level[1-4]|LEVELS|function build' Mario.js` |
| `spawnEnemy`, `spawnMushroom`, `spawnCoin`, `spawnCoinPop`, `bumpBlock` | Found: `rg -n 'function (spawnEnemy|spawnMushroom|spawnCoin|spawnCoinPop|bumpBlock)' Mario.js` |
| `reset`, `grow`, `hurt`, `kill`, `substep`, `overlap`, `moveX`, `moveY` | Found: `rg -n 'function (reset|grow|hurt|kill|substep|overlap|moveX|moveY)' Mario.js` |
| `T.enemySpeed=34`, `T.mushroomSpeed=62`, `SOLID`, `WON_MSG`, `TITLE_MSG` | Found: `rg -n 'enemySpeed: 34|mushroomSpeed: 62|SOLID|WON_MSG|TITLE_MSG' Mario.js` |
| Bowser column 156, axe column 161, patrol ±2 columns | Found in `level4()` / `reset()`: `rg -n '156|161|bowser|axe|T\.enemySpeed \* 0\.6' Mario.js` |
| `MARIO_SMALL`, `MARIO_BIG`, `GOOMBA`, `gWalk1`, `gWalk2`, `gSquash` | Found: `rg -n 'MARIO_SMALL|MARIO_BIG|GOOMBA|gWalk1|gWalk2|gSquash' Art.js` |
| `mario(m)`, `goomba(e)`, `bowser(b)`, `item(it)` | Found: `rg -n 'function (mario|goomba|bowser|item)' Art.js` |
| `Art.lava()` | Found as `function lava()` in `Art.js`, and dispatched via `Art.lava()` in `GameView.qml`: `rg -n 'function lava|Art\.lava\(\)' Art.js GameView.qml` |
| `SOLID="GBb?MUSP"` | Found exactly at `Mario.js:11`. Command: `rg -n 'SOLID' Mario.js` |

## Language check

All four reports are written in English. Code identifiers and game dialogue quotations are not language drift. No non-English report prose found. [01 physics](01-physics.md) [02 course structure](02-course-structure.md) [03 entity gap](03-entities-gap.md) [04 palette metrics](04-palette-metrics.md)

## “What I could not establish” lists

- **01:** Reasonable overall. The physics source itself permits deriving the frame transitions, but the report appropriately stops short of translating each state path into one acceleration constant. A short source pass could settle the exact initial timer and timer tick, score constants, and some death-flow details from disassembly; these are not inherently unknowable. The guide’s Bowser/flagpole data could also be transcribed directly rather than left open. [physics assembly](https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm) [block assembly](https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/objects/blocks.asm) [Mushroom Kingdom guide](https://themushroomkingdom.net/smb_breakdown.shtml)
- **02:** Reasonable for pixel thresholds, animation frame timing, and checkpoints from prose sources. The missing width range across 32 courses could have been established from game-data/level pages rather than left as a broad unknown; the cited [Super Mario Bros. Zone](https://supermariobros.zone/) provides per-course data, though one would need check its unit convention and all courses. “Exclusive entity” inventory is likewise settleable from ROM/course placement data but is a larger inventory task. No unverified figures should be coded from this wave.
- **03:** Reasonable on exact per-frame constants and hitboxes from the text sources. “Exact power-up rise/Starman duration” could be settled in disassembly/emulator, which is stronger than another prose page; attack matrix likewise can be audited against collision routines. The first-quest scope note is appropriate, but should not be mistaken for proof the roster tables are exhaustive. [physics assembly](https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm) [enemy reference](https://www.mariolegacy.com/nes/super-mario-bros.-enemies.htm)
- **04:** Strong restraint around the non-unique RGB table, changing area palettes, and sprite poses. Exact opaque boxes are image/ROM measurements rather than text facts; they can be established from extracted CHR/OAM data. HUD columns can be read from the disassembly, as the report acknowledges dynamic fields. Decor dimensions are not universal because pieces are assembled variably; asking for one canonical size is not well-posed. [disassembly](https://github.com/pgattic/smb1-disasm/blob/master/main.asm) [NESdev palette page](https://www.nesdev.org/wiki/PPU_palettes)

## What I would trust in this corpus, and what a developer must verify before coding

Trust the primary disassembly’s raw constants, state branches, palette bytes, and format labels when interpreted with the correct NTSC/PAL profile. Trust the broad course/entity topology and the explicit distinction between a course and its linked areas. Treat tertiary guide measurements as orientation only. Before coding, independently verify the course width convention and arithmetic; measure physics in the target ROM revision and frame cadence; establish exact collision boxes, timer/checkpoint/death flow, and enemy attack matrix; and label any RGB table as a named approximation. The data in these reports is a research lead, not a complete implementation specification. [physics assembly](https://raw.githubusercontent.com/oranguthang/smb1_src/main/src/game/player/physics.asm) [course format](https://github.com/bonimy/MushROMs/blob/master/doc/SMB1%20Level%20Format.md) [disassembly](https://github.com/pgattic/smb1-disasm/blob/master/main.asm)
