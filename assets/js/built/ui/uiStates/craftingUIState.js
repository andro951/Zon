"use strict";

Zon.UI.CraftingUIState = class extends Zon.MainDisplayUIState {
    constructor() {
        super('craftingUI', {
            postConstructorFunc: Zon.UI.CraftingUIState._postConstructorFunc,
        });
        this.element.style.backgroundColor = Struct.Color.fromUInt(0x404040FF).cssString;
    }
    static _postConstructorFunc(d) {
        
    }
    postLoadSetup() {
        
    }
}

Zon.UI.craftingUIState = Zon.UI.CraftingUIState.create();