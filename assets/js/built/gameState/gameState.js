"use strict";

Zon.GameState = class {
    constructor() {
        if (new.target === Zon.GameState) {
            throw new TypeError("Cannot construct GameState instances directly");
        }
    }

    construct = () => {
        
    }

    destruct = () => {
        
    }
}