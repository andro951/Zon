"use strict";

Zon.PlayerLevel = class PlayerLevel {//TODO: replace this with generic level system from BlocksAII.
    constructor() {
        this.xp = Zon.playerInventory.aether;
        this.level = new Variable.BigNumberVar(this.xpToLevel(this.xp.value), `PlayerLevel`);
        this.xp.onChangedAction.add(() => {
            while (this.xp.value.greaterThanOrEqual(this.xpAtNextLevel.value)) {
                this.level.value = this.level.value.add(Struct.BigNumber.ONE);
            }
        });
        
        this.xpAtLevel = new Variable.Dependent(() => {
            return this.levelToXP(this.level.value); 
        }, `XPAtPlayerLevel`, this);
        this.xpAtNextLevel = new Variable.Dependent(() => {
            return this.levelToXP(this.level.value.add(Struct.BigNumber.ONE));
        }, `XPAtNextPlayerLevel`, this);
        this.progressToNextLevel = new Variable.Dependent(() => {
            return this.xp.value.logarithmicProgress(this.xpAtLevel.value, this.xpAtNextLevel.value);
        }, `ProgressToNextPlayerLevel`, this);

        this.createEquations();
    }
    
    createEquations() {
        //Provide constants to the equation.  
        const constants = new Map();
        const r = `r`;
        constants.set(r, `2^(1 / 7)`);
        const level = `level`;
        const args = [level];
        const levelToXPStr = `trunc(0.25 * (${level} * (${level} + 1) * 0.5 + 300 / (${r} - 1) * (${r}^${level} - ${r})) - round((${level} - 1) * (42.2425 / 120)))`;

        //Inputs and constants should always be lowercase/camelCase.
        //This should show as:
        //constants:
        //r: 2^(1 / 7) = 1.10409
        //LevelToXP(level) = `trunc(0.25 * (level * (level + 1) * 0.5 +  300 / (r - 1) * (r^level - r)) - round((level - 1) * (42.2425 / 120)))`
        //It should scan the function for constants and create static variables for them.  Also find operations that can be simplified to a constant like 42.2425 / 120.
        
        //this.levelToXPEquation = Zon.Equation_BN.create(`LevelToXP`, levelToXPStr, args, constants);
        //this.levelToXPEquation = Zon.Equation_N.create(`LevelToXP`, levelToXPStr, [], args, constants);
        //name, equationString, variablesArr = [], argsArr = [], constantsMap = new Map()
    }

    static _r = Struct.BigNumber.create(Math.pow(2, 1 / 7));
    static _a = Struct.BigNumber.create(300);
    static _correctionFactor = Struct.BigNumber.create(42.2425 / 120);
    static _quarter = Struct.BigNumber.create(1, -2);//1/4
    static _seven = Struct.BigNumber.create(7);
    static _seventyFive = Struct.BigNumber.create(75);

    levelToXP = (level) => {
        const levelSum = level.multiply(level.add(Struct.BigNumber.ONE)).multiply(Struct.BigNumber.HALF);
        const a = Zon.PlayerLevel._a;
        const r = Zon.PlayerLevel._r;
        const sum = a.divide(r.subtract(Struct.BigNumber.ONE)).multiply(r.pow(level).subtract(r));
        return Zon.PlayerLevel._quarter.multiply(levelSum.add(sum)).subtract(level.subtract(Struct.BigNumber.ONE).multiply(Zon.PlayerLevel._correctionFactor).round()).trunc();
    }
    xpToLevel = (xp) => {
        if (!xp.isPositive)
            return Struct.BigNumber.ONE;

        const r = Zon.PlayerLevel._r;
        const estimatedLevel = Zon.PlayerLevel._seven.multiply(xp.add(Struct.BigNumber.ONE).multiply(r.subtract(Struct.BigNumber.ONE)).divide(Zon.PlayerLevel._seventyFive).add(r).log2()).trunc();
        const xpAtLevel = this.levelToXP(estimatedLevel);
        if (xpAtLevel.greaterThan(xp))
            return estimatedLevel.subtract(Struct.BigNumber.ONE);

        return estimatedLevel;
    }
}

