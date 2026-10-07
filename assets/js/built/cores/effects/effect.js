"use strict";

Zon.Effect = class Effect {
    constructor(equation) {
        this.effectStrength = new Variable.Equation(equation);
    }

    postConstructor() {
        this.constructEffectLabel();
        this.nameNoSpaces = Zon.EffectIDNames[this.effectID()];
    }

    // #region Info and IDs

    effectID() {
        throw new Error('effectID not implemented');
    }
    name() {
        return this.nameNoSpaces.addSpaces();
    }

    constructEffectLabel() {
        throw new Error('constructEffectLabel not implemented');
    }
    displayedEquation() {
        return this.effectStrength.equation.equationString;
    }
    effectEquationResultName() {
        throw new Error('effectEquationResultName not implemented');
    }
    // public Sprite Sprite => GetSprite(EffectID);
    // private static Dictionary<EffectID, Sprite> sprites = new();
    // private Sprite GetSprite(EffectID effectID) {
    //     if (!sprites.ContainsKey(effectID))
    //         sprites.Add(effectID, IOManager.LoadEffectImage(nameNoSpaces));

    //     return sprites[effectID];
    // }

    // #endregion

    // #region Strength

    effectStrengthString() {
        throw new Error('effectStrengthString not implemented');
    }

    // #endregion
}

Zon.EffectID = {
    BasicCombatSphere: 0,
    CombatSphereDamage: 1,
    AbilityDamage: 2,
    BasicAttackStaminaCost: 3,
    BasicAttackCooldown: 4,
    CombatSphereMoveSpeed: 5,
    BasicAttackCriticalHits: 6,
    CritDamage: 7,
    CritRange: 8,
    CritCooldown: 9,
    CreationPower: 10,
    CreationSpeed: 11,
    AetherNodePower: 12,
    AetherGained: 13,
    LeachingCrit: 14,
    TalentGained: 15,
    Blueprint: 16,
    LifeSpan: 17,
    CoreEmpowerment: 18,
    CoreEnhancement: 19,
    Unlock: 20,
    AssemblerPower: 21,
    AssemblerSpeed: 22,
    StatusEffectUnlock: 23,
};
Zon.EffectIDNames = [];
Enum.createEnum(Zon.EffectID, Zon.EffectIDNames);

//New Effect Ideas:
//Aether On Ball Hit - Gain Aether when a ball hits a block equal to... blockMaxHealth * 2^(level + ((1 + empowerment/10)^0.5 - 1) - maxLevel) + stageAetherBonus * 0.0001 * level, maxLevel: 10