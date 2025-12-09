"use strict";

Zon.UI.UpgradesUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super('upgradesUI', {
            postConstructorFunc: Zon.UI.UpgradesUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    static _postConstructorFunc(d) {
        
    }
    postLoadSetup() {
        
    }
}

Zon.UI.upgradesUIState = Zon.UI.UpgradesUIState.create();