"use strict";

Zon.AbilityUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super();
    }
    static create(...args) {
        const abilityUIState = new this(...args);
        abilityUIState.bindAll();
        abilityUIState.postConstructor();
        return abilityUIState;
    }
    postConstructor() {
        super.postConstructor();
    }
    postLoadSetup() {
        
    }

    setup = () => {
        //super.setup();
    }
}

Zon.abilityUIState = Zon.AbilityUIState.create();