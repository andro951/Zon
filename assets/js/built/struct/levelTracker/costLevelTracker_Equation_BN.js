"use strict";

Struct.CostLevelTracker_Equation_BN = class CostLevelTracker_Equation_BN extends Struct.CostLevelTracker_BN {
    constructor(levelCostEquation, levelName, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER) {
        super(levelName, startingLevel, maxLevel);
        this.levelCostEquation = levelCostEquation;
        this.levelCost = new Variable.Dependent(() => {
            return this.levelCostEquation.getValue(this.level.value);
        }, `CostAt${levelName}`, { this: this });
    }

    progressNeededForLevelUpFromLevel = (level) => {
        return this.levelCostEquation.getValue(level);
    }
}