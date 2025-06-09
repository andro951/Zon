"use strict";

Struct.ProgressLevelTracker = class ProgressLevelTracker extends Struct.LevelTrackerBase {
    constructor(levelName, totalProgressName, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER) {
        super(levelName, startingLevel, maxLevel);
        this.totalProgress = Variable.BigNumberVar.ZERO(totalProgressName);
        this.totalProgress.onChangedAction.add(this.onProgressChanged);
        this.totalProgressAtThisLevel = Struct.BigNumber.ZERO;
        this.totalProgressAtNextLevel = Struct.BigNumber.ZERO;
        this.progressNeededFromThisLevelToNextLevel = Struct.BigNumber.ZERO;
    }

    onProgressChanged = () => {
        //TODO: This way is fine, but should also make one that has equations for direct converting between 
        //  progress/level like playerLevel.
        if (this.totalProgress.value.greaterThanOrEqual(this.progressNeededFromThisLevelToNextLevel)) {
            let l = this.level.value;
            while (this.totalProgress.value.greaterThanOrEqual(this.totalProgressAtNextLevel)) {
                this.totalProgressAtThisLevel = this.totalProgressAtNextLevel;
                l++;
                this.progressNeededFromThisLevelToNextLevel = this.progressNeededForLevelUpFromLevel(l);
                this.totalProgressAtNextLevel = this.totalProgressAtThisLevel.add(this.progressNeededFromThisLevelToNextLevel);
            }

            this.level.value = l;
        }
        else if (this.totalProgress.value.lessThan(this.totalProgressAtThisLevel)) {
            let total = this.totalProgress.value;
            this.setDefaultProgress();
            this.totalProgress.resetSkipActions();
            this.totalProgress.value = total;
            return;
        }
    }

    get totalProgressThisLevel() {
        return this.totalProgress.value.subtract(this.totalProgressAtThisLevel);
    }
    get thisLevelPercent() {
        return this.totalProgressThisLevel.divide(this.progressNeededFromThisLevelToNextLevel).toNumber();
    }

    setDefaultProgress() {
        super.setDefaultProgress();
        this.level.resetSkipActions();
        this.totalProgressAtThisLevel = Struct.BigNumber.ZERO;
        this.progressNeededFromThisLevelToNextLevel = this.progressNeededForLevelUpFromLevel(0);
        this.totalProgressAtNextLevel = this.progressNeededFromThisLevelToNextLevel;
    }

    reset() {
        this.totalProgress.reset();
    }

    saveLoadHelper() {
        return Zon.SaveLoadHelper_T.fromVariable(this.totalProgress);
    }
}