"use strict";

Zon.game = undefined;
Zon.Game = class {
    constructor() {
        this.loopStarted = false;
        this.loopInterval = undefined;
        this.TICK_INTERVAL = 10;// 100 FPS
        this.FPS = 1000 / this.TICK_INTERVAL;
        this.prestigeCount = 0;
        this.lateUpdate = new Actions.Action();
        this.lateDraw = new Actions.Action();
        //this.dummyGame = new DummyGame();
    }

    start = () => {
        // Game start logic
        console.log("Game started");

        this.loopInterval = window.setInterval(this.loop.bind(this), this.TICK_INTERVAL);
    }

    loop = () => {
        this.updateLoop(this.getUpdateSpeed());
        this.drawLoop();
        // Game loop logic
        //console.log("Game loop running", performance.now());
        //this.dummyGame.update();
    }

    getUpdateSpeed = () => {
        return 1;
    }

    updateLoop = (updatesToRun) => {
        for (let i = 0; i < updatesToRun; i++) {
            Zon.balls.forEach((ball) => ball.update());
            this.lateUpdate.call();
        }
    }

    drawLoop = () => {
        Zon.combatUI.clearCanvas();
        Zon.balls.forEach((ball) => ball.draw());
        this.lateDraw.call();
    }
};