"use strict";

Struct.CostLevelTracker_BN = class CostLevelTracker_BN extends Struct.LevelTrackerBase {
    constructor(levelName, startingLevel = 0, maxLevel = Number.MAX_SAFE_INTEGER) {
        super(levelName, startingLevel, maxLevel);
        if (this.constructor === CostLevelTracker_BN) {
            throw new Error("CostLevelTracker_BN is an abstract class and cannot be instantiated directly.");
        }
    }

    getLevelsCost = (levels, available = Struct.BigNumber.ZERO, stopIfCantAfford = false) => {
        if (this.level.value + levels > this.maxLevel)
            levels = this.maxLevel - this.level.value;

        let cost = Struct.BigNumber.ZERO;
        if (levels < 1)
            return { canAffordLevels: 0, cost };

        let l = this.level.value;
        let i = levels;
        do {
            const newCost = cost.add(this.progressNeededForLevelUpFromLevel(l));
            if (stopIfCantAfford && available.lessThan(newCost)) {
                levels -= i;
                break;
            }

            cost = newCost;
            l++;
            i--;
        } while (i > 0);

        return { canAffordLevels: levels, cost };
    }

    tryLevelUp = (levels, available = Struct.BigNumber.ZERO) => {
        if (levels < 1)
            return { leveledUp: 0, cost: Struct.BigNumber.ZERO };

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