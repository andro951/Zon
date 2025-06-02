"use strict";

Zon.StageUIState = class extends Zon.CloseButtonLinkedUIState {
    constructor() {
        super();
    }

    postLoadSetup() {
        
    }

    setup = () => {
        //super.setup();
    }
}

Zon.stageUIState = new Zon.StageUIState();