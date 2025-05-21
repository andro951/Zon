"use strict";

Zon.TimeController = class {
    constructor() {
        this.deltaTimeMilliseconds = 0;
        this.skipSetupLevel = false;
        this.startTimeMilliseconds = performance.now();
        this.timeMilliseconds = this.startTimeMilliseconds;
        this.lastTimeMilliseconds = this.timeMilliseconds;
        this.deltaTimeMilliseconds = 0;
        this.timeSeconds = this.startTimeMilliseconds / 1000;
        this.lastTimeSeconds = this.timeSeconds;
        this.deltaTimeSeconds = 0;
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
}