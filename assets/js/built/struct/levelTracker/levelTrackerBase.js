"use strict";

Struct.LevelTrackerBase = class LevelTrackerBase extends Struct.LevelTracker {
    constructor(levelName, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER) {
        if (new.target === Struct.LevelTrackerBase)
            throw new TypeError("Cannot construct LevelTrackerBase instances directly, use a subclass instead.");

        super(levelName, startingLevel, maxLevel);
    }
    
    reset() {
        super.reset();
    }
}