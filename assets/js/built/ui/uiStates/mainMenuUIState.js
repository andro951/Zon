"use strict";

Zon.MainMenuUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super();
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

Zon.mainMenuUIState = new Zon.MainMenuUIState();