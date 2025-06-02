"use strict";

Zon.StageUIState = class extends Zon.UI.CloseButtonLinkedUIState {
    constructor() {
        super();
    }
    static create(...args) {
        const stageUIState = new this(...args);
        stageUIState.bindAll();
        stageUIState.postConstructor();
        return stageUIState;
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

Zon.stageUIState = Zon.StageUIState.create();