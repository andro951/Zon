"use strict";

Zon.Effect_BN = class Effect_BN extends Zon.Effect {
    constructor(equation) {
        super(equation);
    }

    postConstructor() {
        super.postConstructor();
    }

    effectStrengthString = () => {
        return this.effectStrength.value.s(2, false, true);
    }
}