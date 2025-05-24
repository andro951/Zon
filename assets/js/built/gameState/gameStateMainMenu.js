"use strict";

Zon.GameStateMainMenu = class extends Zon.GameState {
    constructor() {
        super();
    }

    construct = () => {
        Zon.mainMenuUIState.show();
        Zon.GameManager.createGameStateGame();//TODO: remove this.  It's supposed to be a button on the main menu.
    }

    destruct = () => {
        Zon.mainMenuUIState.hide();
    }

    onClickStart = () => {
        Zon.GameManager.createGameStateGame();
    }
}