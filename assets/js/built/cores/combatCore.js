"use strict";

Zon.CombatCore = class CombatCore extends Zon.AetherCore {
    constructor() {
        super();
    }

    preLoadSetup = () => {
        super.preLoadSetup();
        this._constructAttunementXpPerStageEquation();
        Zon.game.onCompleteStageActions.add(this.onCompleteStage);
    }

    description = () => {
        return 'Attuned for enhancing combat power.';
    }
    coreInfo = () => {
        // $"{AttunementProgressPerStageEquation.ResultName} =\n" +
        // $"{AttunementProgressPerStageEquation.EquationString}\n" +
        // $"\n" +
        // $"{EmpowerLevel.LevelCost.Equation.ResultName} =\n" +
        // $"{EmpowerLevel.LevelCost.Equation.EquationString}\n" +
        // $"\n" +
        // $"{AttunementLevel.LevelCost.Equation.ResultName} =\n" +
        // $"{AttunementLevel.LevelCost.Equation.EquationString}";
        
        return `${this.xpPerAttunementLevelEquation}\n\n${this.empowerLevel.levelCostEquation}\n\n${this.attunementLevelTracker._progressPerLevelEquation}`;
    }
    color = () => {
        return CombatCore._color;
    }
    static _color = Struct.Color.fromRGBA(255, 255, 255, 255);
    attunementHowProgress = () => {
        return 'completing stages';
    }
    static combatCoreIdName = 'Combat';
    idName = () => {
        return CombatCore.combatCoreIdName;
    }
    beforeCores = () => {
        return new Set([

        ]);
    }
    afterCores = () => {
        return new Set([
            
        ]);
    }
    craftCost = () => {
        return CombatCore._craftCost;
    }
    static _craftCost = Struct.BigNumber.create(10);
    static _levelMult = 0.5;
    static _baseCost = 2;
    _xpPerAttunementLevelEquation = () => {
        const attunementLevel = `attunementLevel`;
        const args = [
            new Zon.Type_N(attunementLevel),
        ];

        //an = C * n + D
        const C = CombatCore._levelMult;
        const D = CombatCore._baseCost;
        const xpPerLevelStr = `${C} * ${attunementLevel} + ${D}`;
        return Zon.Equation_N.create(`${this.name()}XPPerAttunementLevel`, xpPerLevelStr, [], args);
    }
    _attunementLevelToXpEquation = () => {
        const attunementLevel = `attunementLevel`;
        const args = [
            new Zon.Type_N(attunementLevel),
        ];

        //an = C * n + D
        //Sum = C * (n * (n - 1)) / 2 + D * n
        //Sum = n * (C * (n - 1) / 2 + D)
        const C = CombatCore._levelMult;
        const D = CombatCore._baseCost;
        const levelToXPStr = `${attunementLevel} * (${C} * (${attunementLevel} - 1) / 2 + ${D})`;
        return Zon.Equation_N.create(`TotalXPNeededAt${this.name()}AttunementLevel`, levelToXPStr, [], args);
    }
    _attunementXpToLevelEquation = () => {
        const attunementXp = `attunementXp`;
        const args = [
            new Zon.Type_N(attunementXp),
        ];

        //an = C * n + D
        //Sum = C * (n * (n - 1)) / 2 + D * n
        //Sum = n * (C * (n - 1) / 2 + D)
        //K = (D - C / 2)
        //n = (-K + sqrt(K^2 + 2 * C * Sum)) / C
        const C = CombatCore._levelMult;
        const D = CombatCore._baseCost;
        const K = C / 2 - D;
        const xpToLevelStr = `floor((${K} + ((${K})^2 + 2 * ${C} * ${attunementXp})^0.5) / ${C})`;
        return Zon.Equation_N.create(`${this.name()}AttunementLevelFromXP`, xpToLevelStr, [], args);
    }

    _empowermentCostEquation = () => {
        const empowermentLevel = `empowermentLevel`;
        const args = [
            new Zon.Type_N(empowermentLevel),
        ];

        const empowermentCostStr = `1000 * (2 + 0.01 * (${empowermentLevel} - 1))^${empowermentLevel}`;
        return Zon.Equation_BN.create(`${this.name()}EmpowermentLevelCost`, empowermentCostStr, [], args);
    }

    _enhanceCostEquation = () => {
        const enhanceLevel = `enhanceLevel`;
        const args = [
            new Zon.Type_N(enhanceLevel),
        ];

        const enhanceCostStr = `10000 * (10 + 0.05 * (${enhanceLevel} - 1))^${enhanceLevel}`;
        return Zon.Equation_BN.create(`${this.name()}EnhancementLevelCost`, enhanceCostStr, [], args);
    }

    _constructAttunementXpPerStageEquation = () => {
        const stageNum = `stageNum`;
        const args = [
            new Zon.Type_N(stageNum),
        ];

        const xpPerStageStr = `${stageNum} + ${Zon.GlobalVarNames.PRESTIGE_COUNT} * ${Zon.GlobalVarNames.STAGE_COUNT}`;
        this.attunementXpPerStageEquation = Zon.Equation_N.create(`AttunementXPPerStage`, xpPerStageStr, [], args);
    }

    onCompleteStage = (levelData) => {
        const progress = this.attunementXpPerStageEquation.getValue(levelData.displayedStageNum);
        this.totalAttunementXP.value = this.totalAttunementXP.value + progress;
        //console.log(`Completed stage ${levelData.displayedStageNum}, gained ${progress} attunement XP, total attunement XP is now ${this.totalAttunementXP.value}, attunement level is ${this.attunementLevelTracker.level.value}`);
    }
}

Zon.combatCore = Zon.coreManager.registerCore(new Zon.CombatCore());