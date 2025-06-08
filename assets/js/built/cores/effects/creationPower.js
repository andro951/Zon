"use strict";

Zon.CreationPower = class CreationPower {
    constructor() {
        
    }

    static totalMultiplier = Variable.Dependent.empty(`TotalCreationPowerMultiplier`);
    static preLoadSetup = () => {
        this.totalMultiplier.replaceEquation(() => Struct.BigNumber.ONE);
    }
}

Zon.Setup.preLoadSetupActions.add(Zon.CreationPower.preLoadSetup);