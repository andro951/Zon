"use strict";

Zon.MainDisplayUIState = class extends Zon.UI.UIStateDiv {
    constructor() {
        super();
    }
    static create(...args) {
        const mainDisplayUIState = new this(...args);
        mainDisplayUIState.bindAll();
        mainDisplayUIState.postConstructor();
        return mainDisplayUIState;
    }
    postConstructor() {
        super.postConstructor();
    }
}