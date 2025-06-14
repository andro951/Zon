"use strict";

Zon.UI.CloseButtonLinkedUIState = class extends Zon.UI.UIElementDiv {
    constructor(divId, zIndex = 0, parent = Zon.device) {
        super(divId, zIndex, parent);
    }

    show() {
        super.show();
        Zon.closeButtonUIState.setLinkedUIState(this);
    }
}