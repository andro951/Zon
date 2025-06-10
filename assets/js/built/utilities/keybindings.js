"use strict";

Zon.Keybindings = {};

Zon.Keybindings.pressedKeys = new Set();
Zon.Keybindings.registeredKeyPressActions = new Map();
Zon.Keybindings.registeredKeyDownActions = new Map();
Zon.Keybindings.registeredKeyUpActions = new Map();
Zon.Keybindings.registerKeyPress = (key, action) => {
    let actions = Zon.Keybindings.registeredKeyPressActions.get(key);
    if (!actions) {
        actions = new Actions.Action();
        Zon.Keybindings.registeredKeyPressActions.set(key, actions);
    }

    actions.add(action);
}
Zon.Keybindings.registerKeyDown = (key, action) => {
    let actions = Zon.Keybindings.registeredKeyDownActions.get(key);
    if (!actions) {
        actions = new Actions.Action();
        Zon.Keybindings.registeredKeyDownActions.set(key, actions);
    }

    actions.add(action);
}
Zon.Keybindings.registerKeyUp = (key, action) => {
    let actions = Zon.Keybindings.registeredKeyUpActions.get(key);
    if (!actions) {
        actions = new Actions.Action();
        Zon.Keybindings.registeredKeyUpActions.set(key, actions);
    }

    actions.add(action);
}

document.addEventListener('keydown', (event) => {
    const actions = Zon.Keybindings.registeredKeyDownActions.get(event.key);
    if (actions)
        actions.call();

    if (Zon.Keybindings.pressedKeys.has(event.key)) {
        return;
    }

    const pressActions = Zon.Keybindings.registeredKeyPressActions.get(event.key);
    if (pressActions)
        pressActions.call();

    Zon.Keybindings.pressedKeys.add(event.key);
    //if (zonDebug) console.log(`Key pressed: ${event.key}`);
});

document.addEventListener('keyup', (event) => {
    Zon.Keybindings.pressedKeys.delete(event.key);
    const actions = Zon.Keybindings.registeredKeyUpActions.get(event.key);
    if (actions)
        actions.call();
});