"use strict";

Zon.TestEnhancement = class TestEnhancement extends Zon.Enhancement {
    constructor() {
        super();
    }

    // #region Core

    coreID = () => Zon.CoreID.Combat;

    // #endregion

    // #region Info and IDs

    // protected override void ConstructDescriptionText() => DescriptionText = new StringVariable((a) => "Increase Aether gained from all sources.");
    id = () => Zon.EnhancementID.AetherMagnificationT1;
    // public override Dictionary<EnhancementID, int> UnlockedBy => unlockedBy;
    // private Dictionary<EnhancementID, int> unlockedBy = null;

    // #endregion

    // #region Level

    maxLevel = () => 100000;

    // #endregion

    // #region Effects

    getEffects = () => {
        const effects = [];
        const levelVar = this.levelTracker().level;
        const level = levelVar.name;
        const aetherGainedEquationStr = `(2 + 0.1 * ${Zon.combatCore.totalEmpowermentLevel.name})^${level}`;
        const aetherGainedEquation = Zon.Equation_BN.create(`XPNeededForNextPlayerLevel`, aetherGainedEquationStr, [ levelVar ]);
        effects.push(Zon.AetherGained.create(aetherGainedEquation));
        return effects;
    }

    // #endregion
}

Zon.testEnhancement = Zon.coreManager.registerEnhancement(new Zon.TestEnhancement());