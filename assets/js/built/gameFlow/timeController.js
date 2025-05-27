"use strict";

Zon.TimeController = class {
    constructor() {
        this.skipSetupLevel = false;
        this.startTimeMilliseconds = 0;
        this.timeMilliseconds = 0;
        this.lastTimeMilliseconds = 0;
        this.deltaTimeMilliseconds = 0;
        this.timeSeconds = 0;
        this.lastTimeSeconds = 0;
        this.deltaTimeSeconds = 0;
        this.gameStarted = false;
        this.paused = false;
        this.targetFPS = new Variable.Value(60);
        this.targetTimePerFrameMilliseconds = new Variable.Dependent(() => 1000 / this.targetFPS.value);
    }

    postLoadSetup = () => {
        
    }

    onStartGame = () => {
        this.deltaTimeMilliseconds = 0;
        this.startTimeMilliseconds = performance.now();
        this.timeMilliseconds = this.startTimeMilliseconds;
        this.lastTimeMilliseconds = this.timeMilliseconds;
        this.timeSeconds = this.startTimeMilliseconds / 1000;
        this.lastTimeSeconds = this.timeSeconds;
        this.deltaTimeSeconds = 0;
        this.resume();
        this.gameStarted = true;
    }

    updateLoopTime = () => {
        const currentTimeMilliseconds = performance.now();
        this.deltaTimeMilliseconds = currentTimeMilliseconds - this.lastTimeMilliseconds;
        this.lastTimeMilliseconds = this.timeMilliseconds;
        this.timeMilliseconds = currentTimeMilliseconds;
        
        this.deltaTimeSeconds = this.deltaTimeMilliseconds / 1000;
        this.lastTimeSeconds = this.timeSeconds;
        this.timeSeconds = currentTimeMilliseconds / 1000;
    }

    onLevelCompleted = (levelData) => {

    }

    onSetupLevelBeforeBlocksManager = () => {

    }

    pause = () => {
        if (this.paused)
            return;

        this.paused = true;
        Zon.GameManager.onPause();
    }

    resume = () => {
        if (!this.paused)
            return;

        this.paused = false;
        Zon.GameManager.onResume();
    }
}

Zon.timeController = new Zon.TimeController();