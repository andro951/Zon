"use strict";

Struct.ProgressLevelTracker_Sum_N = class ProgressLevelTracker_Sum_N extends Struct.LevelTracker {
    constructor(levelName, totalProgressName, progressPerLevelEquation, levelToProgressEquation, progressToLevelEquation, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER, { progressToLevelEquationIsEstimate = false } = {}) {
        //Check if equations are Equation objects
        if (!(progressPerLevelEquation instanceof Zon.Equation))
            throw new Error("progressPerLevelEquation must be an instance of Zon.Equation");

        if (!(levelToProgressEquation instanceof Zon.Equation))
            throw new Error("levelToProgressEquation must be an instance of Zon.Equation");

        if (!(progressToLevelEquation instanceof Zon.Equation))
            throw new Error("progressToLevelEquation must be an instance of Zon.Equation");

        super(levelName, startingLevel, maxLevel);
        this._progressPerLevelEquation = progressPerLevelEquation;
        this.totalProgress = new Variable.Value(0, totalProgressName);
        this.totalProgress.onChangedAction.add(this.updateLevelFromProgress);
        this._levelToProgressEquation = levelToProgressEquation;
        this.levelToProgress = (level) => this._levelToProgressEquation.getValue(level);
        this._progressToLevelEquation = progressToLevelEquation;
        this.progressToLevel = this._createProgressToLevelFunction(progressToLevelEquationIsEstimate);

        this.totalProgressAtLevel = new Variable.Dependent(() => {
            return this.levelToProgress(this.level.value);
        }, `ProgressAt${levelName}`, { this: this });
        this.totalProgressAtNextLevel = new Variable.Dependent(() => {
            return this.levelToProgress(this.level.value + 1);
        }, `ProgressAtNext${levelName}`, { this: this });
        this.progressNeededFromThisLevelToNextLevel = new Variable.Dependent(() => {
            return this.totalProgressAtNextLevel.value - this.totalProgressAtLevel.value;
        }, `ProgressNeededFromThisLevelToNext${levelName}`, { this: this });
        this.logProgressToNextLevel = new Variable.Dependent(() => {
            return Algebra.logarithmicProgress(this.totalProgress.value, this.totalProgressAtLevel.value, this.totalProgressAtNextLevel.value);
        }, `LogarithmicProgressToNext${levelName}`, { this: this });
        this.progressToNextLevel = new Variable.Dependent(() => {
            return Algebra.linearProgress(this.totalProgress.value, this.totalProgressAtLevel.value, this.totalProgressAtNextLevel.value);
        }, `ProgressToNext${levelName}`, { this: this });
    }
    updateLevelFromProgress = () => {
        //console.log(`${this.level.name}: Checking if level needs to be updated based on total progress ${this.totalProgress.value}.  Current level: ${this.level.value}, progress at current level: ${this.totalProgressAtLevel.value}, progress at next level: ${this.totalProgressAtNextLevel.value}`);
        if (this.totalProgress.value >= this.totalProgressAtNextLevel.value) {
            this.level.value = this.progressToLevel(this.totalProgress.value);
            //console.log(`${this.level.name}: Updated level to ${this.level.value} based on progress ${this.totalProgress.value}. Progress at current level: ${this.totalProgressAtLevel.value}, progress at next level: ${this.totalProgressAtNextLevel.value}`);
        }
        else if (this.totalProgress.value < this.totalProgressAtLevel.value) {
            let total = this.totalProgress.value;
            this.setDefaultProgress();
            this.totalProgress.value = total;
            //console.log(`${this.level.name}: Reduced level to ${this.level.value} based on progress ${this.totalProgress.value}. Progress at current level: ${this.totalProgressAtLevel.value}, progress at next level: ${this.totalProgressAtNextLevel.value}`);
        }
    }
    _createProgressToLevelFunction = (progressToLevelEquationIsEstimate) => {
        if (progressToLevelEquationIsEstimate) {
            return (progress) => {
                if (progress <= 0)
                    return 0;

                let level = this._progressToLevelEquation.getValue(progress).toNumber();
                let progressAtLevel = this.levelToProgress(level);
                if (progressAtLevel === undefined || progressAtLevel === null)
                    throw new Error(`Progress at level ${level} is undefined or null.`);

                if (progressAtLevel > progress) {
                    do {
                        level -= 1;
                        progressAtLevel = this.levelToProgress(level);
                    } while (progressAtLevel > progress);
                }
                else if (progressAtLevel < progress) {
                    do {
                        const nextLevel = level + 1;
                        const progressAtNextLevel = this.levelToProgress(nextLevel);
                        if (progressAtNextLevel <= 0)
                            throw new Error(`Progress at next level ${nextLevel} is not positive.`);
                        
                        if (progressAtNextLevel > progress)
                            break;

                        level = nextLevel;
                        progressAtLevel = progressAtNextLevel;
                    } while (true);
                }

                return level;
            }
        }
        else {
            return (progress) => this._progressToLevelEquation.getValue(progress);
        }
    }
    
    setDefaultProgress = () => {
        this.totalProgress.resetSkipActions();
        this.level.resetSkipActions();
        this.totalProgressAtLevel.resetSkipActions();
        this.totalProgressAtNextLevel.resetSkipActions();
        this.progressNeededFromThisLevelToNextLevel.resetSkipActions();
        this.logProgressToNextLevel.resetSkipActions();
        this.progressToNextLevel.resetSkipActions();
    }

    reset = () => {
        this.totalProgress.reset();
    }

    saveLoadHelper = () => {
        return Zon.SaveLoadHelper.fromVariable(this.totalProgress);
    }
}