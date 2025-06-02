"use strict";

Zon.UI.CloseButtonLinkedUIState = class extends Zon.UI.UIElementDiv {
    constructor() {
        super();
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
}