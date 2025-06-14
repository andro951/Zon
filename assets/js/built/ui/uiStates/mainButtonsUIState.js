"use strict";

Zon.MainButtonsUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super();
    }
    setup() {
        super.setup();

        this.replaceLeft(() => 0);
        this.replaceTop(() => 0);
        this.replaceWidth(() => 0);
        this.replaceHeight(() => 0);
    }

    _updateShown = () => {
        //Delete this when implementing MainButtonsUIState.
    }
}

Zon.mainButtonsUIState = Zon.MainButtonsUIState.create();