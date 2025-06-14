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

    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => 0);
        this.replaceHeight(() => 0);
    }
}

Zon.mainMenuUIState = Zon.MainMenuUIState.create();