Zon.playerLevel = new Zon.PlayerLevel();


/*
class ExperienceCalculator {
    //xp(L) = floor(sum[l=1, L]{floor(l + 300 * 2^(l / 7))} / 4)
    //xp(L) = floor(0.25 * (sum[l=1, L]{l} + floor(300 * 2^(l / 7)))) (Where L is always an integer)
    //xp(L) = floor(0.25 * ((L + 1) * L * 0.5 + floor(300 * 2^(L / 7))))
    constructor() {
        //Constant used to estimate level
        this.estConstA = Math.pow(2, 1 / 7);
        //Constant used to estimate level
        this.estConstB = (Math.pow(2, 1 / 7) - 1) / 75;
        this.table = [0];
        this.xpSum = 0;
    }
    equate(level) {
        return Math.floor(level + 300 * Math.pow(2, level / 7));
    }
    // Computes the xp required for the next level in the table
    computeNextLevelXP(level) {
        this.xpSum += this.equate(level);
        return Math.floor(this.xpSum / 4);
    }
    // Computes an under-estimate of the level corresponding to an amount of XP
    estimateXPToLevel(xp) {
        return Math.floor(7 * Math.log2(this.estConstA + this.estConstB * xp)) - 1;
    }
    levelToXP(level) {
        if (this.table.length >= level)
            return this.table[level - 1];
        else {
            for (let i = this.table.length; i < level; i++) {
                this.table.push(this.computeNextLevelXP(i));
            }
            return this.table[level - 1];
        }
    }
    // @deprecated Use levelToXP instead
    level_to_xp(level) {
        return this.levelToXP(level);
    }
    // XP To level function utilizing estimate method
    xpToLevel(xp) {
        if (xp <= 0)
            return 1;
        let levelEstimate = this.estimateXPToLevel(xp);
        if (xp > this.levelToXP(levelEstimate + 1)) {
            levelEstimate++;
        }
        return levelEstimate;
    }

    // levelToXPNew(level) {
    //     const levelSum = level * (level + 1) * 0.5;
    //     const a = 300;
    //     const r = Math.pow(2, 1 / 7);
    //     const sum = a * (Math.pow(r, level) - r) / (r - 1);
    //     return Math.floor(0.25 * (levelSum + sum)) - Math.round((level - 1) * (42.2425 / 120));
    // }
    // xpToLevelNew(xp) {
    //     if (xp <= 0)
    //         return 1;
        
    //     const r = Math.pow(2, 1 / 7);
    //     const estimatedLevel = Math.floor(7 * Math.log2((xp + 1) * (r - 1) / 75 + r));//Always underestimates how much xp is needed for the next level.
    //     const xpAtLevel = this.levelToXPNew(estimatedLevel);
    //     if (xpAtLevel > xp)
    //         return estimatedLevel - 1;

    //     return estimatedLevel;
    // }
    levelToXPNew(level) {
        const levelSum = level.multiply(level.add(Struct.BigNumber.ONE)).multiply(Struct.BigNumber.HALF);
        const a = Zon.PlayerLevel._a;
        const r = Zon.PlayerLevel._r;
        const sum = a.divide(r.subtract(Struct.BigNumber.ONE)).multiply(r.pow(level).subtract(r));
        return Zon.PlayerLevel._quarter.multiply(levelSum.add(sum)).subtract(level.subtract(Struct.BigNumber.ONE).multiply(Zon.PlayerLevel._correctionFactor).round()).trunc();
    }
    xpToLevelNew(xp) {
        if (!xp.isPositive)
            return Struct.BigNumber.ONE;

        const r = Zon.PlayerLevel._r;
        const estimatedLevel = Zon.PlayerLevel._seven.multiply(xp.add(Struct.BigNumber.ONE).multiply(r.subtract(Struct.BigNumber.ONE)).divide(Zon.PlayerLevel._seventyFive).add(r).log2()).trunc();
        const xpAtLevel = this.levelToXPNew(estimatedLevel);
        if (xpAtLevel.greaterThan(xp))
            return estimatedLevel.subtract(Struct.BigNumber.ONE);

        return estimatedLevel;
    }
}

Zon.experienceCalculator = new ExperienceCalculator();

(function() {
    const getLevelXPStart = (level, xp) => {
        if (level.equals(Struct.BigNumber.ONE) && !xp.isPositive)
            return xp;

        const expectedLevel = Zon.experienceCalculator.xpToLevelNew(xp);
        if (expectedLevel === undefined)
            throw new Error(`Expected level for XP ${xp} is undefined.`);

        if (expectedLevel.lessThan(level)) {
            for (let x = Math.floor(xp.toNumber()) + 1; x <= 1000000000; x++) {
                const xpBigNumber = Struct.BigNumber.create(x);
                const estimatedLevel = Zon.experienceCalculator.xpToLevelNew(xpBigNumber);
                if (estimatedLevel.equals(level)) {
                    return xpBigNumber;
                }

                if (estimatedLevel.greaterThan(level))
                    throw new Error(`Failed to find XP for level ${level} starting from ${xp}. Reached ${xpBigNumber.toNumber()} with estimated level ${estimatedLevel.toString()}.`);
            }
        }
        else {
            for (let x = Math.floor(xp.toNumber()) - 1; x >= 0; x--) {
                const xpBigNumber = Struct.BigNumber.create(x);
                const estimatedLevel = Zon.experienceCalculator.xpToLevelNew(xpBigNumber);
                if (estimatedLevel.equals(level.subtract(Struct.BigNumber.ONE))) {
                    return xpBigNumber.add(Struct.BigNumber.ONE);
                }
            }
        }
    };
    const getLevelXPStart2 = (level, xp) => {
        if (level.equals(Struct.BigNumber.ONE) && !xp.isPositive)
            return xp;

        const expectedLevel = Zon.experienceCalculator2.xpToLevelNew(xp);
        if (expectedLevel === undefined)
            throw new Error(`Expected level for XP ${xp} is undefined.`);

        if (expectedLevel.lessThan(level)) {
            for (let x = Math.floor(xp.toNumber()) + 1; x <= 1000000000; x++) {
                const xpBigNumber = Struct.BigNumber.create(x);
                const estimatedLevel = Zon.experienceCalculator2.xpToLevelNew(xpBigNumber);
                if (estimatedLevel.equals(level)) {
                    return xpBigNumber;
                }

                if (estimatedLevel.greaterThan(level))
                    throw new Error(`Failed to find XP for level ${level} starting from ${xp}. Reached ${xpBigNumber.toNumber()} with estimated level ${estimatedLevel.toString()}.`);
            }
        }
        else {
            for (let x = Math.floor(xp.toNumber()) - 1; x >= 0; x--) {
                const xpBigNumber = Struct.BigNumber.create(x);
                const estimatedLevel = Zon.experienceCalculator2.xpToLevelNew(xpBigNumber);
                if (estimatedLevel.equals(level.subtract(Struct.BigNumber.ONE))) {
                    return xpBigNumber.add(Struct.BigNumber.ONE);
                }
            }
        }
    };
    //return;
    for (let i = 1; i <= 120; i++) {
        const xp = Zon.experienceCalculator.levelToXP(i);
        //const estimatedXP = Zon.experienceCalculator.levelToXPNew(i);
        //const estimatedXP = getLevelXPStart(Struct.BigNumber.create(i), Struct.BigNumber.create(xp));
        const estimatedXPBigNumber = getLevelXPStart(Struct.BigNumber.create(i), Struct.BigNumber.create(xp));
        const estimatedXP = estimatedXPBigNumber.toNumber();
        const fail = xp !== estimatedXP;
        const msg = `Level ${i}: XP = ${xp}, Estimated XP: ${estimatedXP} (${xp === estimatedXP ? '' : `Fail, diff: ${estimatedXP - xp}`})  BigNumber: ${estimatedXPBigNumber.toString()}`;
        if (fail) {
            console.warn(msg);
        }
        else {
            console.log(msg);
        }
    }
})();
*/