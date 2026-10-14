# SMB (NES, 1985): palette and rectangle metrics

## 1. 2C02 RGB table

This is the commonly used **2C02 approximation** (hex RGB, index is the PPU color code). It is a rendering convention: the 2C02 generates composite color, not RGB. There is no unique hardware RGB triplet. NESdev explains the composite encoding and the uncertainty in conversion; emulator/palette authors consequently produce visibly and numerically different tables. [source: https://www.nesdev.org/wiki/NTSC_video] [source: https://www.nesdev.org/wiki/PPU_palettes]

| 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
|---|---|---|---|---|---|---|---|
| #7C7C7C | #0000FC | #0000BC | #4428BC | #940084 | #A80020 | #A81000 | #881400 |
| 08 | 09 | 0A | 0B | 0C | 0D | 0E | 0F |
| #503000 | #007800 | #006800 | #005800 | #004058 | #000000 | #000000 | #000000 |
| 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
| #BCBCBC | #0078F8 | #0058F8 | #6844FC | #D800CC | #E40058 | #F83800 | #E45C10 |
| 18 | 19 | 1A | 1B | 1C | 1D | 1E | 1F |
| #AC7C00 | #00B800 | #00A800 | #00A844 | #008888 | #000000 | #000000 | #000000 |
| 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 |
| #F8F8F8 | #3CBCFC | #6888FC | #9878F8 | #F878F8 | #F85898 | #F87858 | #FCA044 |
| 28 | 29 | 2A | 2B | 2C | 2D | 2E | 2F |
| #F8B800 | #B8F818 | #58D854 | #58F898 | #00E8D8 | #787878 | #000000 | #000000 |
| 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 |
| #FCFCFC | #A4E4FC | #B8B8F8 | #D8B8F8 | #F8B8F8 | #F8A4C0 | #F0D0B0 | #FCE0A8 |
| 38 | 39 | 3A | 3B | 3C | 3D | 3E | 3F |
| #F8D878 | #D8F878 | #B8F8B8 | #B8F8D8 | #00FCFC | #F8D8F8 | #000000 | #000000 |

RGB table source: the common RGB conversion table reproduced in NES palette references. The RGB hex values are a single approximation family; the table should not be treated as a direct electrical specification. [source: https://en.wikipedia.org/wiki/List_of_video_game_console_palettes] [source: https://www.firebrandx.com/nespalette.html] NESdev documents substantial conversion/model differences, not a single numeric “author difference”; published palette sets differ in RGB values by model and by entry, sometimes by dozens of channel levels. [source: https://www.nesdev.org/wiki/NTSC_video] [source: https://www.nesdev.org/wiki/PPU_palettes]

## 2. SMB four-colour sub-palettes

NES palette RAM has a shared backdrop entry plus four background and four sprite palettes; each object's pixel selects one of the three nonzero colors in its selected palette. [source: https://www.nesdev.org/wiki/PPU_palettes] The SMB disassembly writes these 4-byte groups (first byte is universal backdrop, and is mirrored across groups): [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm]

| Context / group | Four PPU entries in game (hex color codes) | Purpose / evidence |
|---|---|---|
| Shared backdrop | `$0F` in standard day overworld; varies by area | universal/background color, e.g. `GroundPaletteData` starts `$0F`; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Background palette 0 | `$0F,$29,$1A,$0F` | Palette0 metatiles include bush, mountain, pipes, flagpole; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Background palette 1 | `$0F,$36,$17,$0F` | Palette1 metatiles include castle, bricks; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Background palette 2 | `$0F,$30,$21,$0F` | clouds and water/lava; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Background palette 3 | `$0F,$27,$17,$0F` | Question/empty blocks and axe; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Sprite palette 0 | `$0F,$16,$27,$18` | Mario palette (ROM map identifies Mario's 3 entries); [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Sprite palette 1 | `$0F,$1A,$30,$27` | Bowser palette and several enemies/objects; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Sprite palette 2 | `$0F,$16,$30,$27` | enemy/object palette group; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Sprite palette 3 | `$0F,$0F,$36,$17` | sprite palette group; [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |

**Caveat:** those rows describe the normal palette data, not invariant colors for every level/frame. The disassembly has distinct water, underground, castle, snow and rotating palettes; coin/question block palettes also cycle. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] The hardware arrangement is four entries per palette, but the first entry is transparent for sprites and shared backdrop for background. [source: https://www.nesdev.org/wiki/PPU_palettes]

## 3. Tile and actor boxes

An NES background pattern tile is 8×8 px; SMB's world blocks/metatiles combine four such patterns as a 2×2, 16×16 px unit. [source: https://www.nesdev.org/wiki/PPU_palettes]

| Object | Pixel box (W×H) | Source / confidence |
|---|---:|---|
| Small Mario | 16×16 | Common block-sized measurement; browser recreation measurement, cross-checked against original sprite dimensions. [source: https://supermario-game.com/blog/how-tall-is-mario] **Medium**: disassembly stores a multi-pose tilemap, not a single opaque rectangle. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Big Mario | 16×32 | [source: https://supermario-game.com/blog/how-tall-is-mario] **Medium** (same caveat) |
| Goomba | 16×16 | [source: https://supermario-game.com/blog/how-tall-is-mario] **Medium** |
| Koopa Troopa | 16×24 | [source: https://supermario-game.com/blog/how-tall-is-mario] **Medium** |
| Mushroom | 16×16 | [reasoning] Common 2×2 metatile-sized object; no text-only primary source in this research states its bounding box. |
| Coin | 8×16 | [reasoning] SMB coin animation is sprite/tile based; no inspected text source gave a single bounding box. |
| Bowser | 32×32 | [source: https://supermario-game.com/blog/how-tall-is-mario] **Medium** |

These are logical art boxes, not necessarily collision boxes or opaque-pixel extents. Source that reports the character dimensions states that its measurements came from object definitions and that sprite-size cross-checks were used. [source: https://supermario-game.com/blog/how-tall-is-mario]

## 4. Object palette attribution (normal day-overworld unless stated)

Palette color-code numbers below are the NES PPU indices, not RGB. The disassembly maps metatile classes to palette tables and loads the palettes by area; its comments give the most direct attribution available. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm]

| Object | Palette group / color codes | Attribution and confidence |
|---|---|---|
| Mario | Sprite palette `$0F,$16,$27,$18` | ROM map explicitly labels `$05E8–$05EA` Mario's palette; disassembly `GroundPaletteData` shows the group. High. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Ground | Background palette 0 `$0F,$29,$1A,$0F` | `Palette0_MTiles` assigns ground/terrain-family tiles. High. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Bricks | Background palette 1 `$0F,$36,$17,$0F` | `Palette1_MTiles` labels breakable bricks. High. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Pipes | Background palette 0 in ordinary overworld; level palettes may override | `Palette0_MTiles` labels pipe tiles. High for normal overworld; varies by level. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Clouds | Background palette 2 `$0F,$30,$21,$0F` | `Palette2_MTiles` labels cloud tiles. High. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Bushes | Background palette 0 `$0F,$29,$1A,$0F` | `Palette0_MTiles` labels bush tiles. High. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Hills / mountains | Background palette 0 `$0F,$29,$1A,$0F` | `Palette0_MTiles` labels mountain tiles. High. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Castle | Background palette 1; castle area uses separate palette data | `Palette1_MTiles` castle tiles; `CastlePaletteData` area values differ. Medium-high. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Bowser | Sprite palette `$0F,$1A,$30,$27` (`BowserPaletteData`) | Explicit label in disassembly. High. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Coins | Background palette 3 tile family; sprite/coin palettes cycle by state | `Palette3_MTiles` labels coin metatile; ROM map documents coin/question palette cycling. Medium. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Question blocks | Background palette 3 `$0F,$27,$17,$0F` | `Palette3_MTiles` labels question blocks; colors can cycle/change. Medium-high. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |

**Source disagreement:** generic descriptions may call these colors “sprite palettes” or “background palettes” imprecisely. In the actual ROM, clouds, terrain and blocks are background metatiles; character/object art uses OAM sprites. The disassembly's `Palette*_MTiles` table resolves that distinction. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] [source: https://www.nesdev.org/wiki/PPU_palettes]

## 5. Screen and status strip

The rendered NES frame is 256×240 px, i.e. 16×15 metatiles. SMB reserves the top 32 scanlines for the HUD/status bar; the remaining playfield is 208 px = 13 metatile rows. [source: https://github.com/MrRoblick/ppu2c02-luau] [source: https://forums.nesdev.org/viewtopic.php?p=134797]

| Region | Metatile dimensions | Layout |
|---|---:|---|
| Full raster | 16 columns × 15 rows | 256×240 pixels at 16 px per metatile. [source: https://github.com/MrRoblick/ppu2c02-luau] |
| Playfield | 16 columns × 13 rows | begins after the two-row status strip. [source: https://forums.nesdev.org/viewtopic.php?p=134797] |
| Status strip | 16 columns × 2 rows | HUD is drawn in a two-row-high band at the top. [source: https://forums.nesdev.org/viewtopic.php?p=134797] |
| Status content | screen columns 0–15 | Top row: MARIO and score at left, coin icon/count around columns 6–7, WORLD and level around columns 9–11, TIME at right; lower row carries the corresponding digits. Exact character columns vary with digit count. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |

The 32-column status convention is tiles of 8×8, hence two 8-pixel text rows rather than two 16-pixel metatile rows. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] [source: https://www.nesdev.org/wiki/PPU_palettes]

## 6. Landmark and decor dimensions

The table distinguishes explicit dimensions in a source from practical metatile deductions. “Off ground” means the bottom of the visible object above the top surface of the ground row, not a hidden collision extent. Where the source material inspected did not state a dimension as text, the requested value is left unestablished instead of reverse-engineered from an image. [reasoning]

| Feature | Width | Height | Placement above ground | Basis |
|---|---:|---:|---:|---|
| Flagpole | Not established | Not established | ground-level; exact offset not established | The disassembly identifies separate flagpole ball and shaft components but supplies no text dimension/count. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| End castle | Not established | Not established | ground-level | Disassembly defines component castle metatiles but gives no prose overall dimensions. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Small cloud | Not established | Not established | floating; exact height not established | Source discusses set decoration but supplies no dimensions in text. [source: https://www.gamedeveloper.com/design/the-long-shadow-of-i-super-mario-bros-i-] |
| Bush | Not established | Not established | ground-level | The metatile list identifies bush components, no overall width/height. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |
| Hill / mountain | Not established | Not established | ground-level | The metatile list identifies mountain components, no overall height/width. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm] |

The SMB world is composed from 16×16 metatiles assembled from 8×8 CHR patterns, and the disassembly names component pieces (cloud/bush/mountain/castle) rather than publishing a single fixed size: decor instances are assembled at different widths/heights. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm]

## What I could not establish

- A uniquely correct 64-entry RGB table for physical 2C02 output; the chip emits composite video and RGB tables depend on conversion/emulator author. [source: https://www.nesdev.org/wiki/NTSC_video]
- A numeric cross-author RGB error range for palette tables; the sources explain variability but do not publish one comparable all-authors dataset. [source: https://www.nesdev.org/wiki/NTSC_video] [source: https://www.firebrandx.com/nespalette.html]
- Exact opaque-pixel boxes for all poses of Mario, enemies, mushroom and coin from text-only sources. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm]
- A stable per-level four-subpalette assignment for all listed objects; the game replaces and cycles palette data by level and animation state. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm]
- Exact fixed status-bar character columns for dynamic score, coins and timer values; the disassembly stores screen text and updates numeric fields dynamically. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm]
- Source-established exact overall metatile width/height and above-ground placement for the castle and each background-decor instance. Text sources inspected identify their component tiles but not a canonical assembled dimension. [source: https://github.com/pgattic/smb1-disasm/blob/master/main.asm]
