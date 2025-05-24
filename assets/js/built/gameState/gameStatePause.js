"use strict";

Zon.GameStatePause = class extends Zon.GameState {
    constructor() {
        super();
    }

    construct = () => {
        Zon.timeController.paused();
    }

    destruct = () => {
        Zon.timeController.resume();
    }
}