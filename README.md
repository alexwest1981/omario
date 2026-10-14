# OmaRio

A Super Mario Bros style platformer you play straight from the Omarchy bar.

![OmaRio](preview.png)

## Install

```bash
omarchy plugin add https://github.com/alexwest1981/omario --enable
```

The **M** button then appears in the bar (right section, by default). Move it
with the bar settings if you want it somewhere else.

## Remove

```bash
omarchy plugin remove io.github.alexwest1981.omario --yes
```

Removing takes the folder out of `~/.config/omarchy/plugins/` and drops it from
`shell.json`, so nothing is left behind. The plugin writes no files at all — no
save games, no config, no cache.

## Play

Click the **M** in the bar to open the panel. The game keeps running while the
panel is open and pauses by itself when it closes.

| key | action |
|---|---|
| `←` `→` or `A` `D` | walk |
| `Space` / `↑` / `W` / `X` | jump (hold for a higher jump) |
| `Shift` | run |
| `P` | pause |
| `R` | restart the level |
| `Esc` | close the panel |

## World 1-1

Ground with three pits, four pipes, ? blocks and bricks, free-floating coins,
twelve goombas, a staircase and a flagpole. Stomp a goomba (+100), collect a
coin (+200), bump a ? block (+200), break a brick as big Mario (+50), reach the
flagpole (+1000 and 10 per unit of time left). Three lives; the clock runs at
2.5 units per second from 400 and an empty clock costs a life.

The one mushroom block (column 23) makes Mario big: with it he survives one hit
(shrinking instead of dying) and can break bricks from below. Bumping a coin
brick pays a coin; the mushroom slides out of its block before it walks.

## Layout of the code

| file | what it is |
|---|---|
| `Mario.js` | the whole game: level data, physics, collision, enemies, scoring. No rendering. |
| `Art.js` | every sprite: characters are pixel maps (one character per pixel, run-length merged into rectangles) and the tiles are placed rectangles. |
| `GameView.qml` | the playfield: 256x240 level pixels scaled 3x, drawn as rectangles. |
| `BarWidget.qml` | the bar button, the popup card, the HUD, the game loop and key handling. |
| `MarioSprite.qml` | draws one sprite (a fixed number of rect slots) from an art list. |

Two things are worth knowing before editing:

* **The game state is one plain JS object.** Mutating it does not notify QML
  bindings, so every binding that shows live state reads `rev` first (bumped
  once per step). The HUD goes through `root.hud`.
* **No canvas and no textures.** Everything is rectangles, so the level can be
  as long as it likes: the static tiles never re-evaluate their art, and only
  `rev`-reading bindings (mario, enemies, items, blocks) do work per frame.

## Tests

```bash
node tests/mario.test.js     # 27 checks: physics, blocks, enemies, death, flag, fuzz, fixed timestep, art
```

`Mario.js` carries a `.pragma library` first line for QML; the test strips it and
loads the file in its own `vm` context, so the exact same game code runs under
node.

## Dependencies and assets

None. No network access, no external commands, nothing to install beyond
Omarchy itself. Every sprite is drawn from rectangles defined in `Art.js`, which
is also why the plugin has no Nintendo artwork in it: the level, the cast and
the sprites are original, written for this plugin.

## License

MIT — see [LICENSE](LICENSE).
