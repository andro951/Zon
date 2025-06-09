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
        this.progressAtNextLevel = new Variable.Dependent(() => {
            return this.levelToProgress(this.level.value.add(Struct.BigNumber.ONE_));
        }, `ProgressAtNext${levelName}`, this);
        this.progressNeededFromThisLevelToNextLevel = new Variable.Dependent(() => {
            return this.progressAtNextLevel.value.subtract(this.totalProgressAtLevel.value);
        }, `ProgressNeededFromThisLevelToNext${levelName}`, this);
        this.logProgressToNextLevel = new Variable.Dependent(() => {
            return this.totalProgress.value.logarithmicProgress(this.totalProgressAtLevel.value, this.progressAtNextLevel.value);
        }, `LogarithmicProgressToNext${levelName}`, this);
        this.progressToNextLevel = new Variable.Dependent(() => {
            return this.totalProgress.value.linearProgress(this.totalProgressAtLevel.value, this.progressAtNextLevel.value);
        }, `ProgressToNext${levelName}`, this);
    }
    updateLevelFromProgress = () => {
        if (this.totalProgress.value.greaterThanOrEqual(this.xpAtNextLevel.value)) {
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

                let level = this._progressToLevelEquation.getValue(progress);
                let progressAtLevel = this.levelToProgress(level);
                if (progressAtLevel.greaterThan(progress)) {
                    do {
                        level.subtractI(Struct.BigNumber.ONE_);
                        progressAtLevel = this.levelToProgress(level);
                    } while (progressAtLevel.greaterThan(progress));
                }
                else if (progressAtLevel.lessThan(progress)) {
                    do {
                        const nextLevel = level.add(Struct.BigNumber.ONE_);
                        const progressAtNextLevel = this.levelToProgress(nextLevel);
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
        this.progressAtNextLevel.resetSkipActions();
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