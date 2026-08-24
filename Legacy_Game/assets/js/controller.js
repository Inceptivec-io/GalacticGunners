var controllerButtonLocks = {};

const ControllerButtons = {
    fire: [2],
    nuke: [3],
    start: [9],
    restart: [9],
    pause: [8, 9],
    info: [1, 3],
    resume: [9],
    mute: [8],
    left: [14],
    right: [15],
    up: [12],
    down: [13]
};

function getController() {
    if (!navigator.getGamepads) {
        return null;
    }

    var pads = navigator.getGamepads();

    for (var i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) {
            return pads[i];
        }
    }

    return null;
}

function controllerButtonDown(pad, buttonIndexes) {
    if (!pad || !pad.buttons) {
        return false;
    }

    for (var i = 0; i < buttonIndexes.length; i++) {
        var button = pad.buttons[buttonIndexes[i]];

        if (button && button.pressed) {
            return true;
        }
    }

    return false;
}

function controllerDirectionDown(direction) {
    var pad = getController();

    if (!pad) {
        return false;
    }

    if (controllerButtonDown(pad, ControllerButtons[direction])) {
        return true;
    }

    var deadzone = 0.35;
    var horizontal = pad.axes && pad.axes.length > 0 ? pad.axes[0] : 0;
    var vertical = pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0;

    return (direction == "left" && horizontal < -deadzone) ||
        (direction == "right" && horizontal > deadzone) ||
        (direction == "up" && vertical < -deadzone) ||
        (direction == "down" && vertical > deadzone);
}

function controllerActionDown(action) {
    return controllerButtonDown(getController(), ControllerButtons[action] || []);
}

function controllerActionPressed(action) {
    var isDown = controllerActionDown(action);

    if (isDown && !controllerButtonLocks[action]) {
        controllerButtonLocks[action] = true;
        return true;
    }

    if (!isDown) {
        controllerButtonLocks[action] = false;
    }

    return false;
}
