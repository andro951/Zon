"use strict";

Zon.MainButtonsUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super();
    }
    static create(...args) {
        const mainButtonsUIState = new this(...args);
        mainButtonsUIState.bindAll();
        mainButtonsUIState.postConstructor();
        return mainButtonsUIState;
    }
    postConstructor() {
        super.postConstructor();
    }
    setup = () => {
        //super.setup();
    }

    _updateShown = () => {
        //Delete this when implementing MainButtonsUIState.
    }
}

Zon.mainButtonsUIState = Zon.MainButtonsUIState.create();