"use strict";

Zon.UI.CloseButtonLinkedUIState = class extends Zon.UI.UIElementDiv {
    constructor(divId, zIndex = 0, parent = Zon.device) {
        super(divId, zIndex, parent);
    }
    static create(...args) {
        const closeButtonLinkedUIState = new this(...args);
        closeButtonLinkedUIState.bindAll();
        closeButtonLinkedUIState.postConstructor();
        return closeButtonLinkedUIState;
    }
    postConstructor() {
        super.postConstructor();
    }

    show() {
        super.show();
        Zon.closeButtonUIState.setLinkedUIState(this);
    }
}