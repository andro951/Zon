"use strict";

Zon.GameManager = {};

Zon.GameManager.gameState = null;
Zon.GameManager.gameStateGame = null;

Zon.GameManager.start = () => {
    Zon.GameManager.gameState.construct();
}

Zon.GameManager.saveGame = () => {
    Zon.IOManager.saveGameAsync();
}

Zon.GameManager.preLoadSetup = () => {
    Zon.GameManager.gameState = new Zon.GameStateMainMenu();
}

Zon.Setup.preLoadSetupActions.add(Zon.GameManager.preLoadSetup);

Zon.GameManager.changeState = (newState) => {
    if (Zon.GameManager.gameState) {
        Zon.GameManager.gameState.destruct();
    }

    Zon.GameManager.gameState = newState;
    Zon.GameManager.gameState.construct();
}

Zon.GameManager.createGameStateGame = () => {
    Zon.GameManager.gameStateGame = new Zon.GameStateGame();
    Zon.GameManager.returnToGameStateGame();
    Zon.GameManager.gameStateGame.construct();
}

Zon.GameManager.returnToGameStateGame = () => {
    if (Zon.GameManager.gameState)
        Zon.GameManager.gameState.destruct();

    Zon.GameManager.gameState = null;
}

Zon.GameManager.onPause = () => {
    Zon.gameUIState.onPause();
}

Zon.GameManager.onResume = () => {
    Zon.gameUIState.onResume();
}

Zon.GameManager.onPauseClick = () => {
    if (Zon.timeController.paused) {
        Zon.GameManager.returnToGameStateGame();
    }
    else {
        Zon.GameManager.changeState(new Zon.GameStatePause());
    }
}