"use strict";

Zon.PlayerLevel = class PlayerLevel {//TODO: replace this with generic level system from BlocksAII.
    constructor() {
        this.xp = Zon.playerInventory.aether;
        this.level = new Variable.TripleVar(this.xpToLevel(this.xp.value));
        this.xp.onChangedAction.add(() => {
            while (this.xp.value.greaterThanOrEqual(this.xpAtNextLevel.value)) {
                this.level.value = this.level.value.add(Numbers.Triple.ONE);
            }
        });
        
        this.xpAtLevel = new Variable.Dependent(() => {
            return this.levelToXP(this.level.value); 
        }, this);
        this.xpAtNextLevel = new Variable.Dependent(() => {
            return this.levelToXP(this.level.value.add(Numbers.Triple.ONE));
        }, this);
        this.progressToNextLevel = new Variable.Dependent(() => {
            return this.xp.value.logarithmicProgress(this.xpAtLevel.value, this.xpAtNextLevel.value);
        }, this);
    }
    
    static _r = Numbers.Triple.fromNumber(Math.pow(2, 1 / 7));
    static _a = Numbers.Triple.create(300n);
    static _correctionFactor = Numbers.Triple.fromNumber(42.2425 / 120);
    static _quarter = Numbers.Triple.create(1n, -2n);//1/4
    static _seven = Numbers.Triple.create(7n);
    static _seventyFive = Numbers.Triple.create(75n);

    levelToXP = (level) => {
        const levelSum = level.multiply(level.add(Numbers.Triple.ONE)).multiply(Numbers.Triple.HALF);
        const a = Zon.PlayerLevel._a;
        const r = Zon.PlayerLevel._r;
        const sum = a.divide(r.subtract(Numbers.Triple.ONE)).multiply(r.pow(level).subtract(r));
        return Zon.PlayerLevel._quarter.multiply(levelSum.add(sum)).subtract(level.subtract(Numbers.Triple.ONE).multiply(Zon.PlayerLevel._correctionFactor).round()).truncate();
    }
    xpToLevel = (xp) => {
        if (!xp.isPositive)
            return Numbers.Triple.ONE;

        const r = Zon.PlayerLevel._r;
        const estimatedLevel = Zon.PlayerLevel._seven.multiply(xp.add(Numbers.Triple.ONE).multiply(r.subtract(Numbers.Triple.ONE)).divide(Zon.PlayerLevel._seventyFive).add(r).log2()).truncate();
        const xpAtLevel = this.levelToXP(estimatedLevel);
        if (xpAtLevel.greaterThan(xp))
            return estimatedLevel.subtract(Numbers.Triple.ONE);

        return estimatedLevel;
    }
}

// Zon.PlayerLevelOld = class PlayerLevelOld {
//     constructor() {
//         this.level = new Variable.Value(0); // Starting level
//         this.progress = new Variable.Value(0); // Progress towards next level (0 to 1)
        
//         // Reactive updates
//         this.level.onChangedAction.add(this._updateLevel);
//         this.progress.onChangedAction.add(this._updateProgress);
        
//     }

//     _updateLevel = () => {
//         console.log(`Player level updated: ${this.level.value}`);
//     }

//     _updateProgress = () => {
//         console.log(`Player progress updated: ${this.progress.value * 100}%`);
//     }
    
//     static _r = Math.pow(2, 1 / 7);
//     static _a = 300;
//     static _correctionFactor = 42.2425 / 120;

//     levelToXP(level) {
//         const levelSum = level * (level + 1) * 0.5;
//         const a = Zon.PlayerLevel._a;
//         const r = Zon.PlayerLevel._r;
//         const sum = a * (Math.pow(r, level) - r) / (r - 1);
//         return Math.floor(0.25 * (levelSum + sum)) - Math.round((level - 1) * Zon.PlayerLevel._correctionFactor);
//     }
//     xpToLevel(xp) {
//         if (xp <= 0)
//             return 1;

//         const r = Zon.PlayerLevel._r;
//         const estimatedLevel = Math.floor(7 * Math.log2((xp + 1) * (r - 1) / 75 + r));//Always underestimates how much xp is needed for the next level.
//         const xpAtLevel = this.levelToXP(estimatedLevel);
//         if (xpAtLevel > xp)
//             return estimatedLevel - 1;

//         return estimatedLevel;
//     }
// }

Zon.playerLevel = new Zon.PlayerLevel();



// class ExperienceCalculator {
//     //xp(L) = floor(sum[l=1, L]{floor(l + 300 * 2^(l / 7))} / 4)
//     //xp(L) = floor(0.25 * (sum[l=1, L]{l} + floor(300 * 2^(l / 7)))) (Where L is always an integer)
//     //xp(L) = floor(0.25 * ((L + 1) * L * 0.5 + floor(300 * 2^(L / 7))))
//     constructor() {
//         /** Constant used to estimate level */
//         this.estConstA = Math.pow(2, 1 / 7);
//         /** Constant used to estimate level */
//         this.estConstB = (Math.pow(2, 1 / 7) - 1) / 75;
//         this.table = [0];
//         this.xpSum = 0;
//     }
//     equate(level) {
//         return Math.floor(level + 300 * Math.pow(2, level / 7));
//     }
//     /** Computes the xp required for the next level in the table */
//     computeNextLevelXP(level) {
//         this.xpSum += this.equate(level);
//         return Math.floor(this.xpSum / 4);
//     }
//     /** Computes an under-estimate of the level corresponding to an amount of XP */
//     estimateXPToLevel(xp) {
//         return Math.floor(7 * Math.log2(this.estConstA + this.estConstB * xp)) - 1;
//     }
//     levelToXP(level) {
//         if (this.table.length >= level)
//             return this.table[level - 1];
//         else {
//             for (let i = this.table.length; i < level; i++) {
//                 this.table.push(this.computeNextLevelXP(i));
//             }
//             return this.table[level - 1];
//         }
//     }
//     /** @deprecated Use levelToXP instead */
//     level_to_xp(level) {
//         return this.levelToXP(level);
//     }
//     /** XP To level function utilizing estimate method */
//     xpToLevel(xp) {
//         if (xp <= 0)
//             return 1;
//         let levelEstimate = this.estimateXPToLevel(xp);
//         if (xp > this.levelToXP(levelEstimate + 1)) {
//             levelEstimate++;
//         }
//         return levelEstimate;
//     }

