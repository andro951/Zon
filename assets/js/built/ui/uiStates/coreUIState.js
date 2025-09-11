"use strict";

Zon.UI.CoreUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super('coreUI', {
            postConstructorFunc: Zon.UI.CoreUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0xFF7130FF).cssString;
    }
    static _postConstructorFunc(d) {
        
    }
    postLoadSetup() {
        
    }
}

Zon.UI.coreUIState = Zon.UI.CoreUIState.create();