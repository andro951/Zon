"use strict";

Struct.ProgressLevelTracker_Equation_BN = class ProgressLevelTracker_Equation_BN extends Struct.ProgressLevelTracker {
    constructor(levelName, totalProgressName, levelCostEquation, startingLevel = 0, levelCostDefault, maxLevel = Number.MAX_SAFE_INTEGER) {
        super(levelName, totalProgressName, startingLevel, maxLevel);
        this.levelCost = Variable.EquationVar(levelCostEquation, levelCostDefault);
        this.setDefaultProgress();
    }

    progressNeededForLevelUpFromLevel(level) {
        this.levelCost.getValueNewVariables(level);
    }
    progressNeededForLevelUpFromCurrentLevel() {
        return this.levelCost.value;
    }
}