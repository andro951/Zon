"use strict";

Struct.ProgressLevelTracker_Sum = class ProgressLevelTracker_Sum extends Struct.LevelTracker {
    constructor(levelName, totalProgressName, levelToProgressEquation, progressToLevelEquation, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER, { progressToLevelEquationIsEstimate = false } = {}) {
        super(levelName, startingLevel, maxLevel);
        this.totalProgress = Variable.BigNumberVar.ZERO(totalProgressName);
        this.totalProgress.onChangedAction.add(this.updateLevelFromProgress);
        this._levelToProgressEquation = levelToProgressEquation;
        this.levelToProgress = (level) => this._levelToProgressEquation.getValue(level);
        this._progressToLevelEquation = progressToLevelEquation;
        this.progressToLevel = this._createProgressToLevelFunction(progressToLevelEquationIsEstimate);

        this.totalProgressAtLevel = new Variable.Dependent(() => {
            return this.levelToProgress(this.level.value);
        }, `ProgressAt${levelName}`, this);
        this.totalProgressAtNextLevel = new Variable.Dependent(() => {
            return this.levelToProgress(this.level.value + 1);
        }, `ProgressAtNext${levelName}`, this);
        this.progressNeededFromThisLevelToNextLevel = new Variable.Dependent(() => {
            return this.totalProgressAtNextLevel.value.subtract(this.totalProgressAtLevel.value);
        }, `ProgressNeededFromThisLevelToNext${levelName}`, this);
        this.logProgressToNextLevel = new Variable.Dependent(() => {
            return this.totalProgress.value.logarithmicProgress(this.totalProgressAtLevel.value, this.totalProgressAtNextLevel.value);
        }, `LogarithmicProgressToNext${levelName}`, this);
        this.progressToNextLevel = new Variable.Dependent(() => {
            return this.totalProgress.value.linearProgress(this.totalProgressAtLevel.value, this.totalProgressAtNextLevel.value);
        }, `ProgressToNext${levelName}`, this);
    }
    updateLevelFromProgress = () => {
        if (this.totalProgress.value.greaterThanOrEqual(this.totalProgressAtNextLevel.value)) {
            this.level.value = this.progressToLevel(this.totalProgress.value);
        }
        else if (this.totalProgress.value.lessThan(this.totalProgressAtLevel.value)) {
            let total = this.totalProgress.value;
            this.setDefaultProgress();
            this.totalProgress.value = total;
        }
    }
    _createProgressToLevelFunction(progressToLevelEquationIsEstimate) {
        if (progressToLevelEquationIsEstimate) {
            return (progress) => {
                if (!progress.isPositive)
                    return Struct.BigNumber.ZERO;

                let level = this._progressToLevelEquation.getValue(progress).toNumber();
                let progressAtLevel = this.levelToProgress(level);
                if (progressAtLevel === undefined || progressAtLevel === null)
                    throw new Error(`Progress at level ${level} is undefined or null.`);

                if (progressAtLevel.greaterThan(progress)) {
                    do {
                        level -= 1;
                        progressAtLevel = this.levelToProgress(level);
                    } while (progressAtLevel.greaterThan(progress));
                }
                else if (progressAtLevel.lessThan(progress)) {
                    do {
                        const nextLevel = level + 1;
                        const progressAtNextLevel = this.levelToProgress(nextLevel);
                        if (!progressAtNextLevel.isPositive)
                            throw new Error(`Progress at next level ${nextLevel} is not positive.`);
                        
                        if (progressAtNextLevel.greaterThan(progress))
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
    
    setDefaultProgress() {
        super.setDefaultProgress();
        this.level.resetSkipActions();
        this.totalProgressAtLevel.resetSkipActions();
        this.totalProgressAtNextLevel.resetSkipActions();
        this.progressNeededFromThisLevelToNextLevel.resetSkipActions();
        this.logProgressToNextLevel.resetSkipActions();
        this.progressToNextLevel.resetSkipActions();
    }

    reset() {
        this.totalProgress.reset();
    }

    saveLoadHelper() {
        return Zon.SaveLoadHelper_T.fromVariable(this.totalProgress);
    }
}