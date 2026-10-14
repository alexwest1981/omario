import QtQuick
import "Mario.js" as Mario
import "Art.js" as Art

// The playfield. Everything is a rectangle sprite: no canvas, no textures.
// The game state is plain JS, which does not notify QML bindings, so every
// dynamic binding reads `rev` first — the widget bumps it after each step.
Item {
    id: view

    property var game
    property int rev: 0
    readonly property int zoom: 3

    implicitWidth: Mario.VIEW_W * zoom
    implicitHeight: Mario.VIEW_H * zoom

    function pickDecor(name) {
        var out = [], d = view.game.def.decor
        for (var i = 0; i < d.length; i++) if (d[i][2] === name) out.push(d[i])
        return out
    }
    function decorArt(name) {
        if (name === "hillBig") return Art.hill(true)
        if (name === "hill") return Art.hill(false)
        if (name === "bush") return Art.bush()
        if (name === "castle") return Art.castle()
        return Art.cloud()
    }

    Item {
        id: stage
        width: Mario.VIEW_W
        height: Mario.VIEW_H
        scale: view.zoom
        transformOrigin: Item.TopLeft
        clip: true

        Rectangle {
            anchors.fill: parent
            color: Art.C.sky
        }

        // clouds, half speed
        Item {
            id: farLayer
            x: { view.rev; return -Math.round(view.game.camX * 0.5) }

            Repeater {
                model: view.pickDecor("cloud")

                delegate: Item {
                    required property var modelData
                    x: modelData[0] * 16
                    y: modelData[1] * 16

                    MarioSprite {
                        slots: 3
                        art: view.decorArt(modelData[2])
                    }
                }
            }
        }

        // the world: tiles, blocks, decor, items, enemies, mario
        Item {
            id: world
            x: { view.rev; return -Math.round(view.game.camX) }

            Item {
                id: nearLayer

                Repeater {
                    model: view.game.def.decor

                    delegate: MarioSprite {
                        required property var modelData
                        visible: modelData[2] !== "cloud"
                        x: modelData[0] * 16
                        y: modelData[1] * 16
                        slots: 12
                        art: view.decorArt(modelData[2])
                    }
                }

                MarioSprite {
                    id: flagSprite
                    x: view.game.def.flag * 16 - 14
                    y: 5 * 16
                    slots: 4
                    art: Art.flag()
                }
            }

            // static tiles: art is computed once (it can never change)
            Repeater {
                model: view.game.render.statics

                delegate: MarioSprite {
                    required property var modelData
                    x: modelData.x
                    y: modelData.y
                    slots: modelData.ch === "G" ? 3 : 8
                    art: Art.tile(modelData.ch, modelData.top, modelData.left)
                }
            }

            // bricks and ? blocks: may turn into used blocks or vanish
            Repeater {
                model: view.game.render.blocks

                delegate: MarioSprite {
                    required property var modelData
                    readonly property int col: modelData.x / 16
                    readonly property int row: modelData.y / 16
                    readonly property string ch: { view.rev; return Mario.at(view.game.grid, col, row) }
                    readonly property real bump: { view.rev; return Mario.bumpOffset(view.game, col, row) }

                    visible: ch !== " "
                    x: modelData.x
                    y: modelData.y + bump
                    slots: 8
                    art: { view.rev; return Art.tile(ch, false, false) }
                }
            }

            Repeater {
                model: 32

                delegate: MarioSprite {
                    required property int index
                    readonly property var it: { view.rev; return view.game.items[index] }

                    visible: it ? it.active : false
                    x: it ? Math.round(it.x) : 0
                    y: it ? Math.round(it.y) : 0
                    slots: Art.SLOT_COUNT.item
                    art: { view.rev; return Art.item(it) }
                }
            }

            Repeater {
                model: 24

                delegate: MarioSprite {
                    required property int index
                    readonly property var e: { view.rev; return view.game.ents[index] }

                    visible: e ? e.active : false
                    x: e ? Math.round(e.x) - 1 : 0
                    y: e ? Math.round(e.y) : 0
                    slots: Art.SLOT_COUNT.goomba
                    art: { view.rev; return Art.goomba(e) }
                }
            }

            MarioSprite {
                id: marioSprite
                slots: Art.SLOT_COUNT.mario
                x: { view.rev; return Math.round(view.game.mario.x) - 2 }
                y: { view.rev; var m = view.game.mario; return Math.round(m.y) - (m.big ? 2 : 0) }
                opacity: {
                    view.rev
                    var m = view.game.mario
                    if (m.dead) return 1
                    return (m.invuln > 0 && Math.floor(m.invuln * 10) % 2 === 1) ? 0.35 : 1
                }
                art: { view.rev; return Art.mario(view.game.mario) }
            }
        }

        Text {
            anchors.centerIn: parent
            visible: { view.rev; return view.game.status === "clear" }
            text: "COURSE CLEAR!"
            color: Art.C.white
            font.family: "DejaVu Sans Mono"
            font.pixelSize: 16
            style: Text.Outline
            styleColor: Art.C.dark
        }

        Text {
            anchors.centerIn: parent
            visible: { view.rev; return view.game.status === "gameover" }
            text: "GAME OVER\nPRESS R"
            horizontalAlignment: Text.AlignHCenter
            color: Art.C.white
            font.family: "DejaVu Sans Mono"
            font.pixelSize: 16
            style: Text.Outline
            styleColor: Art.C.dark
        }
    }
}
