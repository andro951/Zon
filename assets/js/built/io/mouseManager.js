"use strict";

Zon.MouseManager = class MouseManager {
    constructor() {
        this.mouseIsDown = new Variable.Value(false, `MouseDown`);
        this.canvas.addEventListener('pointerdown', () => this.mouseIsDown.value = true);
        this.canvas.addEventListener('pointerup', () => this.mouseIsDown.value = false);
        this.canvas.addEventListener('pointercancel', () => this.mouseIsDown.value = false);
    }
}

Zon.mouseManager = new Zon.MouseManager();

Zon.MouseButtonID = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    BACK: 3,
    FORWARD: 4
}
Enum.freezeObj(Zon.MouseButtonID);