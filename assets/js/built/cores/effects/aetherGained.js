"use strict";

Zon.AetherGained = class AetherGained extends Zon.Effect_BN {
    constructor(equation) {
        super(equation);
    }

    static create(equation) {
        const effect = new this(equation);
        effect.postConstructor();
        effect.registerEffect();
        return effect;
    }

    registerEffect = () => {
        Zon.AetherGained.totalMultiplier.add(this.effectStrength);
    }

    // public AetherGained(string equationString, params IVariable<Triple>[] variables) : base(equationString, variables) {
    //     RegisterEffect();
    // }

    // #region Register

    // protected void RegisterEffect() {
    //     TotalMultiplier.Add(EffectStrength);
    // }

    // #endregion

    // #region Info and IDs

    // public override EffectID EffectID => EffectID.AetherGained;
    effectID = () => Zon.EffectID.AetherGained;
    // protected override void ConstructEffectLabel() => EffectLabel = new StringVariable((a) => $"Aether Gained x{EffectStrengthString}", EffectStrength);
    constructEffectLabel = () => {
        this.effectLabel = new Variable.Dependent(() => `Aether Gained x${this.effectStrengthString()}`, `AetherGainedEffectLabel`, { this: this });
    }
    // protected override string EffectEquationResultName => "Aether Multiple";
    effectEquationResultName = () => `Aether Multiple`;

    // #endregion

    // #region Strength

    // private static string className => nameof(AetherGained);
    className = () => `AetherGained`;
    static {
        this.totalMultiplier = new Variable.DependentList_BN(Struct.BigNumber.ONE, `TotalAetherGainedMultiplier`, (v, m) => v.multiplyI(m));
    }
    // public static ListVariable_T TotalMultiplier {
    //     get {
    //         if (totalMultiplier == null) {
    //             Product_T product = new(Triple.One, $"All{className}Effects".AddSpaces());
    //             Equation<Triple> equation = new($"{className}Multiplier".AddSpaces(), product);
    //             totalMultiplier = new(product, equation);
    //         }

    //         return totalMultiplier;
    //     }
    // }
    // private static ListVariable_T totalMultiplier = null;

    // #endregion
}