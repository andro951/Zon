"use strict";

Struct.LevelTrackerBase = class LevelTrackerBase extends Struct.LevelTracker {
    constructor(levelName, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER) {
        if (new.target === Struct.LevelTrackerBase)
            throw new TypeError("Cannot construct LevelTrackerBase instances directly, use a subclass instead.");

        super(levelName, startingLevel, maxLevel);
    }
    
    progressNeededForLevelUpFromLevel(level) {
        throw new Error("progressNeededForLevelUpFromLevel must be implemented in a subclass.");
    }
    progressNeededForLevelUpFromCurrentLevel() {
        return this.progressNeededForLevelUpFromLevel(this.level.value);
    }
    setDefaultProgress() {
        throw new Error("setDefaultProgress must be implemented in a subclass.");
    }
    get progressNeededFromThisLevelToNextLevel() {
        throw new Error("progressNeededFromThisLevelToNextLevel must be implemented in a subclass.");
    }
    reset() {
        super.reset();
        this.setDefaultProgress();
    }
}