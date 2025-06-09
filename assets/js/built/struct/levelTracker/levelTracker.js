"use strict";

Struct.LevelTracker = class LevelTracker {
    constructor(levelName, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER) {
        this.level = new Variable.Value(startingLevel, levelName);
        this.maxLevel = new Variable.Value(maxLevel, `Max${levelName}`);
    }

    static create(levelName, maxLevel = Number.MAX_SAFE_INTEGER) {
        return new this(levelName, maxLevel);
    }

    setMaxLevel = (maxLevel) => this.maxLevel.value = maxLevel;
    get isMaxLevel() {
        return this.level.value >= this.maxLevel.value;
    }
    get hasMaxLevel() {
        return this.maxLevel.value !== Number.MAX_SAFE_INTEGER;
    }
    reset() {
        this.level.reset();
    }

    toString() {
        return this.hasMaxLevel ? `${this.level.value}/${this.maxLevel.value}` : `${this.level.value}`;
    }
    saveLoadHelper() {
        return Zon.SaveLoadHelper_UI53_AL.fromVariable(this.level);
    }
}