"use strict";

Zon.MainMenuUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super();
    }
    static create(...args) {
        const mainMenuUIState = new this(...args);
        mainMenuUIState.bindAll();
        mainMenuUIState.postConstructor();
        return mainMenuUIState;
    }
    postConstructor() {
        super.postConstructor();
    }
    // construct = () => {//Not supposed to be here?
    //     super.construct();
    // }

    // destruct = () => {
    //     super.destruct();
    // }

    _updateShown = () => {
        //Delete this when implementing MainMenuUIState.
    }

    setup = () => {
        //super.setup();
    }
}

Zon.mainMenuUIState = Zon.MainMenuUIState.create();