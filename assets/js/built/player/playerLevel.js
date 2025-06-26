"use strict";

Zon.PlayerLevel = class PlayerLevel {
    constructor() {
        const levelToXPEquation = this._createLevelToXPEquation();
        const xpToLevelEquation = this._createXPToLevelEquation();
        this._playerLevelTracker = new Struct.ProgressLevelTracker_Sum(Zon.GlobalVarNames.PLAYER_LEVEL, Zon.GlobalVarNames.PLAYER_LEVEL_PROGRESS, levelToXPEquation, xpToLevelEquation, 1, Number.MAX_SAFE_INTEGER, { progressToLevelEquationIsEstimate: true });
        this.levelToXP = this._playerLevelTracker.levelToProgress;
        this.level = this._playerLevelTracker.level.makeGlobal();
        this.xpToLevel = this._playerLevelTracker.progressToLevel;
        this.progressToNextLevel = this._playerLevelTracker.progressToNextLevel;
        this.totalXP = this._playerLevelTracker.totalProgress.makeGlobal();

        Zon.Setup.preLoadSetupActions.add(this.preLoadSetup);
        Zon.Setup.postLoadSetupActions.add(this.postLoadSetup);
    }

    preLoadSetup = () => {
        Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.GAME, this.saveLoadInfo());
    }

    saveLoadInfo = () => {
        const info = new Zon.PlayerLevel.PlayerLevelSaveLoadInfo();
        info.add(this._playerLevelTracker.saveLoadHelper());
        return info;
    }

    static PlayerLevelSaveLoadInfo = class PlayerLevelSaveLoadInfo extends Zon.SaveLoadInfo {
        constructor() {
            super(Zon.SaveLoadID.PLAYER);
        }

        write = (writer) => {
            super.write(writer);
        }
        read = (reader) => {
            super.read(reader);
        }
        get = () => {
            super.get();
        }
        set = () => {
            super.set();
        }
    }

    postLoadSetup = () => {
        Zon.playerInventory.onGainAether.add((qty) => {
            this.totalXP.value.addI(qty);
        });
    }
    
    _createLevelToXPEquation() {
        const r = `r`;
        const constants = new Map([
            [r, `2^(1 / 7)`]
        ]);
        const level = `level`;
        const args = [
            new Zon.Type_N(level),
        ];
        const levelToXPStr = `trunc(0.25 * (${level} * (${level} + 1) * 0.5 + 300 / (${r} - 1) * (${r}^${level} - ${r})) - round((${level} - 1) * (42.2425 / 120)))`;
        return Zon.Equation_BN.create(`TotalXpNeededAtPlayerLevel`, levelToXPStr, [], args, constants);
    }

    _createXPToLevelEquation() {
        const r = `r`;
        const constants = new Map([
            [r, `2^(1 / 7)`]
        ]);
        const xp = `xp`;
        const args = [
            new Zon.Type_BN(xp),
        ];
        const xpToLevelStr = `floor(7 * log2((${xp} + 1) * (${r} - 1) / 75 + ${r}))`;
        return Zon.Equation_BN.create(`PlayerLevelFromXp`, xpToLevelStr, [], args, constants);
    }

    static _r = Struct.BigNumber.create(Math.pow(2, 1 / 7));
    static _a = Struct.BigNumber.create(300);
    static _correctionFactor = Struct.BigNumber.create(42.2425 / 120);
    static _quarter = Struct.BigNumber.create(1, -2);//1/4
    static _seven = Struct.BigNumber.create(7);
    static _seventyFive = Struct.BigNumber.create(75);

    levelToXPOld = (level) => {
        const levelSum = level.multiply(level.add(Struct.BigNumber.ONE)).multiply(Struct.BigNumber.HALF);
        const a = Zon.PlayerLevel._a;
        const r = Zon.PlayerLevel._r;
        const sum = a.divide(r.subtract(Struct.BigNumber.ONE)).multiply(r.pow(level).subtract(r));
        return Zon.PlayerLevel._quarter.multiply(levelSum.add(sum)).subtract(level.subtract(Struct.BigNumber.ONE).multiply(Zon.PlayerLevel._correctionFactor).round()).trunc();
    }
    xpToLevelOld = (xp) => {
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
}

Zon.experienceCalculator = new ExperienceCalculator();

(function() {
    const getLevelXPStart = (level, xp) => {
        if (level === 1 && !xp.isPositive)
            return xp;

        const expectedLevel = Zon.playerLevel.xpToLevel(xp);
        if (expectedLevel === undefined)
            throw new Error(`Expected level for XP ${xp} is undefined.`);

        if (expectedLevel < level) {
            for (let x = Math.floor(xp.toNumber()) + 1; x <= 1000000000; x++) {
                const xpBigNumber = Struct.BigNumber.create(x);
                const estimatedLevel = Zon.playerLevel.xpToLevel(xpBigNumber);
                if (estimatedLevel === level) {
                    return xpBigNumber;
                }

                if (estimatedLevel > level)
                    throw new Error(`Failed to find XP for level ${level} starting from ${xp}. Reached ${xpBigNumber.toNumber()} with estimated level ${estimatedLevel.toString()}.`);
            }
        }
        else {
            for (let x = Math.floor(xp.toNumber()) - 1; x >= 0; x--) {
                const xpBigNumber = Struct.BigNumber.create(x);
                const estimatedLevel = Zon.playerLevel.xpToLevel(xpBigNumber);
                if (estimatedLevel === level - 1) {
                    return xpBigNumber.add(Struct.BigNumber.ONE_);
                }
            }
        }
    };
    for (let i = 1; i <= 120; i++) {
        const xp = Zon.experienceCalculator.levelToXP(i);
        const estimatedXPBigNumber = getLevelXPStart(i, Struct.BigNumber.create(xp));
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