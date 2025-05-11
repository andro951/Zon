"use strict";

Zon.game = undefined;
Zon.Game = class {
    constructor() {
        this.loopStarted = false;
        this.loopInterval = undefined;
        this.TICK_INTERVAL = 10;// 100 FPS
        //this.dummyGame = new DummyGame();
    }

    start() {
        // Game start logic
        console.log("Game started");
        this.loopInterval = window.setInterval(this.loop.bind(this), this.TICK_INTERVAL);
    }

    loop() {
        // Game loop logic
        //console.log("Game loop running", performance.now());
        //this.dummyGame.update();
        // Update game state, render, etc.
    }
};
Zon.initGame = function() {
    this.game = new this.Game();
}