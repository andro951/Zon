"use strict";

Zon.CoreUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super();
    }
    static create(...args) {
        const coreUIState = new this(...args);
        coreUIState.bindAll();
        coreUIState.postConstructor();
        return coreUIState;
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

Zon.coreUIState = Zon.CoreUIState.create();