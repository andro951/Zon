"use strict";

Struct.CostLevelTracker = class CostLevelTracker extends Struct.LevelTrackerBase {
    constructor(levelName, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER) {
        super(levelName, startingLevel, maxLevel);
        if (this.constructor === CostLevelTracker) {
            throw new Error("CostLevelTracker is an abstract class and cannot be instantiated directly.");
        }
    }

    getLevelsCost = (levels, available = 0, stopIfCantAfford = false) => {
        if (this.level.value + levels > this.maxLevel)
            levels = this.maxLevel - this.level.value;

        let cost = 0;
        if (levels < 1)
            return { canAffordLevels: 0, cost };

        let l = this.level.value;
        let i = levels;
        do {
            const newCost = cost + this.progressNeededForLevelUpFromLevel(l);
            if (stopIfCantAfford && available < newCost) {
                levels -= i;
                break;
            }

            cost = newCost;
            l++;
            i--;
        } while (i > 0);

        return { canAffordLevels: levels, cost };
    }

    tryLevelUp = (levels, available = 0) => {
        if (levels < 1)
            return { leveledUp: 0, cost: 0 };

        const { canAffordLevels, cost } = this.getLevelsCost(levels, available, true);
        if (canAffordLevels < 1)
            return { leveledUp: 0, cost };

        this.level.value += canAffordLevels;

        return { leveledUp: canAffordLevels, cost };
    }

    tryLevelUpWithAvailable = (levels, available) => {
        const { canAffordLevels, cost } = this.getLevelsCost(levels, available, true);
        if (canAffordLevels < 1)
            return { leveledUp: 0, cost };

        available.subtract(cost);
        this.level.value += canAffordLevels;
    }
}