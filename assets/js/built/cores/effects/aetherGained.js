"use strict";

Zon.AetherGained = class AetherGained {
    constructor() {
        
    }
    
    static totalMultiplier = Variable.Dependent.empty();
    static preLoadSetup = () => {
        this.totalMultiplier.replaceEquation(() => Struct.BigNumber.ONE);
    }
}

Zon.Setup.preLoadSetupActions.add(Zon.AetherGained.preLoadSetup);