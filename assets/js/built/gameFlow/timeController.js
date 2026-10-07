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
        this.pausedByMinimizingGame = false;
        this.timePaused = 0;
        this.timeResumed = 0;
        this.totalTimePaused = 0;
        this.targetFPS = new Variable.Value(60, `TargetFPS`);
        this.targetTimePerFrameMilliseconds = new Variable.Dependent(() => 1000 / this.targetFPS.value, `TargetTimePerFrameMilliseconds`, { this: this });

        this.onPauseActions = new Actions.Action(`On Pause`);
        this.onResumeActions = new Actions.Action(`On Resume`);

        this.onMinimizedWindowActions = new Actions.Action(`On Minimize Window`);
        this.onMaximizedWindowActions = new Actions.Action(`On Maximize Window`);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                //console.log(`Window minimized or lost focus. Pausing game.`);
                if (!this.paused) {
                    //console.log(`Pausing game and calling onMinimizedWindowActions.`);
                    this.pause();
                    this.pausedByMinimizingGame = true;
                    this.onMinimizedWindowActions.call();
                }
            } else {
                //console.log(`Window maximized or gained focus. Resuming game.`);
                if (this.pausedByMinimizingGame) {
                    if (!this.paused)
                        throw new Error("Game should be paused when it is minimized, but it wasn't.");

                    //console.log(`Resuming game and calling onMaximizedWindowActions.`);

                    this.onMaximizedWindowActions.call();

                    this.resume();

                    this.pausedByMinimizingGame = false;
                }
            }
        });
    }

    postLoadSetup = () => {
        
    }

    onStartGame = () => {
        this.deltaTimeMilliseconds = 0;
        this.startTimeMilliseconds = performance.now();
        this.timeMilliseconds = this.startTimeMilliseconds;
        this.lastTimeMilliseconds = this.timeMilliseconds;
        this.timeSeconds = this.startTimeMilliseconds * 0.001;
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
        
        this.deltaTimeSeconds = this.deltaTimeMilliseconds * 0.001;
        this.lastTimeSeconds = this.timeSeconds;
        this.timeSeconds = currentTimeMilliseconds * 0.001;
    }

    onLevelCompleted = (levelData) => {

    }

    onSetupLevelBeforeBlocksManager = () => {

    }

    pause = () => {
        if (this.paused)
            return;

        this.paused = true;
        this.timePaused = performance.now();
        Zon.GameManager.onPause();
        this.onPauseActions.call();
    }

    resume = () => {
        if (!this.paused)
            return;

        this.paused = false;
        this.timeResumed = performance.now();
        this.totalTimePaused = this.timeResumed - this.timePaused;
        Zon.GameManager.onResume();
        this.onResumeActions.call();
        this.timePaused = 0;
        this.timeResumed = 0;
        this.totalTimePaused = 0;
    }

    onSwitchStage = () => {
        
    }
}

Zon.timeController = new Zon.TimeController();