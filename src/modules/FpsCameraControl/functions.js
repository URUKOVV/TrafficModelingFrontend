export function keyFlags(keyCode, isPress, currentBackward, currentForward, currentLeft, currentRight, currentShift) {
    let keys = [currentBackward, currentForward, currentLeft, currentRight, currentShift]
    // backward, forward, left, right
    switch (keyCode) {
        case 83:
            keys[0] = isPress
            break
        case 87:
            keys[1] = isPress
            break
        case 65:
            keys[2] = isPress
            break
        case 68:
            keys[3] = isPress
            break
        case 16:
            keys[4] = isPress
            break
        default:
            break
    }
    return keys
}

export function mouseFlags(keyCode, isPress, currentMouseLButton) {
    let keys = [currentMouseLButton]
    switch (keyCode) {
        case 1:
            keys[0] = isPress
            break
        case 3:
            break
        default:
            break
    }
    return keys
}