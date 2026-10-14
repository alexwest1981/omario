import QtQuick

// One sprite = one Repeater of Rectangles. `slots` is fixed for the lifetime
// of the sprite (max rects any of its frames uses), so a frame change only
// re-evaluates bindings instead of rebuilding delegates.
Item {
    id: root

    property var art: []
    property int slots: 8

    Repeater {
        model: root.slots

        delegate: Rectangle {
            required property int index
            readonly property var r: root.art ? root.art[index] : undefined

            visible: r !== undefined
            x: r ? r[0] : 0
            y: r ? r[1] : 0
            width: r ? r[2] : 0
            height: r ? r[3] : 0
            color: r ? r[4] : "transparent"
        }
    }
}
