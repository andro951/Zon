"use strict";

Zon.AetherNodePower = class AetherNodePower {
    constructor() {

    }

    static totalMultiplier = Variable.Dependent.empty();
    static preLoadSetup = () => {
        this.totalMultiplier.replaceEquation(() => Struct.BigNumber.ONE);
    }
}

Zon.Setup.preLoadSetupActions.add(Zon.AetherNodePower.preLoadSetup);