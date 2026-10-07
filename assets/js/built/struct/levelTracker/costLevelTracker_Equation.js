"use strict";

Struct.CostLevelTracker_Equation = class CostLevelTracker_Equation extends Struct.CostLevelTracker {
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