//     // levelToXPNew(level) {
//     //     const levelSum = level * (level + 1) * 0.5;
//     //     const a = 300;
//     //     const r = Math.pow(2, 1 / 7);
//     //     const sum = a * (Math.pow(r, level) - r) / (r - 1);
//     //     return Math.floor(0.25 * (levelSum + sum)) - Math.round((level - 1) * (42.2425 / 120));
//     // }
//     // xpToLevelNew(xp) {
//     //     if (xp <= 0)
//     //         return 1;
        
//     //     const r = Math.pow(2, 1 / 7);
//     //     const estimatedLevel = Math.floor(7 * Math.log2((xp + 1) * (r - 1) / 75 + r));//Always underestimates how much xp is needed for the next level.
//     //     const xpAtLevel = this.levelToXPNew(estimatedLevel);
//     //     if (xpAtLevel > xp)
//     //         return estimatedLevel - 1;

//     //     return estimatedLevel;
//     // }
//     levelToXPNew(level) {
//         const levelSum = level.multiply(level.add(Numbers.Triple.ONE)).multiply(Numbers.Triple.HALF);
//         const a = Zon.PlayerLevel._a;
//         const r = Zon.PlayerLevel._r;
//         const sum = a.divide(r.subtract(Numbers.Triple.ONE)).multiply(r.pow(level).subtract(r));
//         return Zon.PlayerLevel._quarter.multiply(levelSum.add(sum)).subtract(level.subtract(Numbers.Triple.ONE).multiply(Zon.PlayerLevel._correctionFactor).round()).truncate();
//     }
//     xpToLevelNew(xp) {
//         if (!xp.isPositive)
//             return Numbers.Triple.ONE;

//         const r = Zon.PlayerLevel._r;
//         const estimatedLevel = Zon.PlayerLevel._seven.multiply(xp.add(Numbers.Triple.ONE).multiply(r.subtract(Numbers.Triple.ONE)).divide(Zon.PlayerLevel._seventyFive).add(r).log2()).truncate();
//         const xpAtLevel = this.levelToXPNew(estimatedLevel);
//         if (xpAtLevel.greaterThan(xp))
//             return estimatedLevel.subtract(Numbers.Triple.ONE);

//         return estimatedLevel;
//     }
// }

// Zon.experienceCalculator = new ExperienceCalculator();
// (function() {
//     const getLevelXPStart = (level, xp) => {
//         if (level.equals(Numbers.Triple.ONE) && !xp.isPositive)
//             return xp;

//         const expectedLevel = Zon.experienceCalculator.xpToLevelNew(xp);
//         if (expectedLevel === undefined)
//             throw new Error(`Expected level for XP ${xp} is undefined.`);

//         if (expectedLevel.lessThan(level)) {
//             for (let x = Math.floor(xp.toNumber()) + 1; x <= 1000000000; x++) {
//                 const xpTriple = Numbers.Triple.fromNumber(x);
//                 const estimatedLevel = Zon.experienceCalculator.xpToLevelNew(xpTriple);
//                 if (estimatedLevel.equals(level)) {
//                     return xpTriple;
//                 }

//                 if (estimatedLevel.greaterThan(level))
//                     throw new Error(`Failed to find XP for level ${level} starting from ${xp}. Reached ${xpTriple.toNumber()} with estimated level ${estimatedLevel.toString()}.`);
//             }
//         }
//         else {
//             for (let x = Math.floor(xp.toNumber()) - 1; x >= 0; x--) {
//                 const xpTriple = Numbers.Triple.fromNumber(x);
//                 const estimatedLevel = Zon.experienceCalculator.xpToLevelNew(xpTriple);
//                 if (estimatedLevel.equals(level.subtract(Numbers.Triple.ONE))) {
//                     return xpTriple.add(Numbers.Triple.ONE);
//                 }
//             }
//         }
//     };
//     //return;
//     for (let i = 1; i <= 120; i++) {
//         const xp = Zon.experienceCalculator.levelToXP(i);
//         //const estimatedXP = Zon.experienceCalculator.levelToXPNew(i);
//         //const estimatedXP = getLevelXPStart(Numbers.Triple.fromNumber(i), Numbers.Triple.fromNumber(xp));
//         const estimatedXPTriple = getLevelXPStart(Numbers.Triple.fromNumber(i), Numbers.Triple.fromNumber(xp));
//         const estimatedXP = estimatedXPTriple.toNumber();
//         const fail = xp !== estimatedXP;
//         const msg = `Level ${i}: XP = ${xp}, Estimated XP: ${estimatedXP} (${xp === estimatedXP ? '' : `Fail, diff: ${estimatedXP - xp}`})  Triple: ${estimatedXPTriple.toString()}`;
//         if (fail) {
//             console.warn(msg);
//         }
//         else {
//             console.log(msg);
//         }
//     }
// })();