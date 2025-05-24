"use strict";

Zon.GameStateGame = class extends Zon.GameState {
    constructor() {
        super();
    }
    construct = () => {
        Zon.gameUIState.show();
        Zon.mainButtonsUIState.show();

        Zon.Setup.start();
    }

    destruct = () => {
        
    }
}