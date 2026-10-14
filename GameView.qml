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
        if (name === "lava") return Art.lava()
        if (name === "pillar") return Art.pillar()
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
            // the castle course is indoors: dark backdrop, lava and pillars
            color: { view.rev; return view.game.def.castle ? "#181018" : Art.C.sky }
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
                    // the castle ends at the axe, not at a flagpole
                    visible: { view.rev; return !view.game.def.castle }
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
                    readonly property var it: view.game.items[index]

                    // Every binding below reads `rev` itself. A binding whose only
                    // dependency is an intermediate `var` property never re-evaluates:
                    // the property returns the same object every frame, so QML sees no
                    // change and sends no notify (the sprite then froze at its spawn
                    // position while the game kept moving it).
                    visible: { view.rev; return it ? it.active : false }
                    x: { view.rev; return it ? Math.round(it.x) : 0 }
                    y: { view.rev; return it ? Math.round(it.y) : 0 }
                    slots: Art.SLOT_COUNT.item
                    art: { view.rev; return Art.item(it) }
                }
            }

            Repeater {
                model: 4

                delegate: MarioSprite {
                    required property int index
                    readonly property var sk: view.game.shots[index]

                    visible: { view.rev; return sk ? sk.active : false }
                    x: { view.rev; return sk ? Math.round(sk.x) - 3 : 0 }
                    y: { view.rev; return sk ? Math.round(sk.y) - 3 : 0 }
                    slots: Art.SLOT_COUNT.shot
                    art: { view.rev; return sk ? Art.shot(sk) : [] }
                }
            }

            Repeater {
                model: 24

                delegate: MarioSprite {
                    required property int index
                    readonly property var e: view.game.ents[index]

                    visible: { view.rev; return e ? e.active : false }   // see the items delegate
                    x: { view.rev; return e ? Math.round(e.x) - 1 : 0 }
                    y: { view.rev; return e ? Math.round(e.y) : 0 }
                    slots: Art.SLOT_COUNT.enemy
                    art: { view.rev; return Art.enemy(e) }
                }
            }

            MarioSprite {
                id: bowserSprite
                visible: { view.rev; return !!view.game.bowser }
                x: { view.rev; return view.game.bowser ? Math.round(view.game.bowser.x) : 0 }
                y: { view.rev; return view.game.bowser ? Math.round(view.game.bowser.y) : 0 }
                slots: Art.SLOT_COUNT.char
                art: { view.rev; return view.game.bowser ? Art.bowser(view.game.bowser) : [] }
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

        // Toad's story screen and the ending, in their own scaled layer so the
        // sprites keep the level's pixel size and the text keeps the game's look.
        Item {
            id: story
            anchors.centerIn: parent
            width: Mario.VIEW_W
            height: Mario.VIEW_H
            scale: view.zoom
            transformOrigin: Item.Center

            Rectangle {
                anchors.fill: parent
                color: "#000000"
                opacity: 0.72
                visible: { view.rev; return view.game.status === "title" || view.game.status === "won" }
            }

            MarioSprite {
                visible: { view.rev; return view.game.status === "title" }
                x: 112
                y: 60
                slots: Art.SLOT_COUNT.char
                art: Art.char("toad")
            }

            MarioSprite {
                visible: { view.rev; return view.game.status === "won" }
                x: 112
                y: 60
                slots: Art.SLOT_COUNT.char
                art: Art.char("princess")
            }

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                y: 96
                visible: { view.rev; return view.game.status === "title" }
                text: "THE PRINCESS IS IN ANOTHER CASTLE!\n\nBOWSER TOOK HER - GO GET HIM\n\nPRESS SPACE"
                horizontalAlignment: Text.AlignHCenter
                color: Art.C.white
                font.family: "DejaVu Sans Mono"
                font.pixelSize: 8
            }

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                y: 96
                visible: { view.rev; return view.game.status === "won" }
                text: "THANK YOU MARIO!\n\nYOUR QUEST IS OVER\n\nPRESS R TO PLAY AGAIN"
                horizontalAlignment: Text.AlignHCenter
                color: Art.C.white
                font.family: "DejaVu Sans Mono"
                font.pixelSize: 8
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
