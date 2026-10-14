pragma ComponentBehavior: Bound
import QtQuick
import qs.Ui as Ui
import qs.Commons
import "Mario.js" as Mario
import "Art.js" as Art

Ui.Panel {
    id: root

    moduleName: "io.github.alexwest1981.omario"
    ipcTarget: "io.github.alexwest1981.omario"
    implicitWidth: button.implicitWidth
    implicitHeight: button.implicitHeight

    property var game: Mario.newGame()
    property int rev: 0
    property bool paused: true
    property double lastStep: 0
    readonly property var keyState: ({ left: false, right: false, jump: false, run: false })

    // The game state is one plain JS object: mutating it does not notify QML,
    // so every binding that shows live state reads `rev` (bumped each step)
    // first. The HUD goes through this one property.
    readonly property var hud: { root.rev; return Mario.hud(root.game) }

    readonly property int viewW: 256 * 3
    readonly property int viewH: 240 * 3

    function advance() {
        var now = Date.now()
        var dt = root.lastStep > 0 ? (now - root.lastStep) / 1000 : 1 / 60
        root.lastStep = now
        Mario.step(root.game, dt, root.keyState)
        root.rev++
    }

    function hold(name, down) {
        root.keyState[name] = down
        if (name === "jump" && down) root.paused = false
    }

    function keyEvent(event, down) {
        var k = event.key
        if (k === Qt.Key_Left || k === Qt.Key_A) root.hold("left", down)
        else if (k === Qt.Key_Right || k === Qt.Key_D) root.hold("right", down)
        else if (k === Qt.Key_Space || k === Qt.Key_Up || k === Qt.Key_W || k === Qt.Key_X) root.hold("jump", down)
        else if (k === Qt.Key_Shift) root.hold("run", down)
        else if (!down || event.isAutoRepeat) return
        else if (k === Qt.Key_R) { Mario.restart(root.game); root.paused = false; root.rev++ }
        else if (k === Qt.Key_P) root.paused = !root.paused
        else if (k === Qt.Key_Escape) { root.close(); return }
        else return
        event.accepted = true
    }

    // released keys must not stick when the panel is dismissed mid-run
    function releaseAll() {
        root.keyState.left = false
        root.keyState.right = false
        root.keyState.jump = false
        root.keyState.run = false
    }

    onOpenedChanged: {
        releaseAll()
        root.lastStep = 0
        if (root.opened) root.paused = false
        else root.paused = true
    }

    Timer {
        interval: 16
        repeat: true
        running: root.opened && !root.paused
        onRunningChanged: if (running) root.lastStep = 0
        onTriggered: root.advance()
    }

    Ui.WidgetButton {
        id: button
        bar: root.bar
        text: "M"
        fontFamily: "DejaVu Sans Mono"
        fontSize: Style.bar.iconFont
        tooltipText: "Super Mario Bros - click to play"
        onPressed: function(mouseButton) { root.toggle() }
    }

    Ui.KeyboardPanel {
        id: popup
        anchorItem: button
        owner: root
        bar: root.bar
        open: root.opened
        focusTarget: keyStage
        padding: 0
        centerOnBar: true
        contentWidth: fittedContentWidth(root.viewW + 28)
        contentHeight: cappedContentHeight(root.viewH + 96)

        Item {
            id: keyStage
            anchors.fill: parent
            focus: true
            clip: true
            Keys.priority: Keys.BeforeItem
            Keys.onPressed: function(e) { root.keyEvent(e, true) }
            Keys.onReleased: function(e) { root.keyEvent(e, false) }

            Rectangle {
                anchors.fill: parent
                radius: 12
                gradient: Gradient {
                    GradientStop { position: 0; color: "#1b2436" }
                    GradientStop { position: 1; color: "#0d1220" }
                }
            }

            Row {
                id: hud
                x: 16
                y: 8
                spacing: 26

                Text {
                    text: "MARIO"
                    color: Art.C.white
                    font.family: "DejaVu Sans Mono"
                    font.pixelSize: 14
                    font.bold: true
                    anchors.verticalCenter: parent.verticalCenter
                }
                Text {
                    text: ("000000" + Math.max(0, root.hud.score)).slice(-6)
                    color: Art.C.white
                    font.family: "DejaVu Sans Mono"
                    font.pixelSize: 14
                    anchors.verticalCenter: parent.verticalCenter
                }
                Text {
                    text: "COINS x" + ("0" + root.hud.coins).slice(-2)
                    color: Art.C.yellow
                    font.family: "DejaVu Sans Mono"
                    font.pixelSize: 14
                    anchors.verticalCenter: parent.verticalCenter
                }
                Text {
                    text: "WORLD " + root.hud.world
                    color: Art.C.white
                    font.family: "DejaVu Sans Mono"
                    font.pixelSize: 14
                    anchors.verticalCenter: parent.verticalCenter
                }
                Text {
                    text: "TIME " + root.hud.time
                    color: root.hud.time < 100 ? Art.C.red : Art.C.white
                    font.family: "DejaVu Sans Mono"
                    font.pixelSize: 14
                    anchors.verticalCenter: parent.verticalCenter
                }
                Text {
                    text: "LIVES x" + root.hud.lives
                    color: Art.C.white
                    font.family: "DejaVu Sans Mono"
                    font.pixelSize: 14
                    anchors.verticalCenter: parent.verticalCenter
                }
            }

            Text {
                anchors.right: parent.right
                anchors.rightMargin: 14
                y: 6
                text: root.paused ? "\u25B6 resume (P)" : "\u23F8 pause (P)"
                color: Art.C.white
                font.family: "DejaVu Sans Mono"
                font.pixelSize: 12
                MouseArea {
                    anchors.fill: parent
                    anchors.margins: -6
                    onClicked: root.paused = !root.paused
                }
            }

            GameView {
                id: gameView
                x: 14
                y: 34
                game: root.game
                rev: root.rev
            }

            Rectangle {
                anchors.fill: gameView
                visible: root.paused
                color: "#aa0d1220"

                Text {
                    anchors.centerIn: parent
                    text: "PAUSED"
                    color: Art.C.white
                    font.family: "DejaVu Sans Mono"
                    font.pixelSize: 24
                    font.bold: true
                }
            }

            Text {
                anchors.horizontalCenter: parent.horizontalCenter
                y: gameView.y + gameView.height + 8
                text: "left/right move  -  space jump  -  shift run  -  R restart  -  P pause  -  ESC close"
                color: "#8899bb"
                font.family: "DejaVu Sans Mono"
                font.pixelSize: 12
            }
        }
    }
}
