"use strict";

Zon.AssemblersUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super();
    }
    static create(...args) {
        const assemblersUIState = new this(...args);
        assemblersUIState.bindAll();
        assemblersUIState.postConstructor();
        return assemblersUIState;
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

Zon.assemblersUIState = Zon.AssemblersUIState.create();